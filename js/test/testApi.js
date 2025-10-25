import SignUpRepository from "../repository/SignUpRepository.js";

(async () => {
  console.log("Probando conexión con API...");
  try {
    const users = await SignUpRepository.getAll();
    console.log("Usuarios:", users);
  } catch (err) {
    console.error("Error:", err);
  }
})();
