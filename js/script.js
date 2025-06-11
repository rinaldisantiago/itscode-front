const toggleButton = document.querySelector('.menu-toggle');
const nav = document.getElementById('nav-links');

toggleButton.addEventListener('click', () => {
  nav.classList.toggle('open');
});
