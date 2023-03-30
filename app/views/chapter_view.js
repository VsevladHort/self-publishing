const add_btn = document.getElementById("add_btn");
const id_chapter = document.getElementById("id_chapter").value;

add_btn.addEventListener('click', async () => {
    fetch(`/bookmarks/my/post/${id_chapter}`, {method: "POST"})
        .then(async function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    message.style.display = 'block';
                    messageSpan.textContent = text;
                });
            }
            const result = await response.json();
            message.style.display = 'block';
            messageSpan.textContent = result.msg;
        });
})