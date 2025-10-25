// js/presentation/SignUpPresentation.js
import { User } from "../User.js";
import SignUpRepository from "../repository/SignUpRepository.js";

const form = document.getElementById("signUpForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userName = document.getElementById("username")?.value ?? "";
  const password = document.getElementById("password")?.value ?? "";

  const user = new User(userName, password);

  try {
    const res = await SignUpRepository.signUp(user);
    console.log("Signup OK:", res);
    // Swal.fire({ icon:'success', title:'Registrado!' });
  } catch (err) {
    console.error("Signup ERROR:", err);
    // El fetch.js ya muestra el Swal de error HTTP o de conexión.
  }
});
