const informationUser = document.getElementById("infoUserVisit");

getUserProfile( (userProfile) => {
    const userProfileVisit = new UserProfile(userProfile);
    const nodo = userProfileVisit.getNode();
    informationUser.append(nodo);
});


const userPostsContainer = document.getElementById("userPosts");

getUserPosts((userPosts) => {
    for(jsonPost of userPosts){
        const userPost = new UserPosts(jsonPost);
        const nodo = userPost.getNode();
        userPostsContainer.append(nodo);
    }
})