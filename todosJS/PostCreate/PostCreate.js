const form = document.getElementById("frmPost");
const inputTitle = document.getElementById("txt_post_title");
const inputImage = document.getElementById("load-post-image");
const inputDescription = document.getElementById("txt_post_description");

form.addEventListener("submit", evt => {
    evt.preventDefault();
    const obj = postConstructor();

    PostRepository.create(obj, successfull);
})

const successfull = (obj) => {
    window.location.href = "/html/post-create.html";
}

const postConstructor = () => {
    return {
        title: inputTitle.value,
        image: inputImage.files[0],
        description: inputDescription.value
    }
}