angular.module("agendasClassroomPopup", ["ngMaterial"])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('green')
      .accentPalette('amber');
  })
  .controller("AgendasClassroomPopupController", function($scope, $http) {
    $scope.openAgendas = function() {
      chrome.tabs.create({url: "https://app.agendas.co"});
    };

    $scope.signIn = function() {
      var state = Math.random();
      chrome.storage.local.set({agendasClassroomState: state});
      chrome.tabs.create({url: "https://api.agendas.co/api/v1/authorize?response_type=token&client_id=agendasforclassroom&scopes=email,agenda-read,agenda-write&redirect_url=chrome-extension%3A%2F%2Fpkhlhmcjmcnhggifllngddeofgajamgj%2Foauth%2Foauth.html&state=" + state});
    };

    $scope.signOut = function() {
      chrome.storage.local.remove("agendasClassroomToken");
      $scope.signedIn = false;
      $scope.signedOut = true;
    };

    chrome.storage.local.get("agendasClassroomToken", function(result) {
      if (result.agendasClassroomToken) {
        $http.defaults.headers.common.Authorization = "Bearer " + result.agendasClassroomToken;
        $http.get("https://api.agendas.co/api/v1/email").then(function(result) {
          $scope.signedIn = true;
          $scope.email = result.data.email;
        }).catch(function(e) {
          if (!e.data) {
            $scope.offline = true;
          } else {
            $scope.signedOut = true;
          }
        });
      } else {
        $scope.signedOut = true;
      }
      $scope.$digest();
    });
  })
