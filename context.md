- Estamos realizando una red social, con un fornt en html, css y js.
- El backend esta desarrolado con .net, entity framework, DAO, DTO.
- Todo el codigo aplica los principios de clean code.
- Utilizamos el patron de diseño de abstract factory.
- El backend posee 3 capsas api-itscode, dao_libarary, entity_library.

Estructura general del proyecto

ITSCode-front/
│
├── index.html
├── sitemap.xml
├── LICENSE
├── context.md
│
├── css/
│   └── style.css
│
├── html/
│   ├── following.html
│   ├── my-profile.html
│   ├── post-create.html
│   ├── sign-up.html
│   ├── update-user.html
│   ├── user-profile.html
│   ├── user-profile2.html
│   └── wall.html
│
├── img/
│   └── (imágenes optimizadas .webp)
│
├── js/
│   ├── count.js
│   ├── fetch.js
│   ├── mode.js
│   ├── script.js
│   ├── userRepository.js
│   ├── presentation/
│   ├── repository/
│   └── Views/
│
└── todosJS/
    ├── Following/
    ├── Index/
    ├── MyProfile/
    ├── PostCreate/
    ├── SingUp/
    ├── UpdateUser/
    ├── UserProfile/
    └── Wall/


Descripción funcional

HTML: Cada página HTML representa una vista independiente (perfil, muro, registro, etc.).

CSS: style.css maneja el estilo global de la aplicación, probablemente con una paleta clara/oscura (por el archivo mode.js).

JS principal:

fetch.js: centraliza las llamadas a la API (fetch con endpoints del backend).

script.js: maneja funciones generales del sitio (interacciones comunes).

userRepository.js: contiene funciones relacionadas a los usuarios.

count.js: se usa para contadores (likes, followers, etc.).

mode.js: gestiona el cambio de tema o modo oscuro.

Carpeta /todosJS/: agrupa lógicamente los scripts específicos para cada vista o funcionalidad.

Carpetas /presentation/, /repository/, /Views/ dentro de /js/: muestran una intención de arquitectura modular basada en capas, separando responsabilidades entre la presentación, acceso a datos y manejo de vistas dinámicas.


Conexión con el backend

El frontend utiliza fetch.js para conectarse con la API REST del backend (que maneja autenticación, publicaciones, seguidores y usuarios).
Los endpoints se estructuran por entidades (users, posts, follow, etc.), y cada vista HTML usa su correspondiente archivo JS dentro de /todosJS/.


Estoy trabajando con un frontend llamado ITSCode, hecho en HTML, CSS y JavaScript puro.
El proyecto tiene las siguientes carpetas principales: /html, /css, /js, /todosJS, y /img.
Cada vista HTML (como wall.html, my-profile.html, sign-up.html) tiene su archivo JS correspondiente dentro de /todosJS.
En /js tengo los archivos fetch.js, userRepository.js, script.js, mode.js y count.js, además de subcarpetas presentation, repository y Views.
El archivo fetch.js se usa para realizar peticiones a una API REST (backend en .net con entity framework).
Quiero que tus respuestas tengan en cuenta esta estructura y me ayuden a mejorar, depurar o expandir funcionalidades del frontend ITSCode de forma coherente con su arquitectura.