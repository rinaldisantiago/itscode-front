const sectionFollowUser= document.getElementById('card-users');

getFollow((followUsers) => {
    for (jsonfollowUser of followUsers) {
        const following = new Following(jsonfollowUser);
        const nodo = following.getNode();
        sectionFollowUser.append(nodo);
    }

})