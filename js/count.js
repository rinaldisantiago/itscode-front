const usersCount = document.getElementById('users_online');

//TODO: programar funcion fetch para llamar al backend y obtener conteo de usuarios conectados

let numero = 1;

const funcionCallback = () => {
    usersCount.innerText = numero++;
    // if(numero > 5) clearInterval(interval);
}

let interval;

const ejecutarFuncion = () => {
    interval = setInterval(funcionCallback, 2000);
};

ejecutarFuncion();