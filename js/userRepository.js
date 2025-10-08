function updateUser(dataUser, success) {
    apiFetch('/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataUser)
    }, success);

}