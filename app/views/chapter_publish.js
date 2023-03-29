const message = document.getElementById("message");
const messageSpan = document.getElementById("msg_msg");
const publish = document.getElementById("publish");
const hidden = document.getElementById("hidden");
const title = document.getElementById("title");
message.style.display = 'none';
const editor = new Quill('#editor', {
    modules: {toolbar: '#toolbar'},
    theme: 'snow'
});

message.addEventListener('click', () => {
    message.style.display = 'none';
});

publish.addEventListener('click', async () => {
    if (title.value === null || title.value === "") {
        message.style.display = 'block';
        messageSpan.textContent = "title cannot be blank!";
        return;
    }
    saveDocument(hidden.value, editor.root.innerHTML, title.value).then(async (resp) => {
        message.style.display = 'block';
        messageSpan.textContent = resp.msg;
    }).catch(async (resp) => {
        message.style.display = 'block';
        messageSpan.textContent = resp;
    })
});

function saveDocument(id, data, title) {
    console.log(data);
    const options = {
        method: 'POST',
        body: JSON.stringify({
            chapter_text: data,
            chapter_title: title,
            id_book: id
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return fetch(`/book/${id}/publish`, options)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error saving chapter: ' + text);
                });
            }
            return response.json();
        });
}