// js/repository/SignUpRepository.js
import { apiFetch, jsonConfig } from "../fetch.js";

const BASE = "/User";

const SignUpRepository = {
  // 🔹 GET /User/{idUser}
  async getById(idUser) {
    return await apiFetch(`${BASE}/${encodeURIComponent(idUser)}`, { method: "GET" });
  },

  // 🔹 GET /User/all
  async getAll() {
    return await apiFetch(`${BASE}/all`, { method: "GET" });
  },

  // 🟡 Placeholder: POST /User  (si más adelante agregás signup)
  async signUp(user) {
    return await apiFetch(`${BASE}`, jsonConfig("POST", user));
  },

  // 🟡 Placeholder: PUT /User/{idUser}
  async update(idUser, partialUser) {
    const dto = partialUser?.toUpdateDTO ? partialUser.toUpdateDTO() : partialUser;
    return await apiFetch(`${BASE}/${encodeURIComponent(idUser)}`, jsonConfig("PUT", dto));
  },

  // 🟡 Placeholder: DELETE /User/{idUser}
  async remove(idUser) {
    return await apiFetch(`${BASE}/${encodeURIComponent(idUser)}`, { method: "DELETE" });
  },

  // 🟡 Placeholder: GET /User/login?userName=...&password=...
  async login(userName, password) {
    return await apiFetch(
      `${BASE}/login?userName=${encodeURIComponent(userName)}&password=${encodeURIComponent(password)}`,
      { method: "GET" }
    );
  },
};

export default SignUpRepository;
