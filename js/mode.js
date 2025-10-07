const checkMode = document.getElementById('mode_button');
const bodyElement = document.getElementsByTagName('body')[0];

let mode = localStorage.getItem('mode');
mode = mode || 'dark';

mode === 'light' ? checkMode.checked = true : checkMode.checked = false;

bodyElement.classList.add(mode);

checkMode.addEventListener('change', (evt) => {
    let value = checkMode.checked;
    if(value) localStorage.setItem('mode', 'light');
    else localStorage.setItem('mode', 'dark');

    bodyElement.classList.remove(value ? 'dark' : 'light');
    bodyElement.classList.add(value ? 'light' : 'dark');
})
