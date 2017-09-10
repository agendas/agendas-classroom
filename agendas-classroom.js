console.log("Agendas for Classroom active");
window.addEventListener("load", function() {
  document.arrive(".qhnNic .Y93Wzb", function() {
    var assignment = this.parentElement.parentElement;

    var button = document.createElement("button");
    button.innerText = "Add to Agendas";
    button.classList.add("agendasforclassroom-button");
    button.addEventListener("click", function(element) {
      // Grab data.
      var details = element.target.parentElement.getElementsByClassName("hDheod")[0];

      var classroom = new URL(document.location).pathname.replace(/(\/u\/[0-9]+\/c\/|\/t\/.+)/g, "");

      var deadlineElement = details.getElementsByClassName("IMvYId")[0];
      var deadline    = deadlineElement && deadlineElement.innerText;

      var nameElement = details.getElementsByClassName("nk37z")[0];
      var name        = nameElement && nameElement.innerText;

      var url = new URL("chrome-extension://pkhlhmcjmcnhggifllngddeofgajamgj/widget/widget.html")
      url.searchParams.append("classroom", classroom);
      if (deadline) {
        url.searchParams.append("deadline", deadline);
      }
      if (name) {
        url.searchParams.append("name", name);
      }

      document.body.classList.add("agendasforclassroom-modal-showing");

      var backdrop = document.createElement("div");
      backdrop.classList.add("agendasforclassroom-modal-backdrop");
      document.body.appendChild(backdrop);

      var modal = document.createElement("div");
      modal.classList.add("agendasforclassroom-modal");

      var iframe = document.createElement("iframe");
      iframe.setAttribute("src", url.toString());
      modal.appendChild(iframe);

      var close = document.createElement("button");
      close.classList.add("agendasforclassroom-close");
      close.innerText = "CLOSE";
      close.addEventListener("click", function() {
        document.querySelectorAll(".agendasforclassroom-modal, .agendasforclassroom-modal-backdrop, .agendasforclassroom-close").forEach(function(element) {
          element.parentNode.removeChild(element);
        });

        document.body.classList.remove("agendasforclassroom-modal-showing");
      });
      modal.appendChild(close);

      document.body.appendChild(modal);
    });

    assignment.appendChild(button);
  });
});
