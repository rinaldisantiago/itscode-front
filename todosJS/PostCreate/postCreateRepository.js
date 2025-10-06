class PostRepository {
    static create(obj, callback) {
        fetch("POST", "/post", obj, callback);
    }
}