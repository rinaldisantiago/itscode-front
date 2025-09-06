const informationUserLogin = document.getElementById("infoUser");
const myPostsContainer = document.getElementById("myPosts");

getMyProfile( (data) => {
    const myProfile = new MyProfile(data);
    const nodoProfile = myProfile.getNode();
    informationUserLogin.append(nodoProfile);
});



getMyPosts((data) => {
    const myPostsArray = data.posts; 

    for (const jsonPost of myPostsArray) {
        const myPost = new MyPosts(jsonPost);
        const nodoPost = myPost.getNode();
        myPostsContainer.append(nodoPost);
    }
});

