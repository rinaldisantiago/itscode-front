const myProfiles = {
    imgAvatar: "../img/fotoCv-min.webp" ,
    fullName: "Carlos Hernández" ,
    email: "doncarlos@email.com" ,
    userName: "Don Carlos" ,
    publications: "3000",
    followers:"2000" ,
    followed: "1000",
};


function getMyProfile(show) {
    //funcion Fetch
    show(myProfiles);
};

const myPosts = [{
    postsTitle:"Aprendiendo con el Profe Fede",
    imgPost:"../img/Imagen de WhatsApp 2025-06-03 a las 19.14.08_5021af47-min.webp",
    postContent:"El profe siempre predispuesto a enseñar, con la misma paciencia de siempre con los alumnos, ¡gracias por todo!",
    countsLikes:"12",
    countsDislikes:"2",
    countsComments:"0",
    imgAvatar:"../img/fotoCv-min.webp",
},{
    postsTitle:"Saliendo de la Tecnicatura",
    imgPost:"../img/Imagen de WhatsApp 2025-06-03 a las 19.14.07_c264d27b-min.webp",
    postContent:"Después de un arduo día codeando, llevando a mi amigo Santiago Rinaldi a su casa.",
    countsLikes:"29",
    countsDislikes:"4",
    countsComments:"0",
    imgAvatar:"../img/fotoCv-min.webp",

},{
    postsTitle:"Un dia Especial",
    imgPost:"../img/estreno-covacha-min.webp",
    postContent:"En este día se inauguró la COVACHA. Con un gran esfuerzo, pudimos rescatar esta aula del instituto para convertirla en un espacio para poder estudiar y tomar algo calentito.",
    countsLikes:"1200",
    countsDislikes:"0",
    countsComments:"0",
    imgAvatar:"../img/fotoCv-min.webp",
}];

function getMyPosts(show) {
    //funcion Fetch
    show(myPosts);
};