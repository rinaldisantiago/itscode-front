// const userProfile = {
//     imgAvatar: "../img/santi-min.webp" ,
//     fullName: "Santiago Rinaldi" ,
//     email: "santiago.rinaldi@gmail.com" ,
//     userName: "rinaldisantiago" ,
//     publications: "100",
//     followers:"300" ,
//     followed: "30",
// };


// function getUserProfile(show) {
//     //funcion Fetch
//     show(userProfile);
// };

// const userPosts = [{
//     postsTitle:"Juntos Estudiando",
//     imgPost:"../img/juntada-con-amigos-min.webp",
//     postContent:" Ponele que en este día nos juntamos a estudiar, jajajajjaa!!! En serio!!! Nos juntamos a codear...",
//     countsLikes:"12",
//     countsDislikes:"2",
//     countsComments:"0",
//     imgAvatar:"../img/fotoCv-min.webp",
// },{
//     postsTitle:"Compartiendo en Futuro Hacker",
//     imgPost:"../img/charla-min.webp",
//     postContent:"Una excelente tarde con mis compañeros de tecnicatura y con el profe Mati!!!!",
//     countsLikes:"29",
//     countsDislikes:"4",
//     countsComments:"0",
//     imgAvatar:"../img/fotoCv-min.webp",

// },{
//     postsTitle:"Charla en la UNC Software Libre",
//     imgPost:"../img/charla-unc-min.webp",
//     postContent:"Tarde distinta, excelente charla en la UNC. Compartir con estas personas reconforta el corazón... ¡muy buen equipo de 1.º año!",
//     countsLikes:"1200",
//     countsDislikes:"0",
//     countsComments:"0",
//     imgAvatar:"../img/fotoCv-min.webp",
// }];

// function getUserPosts(show) {
//     //funcion Fetch
//     show(userPosts);
// };


function getUserProfile(callback, objeto) {
    const userId = 2; 
    const response = apiFetch(`/UserProfile/get?id=${userId}`, { method: 'GET' }, callback, objeto, "Obteniendo perfil de usuario");
    return response;
}

function getUserPosts(callback, objeto) {
    const userId = 2; 
    const response = apiFetch(`/UserPost/getAll?id=${userId}`, { method: 'GET' }, callback, objeto, "Obteniendo posts del usuario");
    return response;
}