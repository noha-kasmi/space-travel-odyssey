const session = JSON.parse(localStorage.getItem("userSession"));

if (!session || session.isLoggedIn !== true) {
  window.location.href = "login.html";
}
