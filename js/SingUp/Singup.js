class UserCreate {
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
        <div class="input-group">
        <i class="fas fa-user" aria-hidden="true"></i>
        <input type="text" name="username" placeholder="Nombre Completo">
        </div>
        <div class="input-group">
        <i class="fas fa-envelope" aria-hidden="true"></i>
        <input type="email" name="email" placeholder="Correo Electrónico">
        </div>
        <div class="input-group">
        <i class="fas fa-user" aria-hidden="true"></i>
        <input type="text" name="nickname" placeholder="Nombre de Usuario">
        </div>
        <div class="input-group">
        <i class="fas fa-lock" aria-hidden="true"></i>
        <input type="password" name="password" placeholder="Contraseña">
        </div>
        <a href="../index.html" class="btn">Registrarse</a>
        </form>
        `;  
        return userCreate;
    }
}
                    
      

