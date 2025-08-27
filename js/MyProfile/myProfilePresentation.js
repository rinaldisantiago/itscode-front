const informationUserLogin = document.getElementById("infoUser");

getMyProfile( (myProfiles) => {
    const myProfile = new MyProfile(myProfiles);
    const nodoProfile = myProfile.getNode();
    informationUserLogin.append(nodoProfile);
});


const myPostsContainer = document.getElementById("myPosts");

getMyPosts((myPosts) => {
    for(jsonPost of myPosts){
        const myPost = new MyPosts(jsonPost);
        const nodoPost = myPost.getNode();
        myPostsContainer.append(nodoPost);
    }
})