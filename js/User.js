// /js/models/User.js
export class User {
  constructor({ fullName, userName, email, password, urlAvatar = null, roleId = null }) {
    this.fullName  = fullName;   // FullName (POST) / fullName (PUT)
    this.userName  = userName;   // Username (POST) / userName (PUT)
    this.email     = email;      // Email/email
    this.password  = password;   // Password/password
    this.urlAvatar = urlAvatar;  // URLAvatar/urlAvatar
    this.roleId    = roleId;     // RoleId (solo POST)
  }

  // Para CreateUser → coincide con PostUserRequestDTO (¡ojo a las mayúsculas!)
  toCreateDTO() {
    return {
      FullName:  this.fullName?.trim(),
      Username:  this.userName?.trim(),
      Email:     this.email?.trim(),
      Password:  this.password,
      URLAvatar: this.urlAvatar,    // si no tenés, va null
      RoleId:    this.roleId        // si no tenés, va null
    };
  }

  // Para UpdateUser → PutUserRequestDTO (camelCase)
  toUpdateDTO() {
    return {
      fullName:  this.fullName?.trim(),
      userName:  this.userName?.trim(),
      email:     this.email?.trim(),
      password:  this.password,
      urlAvatar: this.urlAvatar
    };
  }
}
