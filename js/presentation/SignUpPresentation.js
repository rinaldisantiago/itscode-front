/* 
const form = document.getElementById("registration-form");
const inputName = document.getElementById("input-name");


form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const dataForm = new FormData(form);
    const dataUser = {
        fullName: dataForm.get("username"),
        email: dataForm.get("email"),
        userName: dataForm.get("nickname"),
        password: dataForm.get("password")
    };

    const data = updateUser(dataUser, (data) => {
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: data.message || 'Tu cuenta ha sido creada con éxito.',
        });
        //TODO: Guardar en localstorage el id del usuario logueado.
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    });
});
 */

// /js/presentation/signup.js
import { userRepository } from "../repository/userRepository.js";
import { User } from "../User.js";

const form = document.getElementById("registration-form");
const btn  = document.getElementById("btn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fd        = new FormData(form);
  const fullName  = (fd.get("username") || "").trim();  // HTML: name="username" → DTO: FullName
  const email     = (fd.get("email") || "").trim();     // Email
  const userName  = (fd.get("nickname") || "").trim();  // HTML: name="nickname" → DTO: Username
  const password  = (fd.get("password") || "");         // Password

  // Validaciones mínimas
  if (!fullName || !email || !userName || !password) {
    Swal.fire({ icon: "warning", title: "Campos incompletos", text: "Completá todos los campos." });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    Swal.fire({ icon: "warning", title: "Email inválido", text: "Ingresá un correo válido." });
    return;
  }
  if (password.length < 8) {
    Swal.fire({ icon: "warning", title: "Contraseña débil", text: "Mínimo 8 caracteres." });
    return;
  }

  // Si tu backend exige URLAvatar/RoleId, podés setear defaults acá:
  const urlAvatar = null; // p.ej. "https://…/default.png"
  const roleId    = null; // p.ej. 2

  const user = new User({ fullName, userName, email, password, urlAvatar, roleId });

  try {
    btn.disabled = true;
    Swal.showLoading();

    const resp = await userRepository.create(user);
    // Tu POST devuelve: { message: "User created successfully" }
    const okMsg = resp?.message || "Usuario creado";

    Swal.fire({
      icon: "success",
      title: "Registro exitoso",
      text: okMsg,
      timer: 2000,
      showConfirmButton: false
    });

    form.reset();
  } catch (err) {
    console.error("CreateUser error:", err);
    // apiFetch ya muestra alerta, así que acá no duplicamos
  } finally {
    Swal.close();
    btn.disabled = false;
  }
});
