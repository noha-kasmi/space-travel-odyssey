"use strict";

const form = document.querySelector("#loginForm");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const emailError = document.querySelector("#emailError");
const passwordError = document.querySelector("#passwordError");
const successMessage = document.querySelector("#successMessage");

const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

function validateInput(input, regex, errorElement, messageErreur) {
  if (!regex.test(input.value.trim())) {
    input.classList.add("border-red-500");
    errorElement.textContent = messageErreur;
    return false;
  } else {
    input.classList.remove("border-red-500");
    errorElement.textContent = "";
    return true;
  }
}

emailInput.addEventListener("input", () => {
  validateInput(emailInput, emailRegex, emailError, "Format d'email invalide : exemple@gmail.com");
});

passwordInput.addEventListener("input", () => {
  validateInput(
    passwordInput,
    passwordRegex,
    passwordError,
    "Le mot de passe doit contenir 8 caractères minimum, une majuscule et un chiffre"
  );
});

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const isEmailValid = validateInput(
    emailInput,
    emailRegex,
    emailError,
    "Format d'email invalide"
  );

  const isPasswordValid = validateInput(
    passwordInput,
    passwordRegex,
    passwordError,
    "Mot de passe trop faible"
  );

  if (isEmailValid && isPasswordValid) {
    successMessage.textContent = "Connexion réussie Bienvenue à bord !";
    localStorage.setItem(
      "userSession",
      JSON.stringify({
        email: emailInput.value,
        isLoggedIn: true,
      })
    );

    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);


    form.reset();
  } else {
    successMessage.textContent = "";
  }
});
