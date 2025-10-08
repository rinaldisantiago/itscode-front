class IndexRepository {
    static login(obj, callback) {
        fetch("POST", "/login", obj, callback);
    }
}