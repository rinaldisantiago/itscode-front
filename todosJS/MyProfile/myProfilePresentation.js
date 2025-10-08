const informationUserLogin = document.getElementById("infoUser");
const myPostsContainer = document.getElementById("myPosts");

// Obtener el ID del usuario de la URL. Si no existe, usar el ID del usuario actual (por ejemplo, 1)
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId') || 1; 

// Obtener el perfil del usuario (ya sea el actual o el que viene de la URL)
getMyProfile(userId, (data) => {
    const myProfile = new MyProfile(data);
    const nodoProfile = myProfile.getNode();
    informationUserLogin.append(nodoProfile);
});

// Obtener los posts del usuario (ya sea el actual o el que viene de la URL)
getMyPosts(userId, (data) => {
    const myPostsArray = data.posts; 

    for (const jsonPost of myPostsArray) {
        const myPost = new MyPosts(jsonPost);
        const nodoPost = myPost.getNode();
        myPostsContainer.append(nodoPost);
    }
});