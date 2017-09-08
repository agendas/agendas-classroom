console.log("Agendas for Classroom active");
window.addEventListener("load", function() {
  var iframe = document.createElement("iframe");
  iframe.setAttribute("src", "chrome-extension://pkhlhmcjmcnhggifllngddeofgajamgj/widget/widget.html");

  document.body.insertBefore(iframe, document.body.childNodes[0]);
});
