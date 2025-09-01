// const informationUserLogin = document.getElementById("infoUser");

// getMyProfile( (myProfiles) => {
//     const myProfile = new MyProfile(myProfiles);
//     const nodoProfile = myProfile.getNode();
//     informationUserLogin.append(nodoProfile);
// });


// const myPostsContainer = document.getElementById("myPosts");

// getMyPosts((myPosts) => {
//     for(jsonPost of myPosts){
//         const myPost = new MyPosts(jsonPost);
//         const nodoPost = myPost.getNode();
//         myPostsContainer.append(nodoPost);
//     }
// })



const infoUserContainer = document.getElementById("infoUser");
const myPostsContainer = document.getElementById("myPosts");


async function renderMyProfile() {
    try {
        const myProfileData = await getMyProfile();

        const myProfile = new MyProfile(myProfileData);
        infoUserContainer.append(myProfile.getNode());
    } catch (error) {

        infoUserContainer.innerHTML = '<p>No se pudo cargar tu perfil. Inténtalo más tarde.</p>';
        console.error("Error al cargar el perfil del usuario:", error);
    }
}


async function renderMyPosts() {
    try {

        const myPostsData = await getMyPosts();

        for (const jsonPost of myPostsData) {
            const myPost = new MyPosts(jsonPost);
            myPostsContainer.append(myPost.getNode());
        }
    } catch (error) {

        myPostsContainer.innerHTML = '<p>No se pudieron cargar tus publicaciones.</p>';
        console.error("Error al cargar las publicaciones:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderMyProfile();
    renderMyPosts();
});