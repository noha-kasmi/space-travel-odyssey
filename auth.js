const loginForm = document.getElementById("loginForm");
const userInfo = document.getElementById("userInfo");
const logoutBtn = document.getElementById("logoutBtn");


window.addEventListener("load", () => {
  const user = localStorage.getItem("user");
  if (user) {
    showUser(JSON.parse(user));
  }
});


function showUser(user) {
  userInfo.textContent = `Bonjour, ${user.email}`;
  logoutBtn.style.display = "inline-block";
  loginForm.style.display = "none";
}


loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;


  if (email && password) {
    const user = { email: email };
    localStorage.setItem("user", JSON.stringify(user));
    showUser(user);
  } else {
    alert("Veuillez entrer email et mot de passe");
  }
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("user");
  userInfo.textContent = "";
  logoutBtn.style.display = "none";
  loginForm.style.display = "block";
});