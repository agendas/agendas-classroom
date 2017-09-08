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
      if (parseFloat(state) === storedState && token) {
        chrome.storage.local.set({agendasClassroomToken: token});
        chrome.storage.local.remove("agendasClassroomState");
        window.close();
      }
    }).catch(function(e) {
      console.log(e);
    });
  }
});
