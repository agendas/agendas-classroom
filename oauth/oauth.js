window.addEventListener("load", function() {
  var token = new URL(document.location).searchParams.get("access_token");
  var error = new URL(document.location).searchParams.get("error");
  var state = new URL(document.location).searchParams.get("state");
  if (error === "access_denied") {
    window.close();
  } else if (!error) {
    console.log(token);
    console.log(state);
    new Promise(function(resolve, reject) {
      chrome.storage.local.get("agendasClassroomState", function(result) {
        result ? resolve(result.agendasClassroomState) : reject(runtime.lastError);
      });
    }).then(function(storedState) {
      chrome.storage.local.remove("agendasClassroomState");
      if (parseFloat(state) === storedState && token) {
        fetch("https://api.agendas.co/api/v1/email", {
          method: "GET",
          headers: {Authorization: "Bearer " + token}
        }).then(function(response) {
          if (response.status === 200) {
            return response.json();
          } else {
            throw new Error("Auth error");
          }
        }).then(function(json) {
          if (json.email) {
            chrome.storage.local.set({agendasClassroomToken: token, agendasClassroomEmail: json.email});
            window.close();
          }
        });
      }
    }).catch(function(e) {
      console.log(e);
    });
  }
});
