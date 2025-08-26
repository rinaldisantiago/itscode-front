class UpdateUserCreate {
    constructor() {
        this.text = "";
        this.email = "";
        this.text = "";
        this.password = "";
    }
    getNode = () => {
        const usercreate = document.createElement("section");
        usercreate.className = "box-section";
        usercreate.innerHTML = `
        return userCreate;
        <form id="updateuser-form">
          <div class="input-group">
              <i class="fas fa-user" aria-hidden="true"></i>
              <input type="text" name="nombre" placeholder="Nombre Completo" />
         </div>
          <div class="input-group">
             <i class="fas fa-envelope" aria-hidden="true"></i>
              <input type="email" name="email" placeholder="Correo Electrónico" />
         </div>
          <div class="input-group">
            <i class="fas fa-user" aria-hidden="true"></i>
            <input type="text" name="usuario" placeholder="Nombre de Usuario" />
         </div>
          <div class="input-group">
              <i class="fas fa-lock" aria-hidden="true"></i>
             <input type="password" name="password" placeholder="Contraseña" />
         </div>
          <div class="input-group">
              <i class="fas fa-image" aria-hidden="true"></i>
              <input type="file" name="image" />
          </div>
          <div class="button-group">
            <button type="submit" class="btn-update">Actualizar</button>
            <a href="./my-profile.html" class="btn-cancel">Cancelar</a>
          </div>
        </form>
        `;  
        return userCreate;
    }
}
