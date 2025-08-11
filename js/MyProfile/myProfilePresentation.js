const informationUserLogin = document.getElementById("infoUser");

getMyProfile( (myProfiles) => {
    const myProfile = new MyProfile(myProfiles);
    const nodo = myProfile.getNode();
    informationUserLogin.append(nodo);
});


const myPostsContainer = document.getElementById("myPosts");

getMyPosts((myPosts) => {
    for(jsonPost of myPosts){
        const myPost = new MyPosts(jsonPost);
        const nodo = myPost.getNode();
        myPostsContainer.append(nodo);
    }
})