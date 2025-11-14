const session = JSON.parse(localStorage.getItem("userSession"));
const loginLink = document.querySelector("#loginLink");
const logoutBtn = document.querySelector("#logoutBtn");

if (session && session.isLoggedIn === true) {
  if (loginLink) loginLink.style.display = "none";
  if (logoutBtn) logoutBtn.style.display = "block";
} else {
  if (loginLink) loginLink.style.display = "block";
  if (logoutBtn) logoutBtn.style.display = "none";
}

