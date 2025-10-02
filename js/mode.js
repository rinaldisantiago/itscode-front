const checkMode = document.getElementById("mode_button");
const bodyElement = document.getElementsByTagName('body')[0];

let objetoModo = JSON.parse(localStorage.getItem('mode'));

objetoModo.mode = objetoModo.mode || 'dark';

if(objetoModo?.mode === 'light') {
    checkMode.checked = true;
} else {
    checkMode.checked = false;
}

bodyElement.classList.add(objetoModo.mode);

checkMode.addEventListener('change', (evt) => {
    let value = checkMode.checked;
    if(value == true) {
        objetoModo.mode = 'light';
    } else {
        objetoModo.mode = 'dark';
    }
    localStorage.setItem('mode', JSON.stringify(objetoModo));

    bodyElement.classList.remove("light");
    bodyElement.classList.remove("dark");

    bodyElement.classList.add(value ? "light" : "dark");

    let usr = {
        nombre: ''
    };

    alert(usr?.nombre ?? 'sin nombre');
});

const sumar = (...array) => {
    let total = 0;
    let i = 0;
    for(i = 0; i < array.length; i+=1)
    {
        total = total + array[i];
    }

    return total;
};

console.log(sumar(1, 2, 3));