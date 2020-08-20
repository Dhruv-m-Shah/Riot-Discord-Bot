window.onload = function () {
if (/Edge/.test(navigator.userAgent)) {
  document.getElementById("landingVid").style.visibility = "hidden";
  document.getElementById("frontPageImage").style.visibility = "visible";
  document.getElementById("title1").style.color = "#4f99e3";
  document.getElementById("button").style.backgroundColor = "#4f99e3";
  document.getElementById("button").style.borderColor = "#4f99e3";
}
  var vid = document.getElementById("landingVid");

  function playVid() {
    vid.play();
  }
  vid.play();
};
