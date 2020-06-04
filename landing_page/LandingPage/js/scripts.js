window.onload = function () {
if (/Edge/.test(navigator.userAgent)) {
  document.getElementById("landingVid").style.visibility = "hidden";
  document.getElementById("frontPageImage").style.visibility = "visible";
}
  var vid = document.getElementById("landingVid");

  function playVid() {
    vid.play();
  }
  vid.play();
};
