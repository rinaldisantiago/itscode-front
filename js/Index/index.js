const form = document.getElementById("login-form");
const inputUsername = document.getElementById("username");
const inputPassword = document.getElementById("password");

form.addEventListener("submit", evt => {
    evt.preventDefault();
    const obj = loginRequest();

    IndexRepository.create(obj, successfull);
})

const successfull = (obj) => {
    window.location.href = "/html/wall.html";
}

const loginRequest = () => {
    return {
        username: inputUsername.value,
        password: inputPassword.value
    }
}