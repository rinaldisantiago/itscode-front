// const posts = [{
//     title: "Mi primer post",
//     content: "Este es el contenido de mi primer post",
//     likes: 50,
//     dislikes: 2,
//     commentsCount: 10, 
//     fileUrl: "../img/juntada-con-amigos-min.webp",
//     userName: "Santi Rinaldi",
//     userAvatar: "../img/fotoCv-min.webp",
//     comments: []
// }];

function getPost(callback) {
    fetch('http://localhost:5052/Post/getAll')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Datos recibidos de la API:", data);
            // 🔹 Enviamos SOLO el array al callback
            callback(data.posts);
        })
        .catch(error => {
            console.error("Error al obtener los posts:", error);
        });
}