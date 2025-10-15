// /js/repository/userRepository.js
import { apiFetch } from "../api/apiFetch.js";
import { User } from "../models/User.js";

const BASE = "/User"; // ← Route("User")

function jsonConfig(method, body) {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  };
}

export const userRepository = {
  // POST CreateUser
  async create(user /* User */) {
    const dto = user.toCreateDTO(); // { FullName, Username, Email, Password, URLAvatar, RoleId }
    // Respuesta esperada: { message: "User created successfully" }
    return await apiFetch(`${BASE}`, jsonConfig("POST", dto));
  },

  // GET getUser
  // Tu action está decorado con [HttpGet("{id}")] pero recibe un DTO [FromQuery].
  // Probamos primero con route + query, y si falla, solo query.
  async getById(id) {
    try {
      return await apiFetch(`${BASE}/${encodeURIComponent(id)}?Id=${encodeURIComponent(id)}`, { method: "GET" });
    } catch {
      return await apiFetch(`${BASE}?Id=${encodeURIComponent(id)}`, { method: "GET" });
    }
  },

  // PUT UpdateUser (id por query)
  async update(id, partial /* User o POJO {fullName,userName,email,password,urlAvatar} */) {
    const dto = partial.toUpdateDTO ? partial.toUpdateDTO() : partial;
    // Respuesta: { fullName, userName, email, urlAvatar }
    return await apiFetch(`${BASE}?id=${encodeURIComponent(id)}`, jsonConfig("PUT", dto));
  },

  // DELETE DeleteUser (id por query)
  async remove(id) {
    // Respuesta: { Message: "User deleted successfully" }
    return await apiFetch(`${BASE}?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  },

  // GET Login (usuario/clave en la URL según tu atributo)
  async login(userName, password) {
    try {
      return await apiFetch(`${BASE}/${encodeURIComponent(userName)}/${encodeURIComponent(password)}`, { method: "GET" });
    } catch {
      // Fallback si el atributo cambia a query
      return await apiFetch(`${BASE}?userName=${encodeURIComponent(userName)}&password=${encodeURIComponent(password)}`, { method: "GET" });
    }
  }
};
