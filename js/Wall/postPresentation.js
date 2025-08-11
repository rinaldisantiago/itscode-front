const sectionPosts= document.getElementById('posts-collection');

getPost((posts) => {
    for (jsonPost of posts) {
        const post = new Post(jsonPost);
        const nodo = post.getNode();
        sectionPosts.append(nodo);
    }

})
