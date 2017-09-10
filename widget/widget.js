angular.module("agendasClassroom", ["ngMaterial"])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('amber')
      .accentPalette('green')
      .warnPalette('red')
  })
  .controller("AgendasClassroomController", function($scope, $http) {
    var query     = new URL(document.location).searchParams;
    var classroom = query.get("classroom");
    var token     = null;
    var defaults  = null;

    $scope.agenda = null;
    $scope.tag    = null;

    $scope.name = query.get("name");

    var parsed = query.get("deadline") && chrono.parse(query.get("deadline"));
    if (parsed) {
      var deadline = parsed[0].start.date();
      if (parsed[0].start.isCertain("weekday") && !parsed[0].start.isCertain("day")) {
        deadline.setDate(deadline.getDate() + 7);
      }
      if (parsed[0].start.isCertain("month") && !parsed[0].start.isCertain("year")) {
        deadline.setFullYear(new Date().getFullYear());
      }
      $scope.deadline = deadline;
      if (parsed[0].start.isCertain("hour")) {
        $scope.time = deadline.getHours() * 60 + deadline.getMinutes();
      }
    }

    $scope.signIn = function() {
      var state = Math.random();
      chrome.storage.local.set({agendasClassroomState: state});
      window.open(
        "https://api.agendas.co/api/v1/authorize?response_type=token&client_id=agendasforclassroom&scopes=email,agenda-read,agenda-write&redirect_url=chrome-extension%3A%2F%2Fpkhlhmcjmcnhggifllngddeofgajamgj%2Foauth%2Foauth.html&state=" + state,
        "agendas-classroom-login"
      );
    };

    var processToken = function(token) {
      if (token) {
        $scope.signedIn  = false;
        $scope.signedOut = false;
        $http.defaults.headers.common.Authorization = "Bearer " + token;
        chrome.storage.local.get(["agendasClassroomDefaults", "agendasClassroomEmail"], function(result) {
          defaults = result.agendasClassroomDefaults;
          if (defaults && defaults.email === result.agendasClassroomEmail) {
            if (defaults[classroom]) {
              $http.get("https://api.agendas.co/api/v1/agendas/" + defaults[classroom].agenda).then(function(response) {
                $scope.agenda    = response.data;
                $scope.agenda.id = defaults[classroom].agenda;
                $scope.agendas   = [$scope.agenda];
                $scope.defaultAgenda = $scope.agenda;
                if (defaults[classroom].tag) {
                  return $http.get("https://api.agendas.co/api/v1/tags/" + defaults[classroom].agenda + "/" + defaults[classroom].tag);
                }
              }).then(function(response) {
                if (response) {
                  $scope.tag    = response.data;
                  $scope.tag.id = defaults[classroom].tag;
                  $scope.tags   = [$scope.tag];
                  $scope.defaultTag = $scope.tag;
                }
                $scope.signedIn = true;
              }).catch(function(response) {
                if (response.status === 403 || response.status === 404) {
                  $scope.signedIn = true;
                  delete defaults[classroom];
                  chrome.storage.local.set({agendasClassroomDefaults: defaults});
                } else if (response.data) {
                  $scope.signedOut = true;
                } else {
                  $scope.offline = true;
                }
              });
              return;
            }
          } else if (defaults) {
            defaults = null;
            chrome.storage.local.remove("agendasClassroomDefaults");
          }

          $http.get("https://api.agendas.co/api/v1/agendas").then(function(response) {
            $scope.agendas  = response.data;
            $scope.signedIn = true;
          }).catch(function(response) {
            if (response.data) {
              $scope.signedOut = true;
            } else {
              $scope.offline = true;
            }
          });
        });
      } else {
        $scope.signedOut = true;
      }
    };

    chrome.storage.local.get("agendasClassroomToken", function(result) {
      processToken(result.agendasClassroomToken);
      $scope.$digest();
    });

    chrome.storage.onChanged.addListener(function(changes, areaName) {
      if (areaName === "local" && changes.agendasClassroomToken) {
        processToken(changes.agendasClassroomToken.newValue);
        $scope.$digest();
      }
    });

    $scope.loadAgendas = function() {
      if (!$scope.agendasLoaded) {
        return $http.get("https://api.agendas.co/api/v1/agendas").then(function(response) {
          $scope.agendas = response.data;
          $scope.agendasLoaded = true;
        });
      }
    };

    $scope.changeAgendas = function() {
      $scope.tags = null;
      $scope.tag  = undefined;
    };

    $scope.loadTags = function() {
      if (!$scope.tagsLoaded) {
        return $http.get("https://api.agendas.co/api/v1/tags/" + $scope.agenda.id).then(function(response) {
          $scope.tags = response.data;
          $scope.tagsLoaded = true;
        });
      }
    };

    $scope.save = function() {
      $scope.saving = true;

      var deadline = $scope.deadline;
      if (deadline) {
        deadline.setHours(Math.floor(($scope.time || 0) / 60));
        deadline.setMinutes(Math.floor(($scope.time || 0) % 60));
        deadline.setSeconds(0);
        deadline.setMilliseconds(0);
      }

      $http.post("https://api.agendas.co/api/v1/tasks/" + $scope.agenda.id, {
        name: $scope.name,
        deadline: deadline,
        deadlineTime: $scope.deadline && $scope.time !== undefined,
        tags: $scope.tag && [$scope.tag.id]
      }, {
        headers: {"Content-Type": "application/json; charset=utf-8"}
      }).then(function(response) {
        chrome.storage.local.get(["agendasClassroomDefaults", "agendasClassroomEmail"], function(result) {
          var defaults = result.agendasClassroomDefaults || {email: result.agendasClassroomEmail};
          defaults[classroom] = {
            agenda: $scope.agenda.id,
            tag: $scope.tag && $scope.tag.id
          };
          chrome.storage.local.set({agendasClassroomDefaults: defaults});
        });
        $scope.saving = false;
        $scope.done   = true;
      }).catch(function(response) {
        console.log(response);
        $scope.saving = false;
      });
    };

    $scope.openAgenda = function(agenda) {
      window.open("https://app.agendas.co/#/" + agenda, "_blank");
    };
  })
