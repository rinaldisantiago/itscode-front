// /js/presentation/update-user.js
import { userRepository } from "../repository/userRepository.js";

// ---------- Helpers de errores ----------
function ensureErrorNode(inputEl) {
  let node = inputEl.nextElementSibling;
  if (!node || !node.classList.contains("field-error")) {
    node = document.createElement("small");
    node.className = "field-error";
    inputEl.after(node);
  }
  return node;
}
function setFieldError(inputEl, message) {
  const group = inputEl.closest(".input-group");
  if (group) group.classList.add("invalid");
  ensureErrorNode(inputEl).textContent = message || "";
}
function clearFieldError(inputEl) {
  const group = inputEl.closest(".input-group");
  if (group) group.classList.remove("invalid");
  const node = inputEl.nextElementSibling;
  if (node?.classList.contains("field-error")) node.textContent = "";
}
function clearAllErrors(form) {
  form.querySelectorAll(".input-group.invalid").forEach(g => g.classList.remove("invalid"));
  form.querySelectorAll(".field-error").forEach(n => (n.textContent = ""));
}
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

// ---------- Mapeo refs ----------
const form = document.getElementById("update-form");
const refs = {
  nombre:  form.querySelector('input[name="nombre"]'),
  email:   form.querySelector('input[name="email"]'),
  usuario: form.querySelector('input[name="usuario"]'),
  pass:    form.querySelector('input[name="password"]'),
  file:    form.querySelector('input[name="image"]'),
  // opcional: si agregás un hidden con URL real de avatar
  imageUrlHidden: form.querySelector('input[name="imageUrl"]'),
};

// ---------- Preview de imagen (opcional) ----------
let previewImg;
function ensurePreviewNode() {
  if (!previewImg) {
    previewImg = document.createElement("img");
    previewImg.alt = "Preview";
    previewImg.style.maxWidth = "120px";
    previewImg.style.display = "block";
    previewImg.style.marginTop = "8px";
    // lo coloca después del input file
    refs.file?.after(previewImg);
  }
  return previewImg;
}
refs.file?.addEventListener("change", () => {
  clearFieldError(refs.file);
  const file = refs.file.files?.[0];
  if (!file) { if (previewImg) previewImg.src = ""; return; }

  // Validaciones de archivo
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    setFieldError(refs.file, "Formato inválido. Solo JPG/PNG/WebP.");
    refs.file.value = "";
    return;
  }
  const maxMB = 2;
  if (file.size > maxMB * 1024 * 1024) {
    setFieldError(refs.file, `La imagen no debe superar ${maxMB} MB.`);
    refs.file.value = "";
    return;
  }

  // Preview local
  const url = URL.createObjectURL(file);
  ensurePreviewNode().src = url;

  // IMPORTANTE: esto NO sube el archivo.
  // Si tenés una ruta de upload, ahí subimos y luego seteamos refs.imageUrlHidden.value = "<url-subida>";
});

// ---------- Obtener id de la URL ----------
function getIdFromQuery() {
  const qs = new URLSearchParams(location.search);
  return qs.get("id") || qs.get("Id") || "";
}

// ---------- Precargar datos del usuario ----------
async function preload() {
  const id = getIdFromQuery();
  if (!id) return; // si no hay id, el form quedará vacío

  try {
    const data = await userRepository.getById(id);
    // tu GET devuelve: { fullName, userName, email, urlAvatar }
    refs.nombre.value  = data?.fullName ?? "";
    refs.usuario.value = data?.userName ?? "";
    refs.email.value   = data?.email ?? "";

    if (data?.urlAvatar) {
      ensurePreviewNode().src = data.urlAvatar;
      // si usás hidden para enviar urlAvatar:
      if (refs.imageUrlHidden) refs.imageUrlHidden.value = data.urlAvatar;
    }
  } catch (e) {
    console.error("No se pudo precargar usuario", e);
    Swal.fire({ icon: "error", title: "Error", text: "No se pudo cargar el usuario." });
  }
}
preload();

// ---------- Validaciones ----------
function validate() {
  let ok = true;

  // Nombre
  if (!refs.nombre.value.trim()) {
    setFieldError(refs.nombre, "Ingresá el nombre completo.");
    ok = false;
  } else {
    clearFieldError(refs.nombre);
  }

  // Email
  const email = refs.email.value.trim();
  if (!email) {
    setFieldError(refs.email, "Ingresá el correo.");
    ok = false;
  } else if (!isEmail(email)) {
    setFieldError(refs.email, "Formato de correo inválido.");
    ok = false;
  } else {
    clearFieldError(refs.email);
  }

  // Usuario
  const usuario = refs.usuario.value.trim();
  if (!usuario) {
    setFieldError(refs.usuario, "Ingresá el nombre de usuario.");
    ok = false;
  } else if (usuario.length < 3) {
    setFieldError(refs.usuario, "Mínimo 3 caracteres.");
    ok = false;
  } else {
    clearFieldError(refs.usuario);
  }

  // Password (opcional): solo valida si lo completó
  if (refs.pass.value && refs.pass.value.length < 8) {
    setFieldError(refs.pass, "La contraseña debe tener al menos 8 caracteres.");
    ok = false;
  } else {
    clearFieldError(refs.pass);
  }

  // Archivo (opcional): ya validamos en change, acá solo limpiamos si no hay
  if (refs.file && !refs.file.value) {
    clearFieldError(refs.file);
  }

  return ok;
}

// Validación en vivo
[refs.nombre, refs.email, refs.usuario, refs.pass].forEach(el => {
  el?.addEventListener("input", validate);
});

// ---------- Submit ----------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearAllErrors(form);

  if (!validate()) return;

  const id = getIdFromQuery();
  if (!id) {
    Swal.fire({ icon: "warning", title: "Falta el ID", text: "No se encontró el id del usuario en la URL." });
    return;
  }

  // Armado del DTO para PUT (tu backend espera camelCase):
  const body = {
    fullName:  refs.nombre.value.trim(),
    userName:  refs.usuario.value.trim(),
    email:     refs.email.value.trim(),
    // password: solo lo mandamos si lo completó
    ...(refs.pass.value ? { password: refs.pass.value } : {}),
    // urlAvatar: si tenés un input hidden con la URL real, lo usamos; si no, mandamos el valor actual si lo precargaste
    ...(refs.imageUrlHidden?.value ? { urlAvatar: refs.imageUrlHidden.value } : {}),
  };

  try {
    Swal.showLoading();
    const resp = await userRepository.update(id, body);
    // resp esperado: { fullName, userName, email, urlAvatar }
    Swal.fire({ icon: "success", title: "Actualizado", text: "Los datos se guardaron correctamente.", timer: 1500, showConfirmButton: false });
    // Redirigir si querés:
    // setTimeout(()=> location.href = "./my-profile.html", 400);
  } catch (err) {
    console.error("Update error:", err);
    const msg = (err?.message || "").toLowerCase();

    // Marcamos errores de backend por campo si podemos inferir
    if (msg.includes("email")) {
      setFieldError(refs.email, "Ese email ya está en uso.");
    } else if (msg.includes("user") || msg.includes("username")) {
      setFieldError(refs.usuario, "Ese nombre de usuario ya existe.");
    } else {
      Swal.fire({ icon: "error", title: "No se pudo actualizar", text: err.message });
    }
  } finally {
    Swal.close();
  }
});
