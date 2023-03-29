const message = document.getElementById("message");
const messageSpan = document.getElementById("msg_msg");
const publish = document.getElementById("publish");
const hidden = document.getElementById("hidden");
const hiddenChapter = document.getElementById("hidden_chapter");
const hiddenPublic = document.getElementById("hidden_visibility");
const title = document.getElementById("title");
const btnHide = document.getElementById('hide');
message.style.display = 'none';

const editor = new Quill('#editor', {
    modules: {toolbar: '#toolbar'},
    theme: 'snow'
});
if (publish === null)
    editor.disable();

message.addEventListener('click', () => {
    message.style.display = 'none';
});

if (publish !== null)
    publish.addEventListener('click', async () => {
        if (hiddenChapter) {
            const visibleToPublic = parseInt(hiddenPublic.value);
            if (isNaN(visibleToPublic)) {
                return;
            }
            if (title.value === null || title.value === "") {
                message.style.display = 'block';
                messageSpan.textContent = "title cannot be blank!";
                return;
            }
            updateDocument(hiddenChapter.value, editor.root.innerHTML, title.value, visibleToPublic).then(async (resp) => {
                message.style.display = 'block';
                messageSpan.textContent = resp.msg;
            }).catch(async (resp) => {
                message.style.display = 'block';
                messageSpan.textContent = resp;
            })
        } else {
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
        }
    });

if (btnHide !== null)
    btnHide.addEventListener('click', async () => {
        const visibleToPublic = parseInt(hiddenPublic.value);
        if (isNaN(visibleToPublic)) {
            return;
        }
        if (title.value === null || title.value === "") {
            message.style.display = 'block';
            messageSpan.textContent = "title cannot be blank!";
            return;
        }
        updateDocument(hiddenChapter.value, editor.root.innerHTML, title.value, (!visibleToPublic)).then(async (resp) => {
            message.style.display = 'block';
            messageSpan.textContent = resp.msg;
            if ((!visibleToPublic))
                btnHide.textContent = "Hide";
            else
                btnHide.textContent = "Show";
            hiddenPublic.value = (!visibleToPublic) ? 100 : 0;
        }).catch(async (resp) => {
            message.style.display = 'block';
            messageSpan.textContent = resp;
        })
    });

function updateDocument(id, data, title, visible) {
    console.log(data);
    const options = {
        method: 'PUT',
        body: JSON.stringify({
            chapter_text: data,
            chapter_title: title,
            public: visible
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    };
    return fetch(`/chapter/${id}/edit`, options)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error saving chapter: ' + text);
                });
            }
            return response.json();
        });
}

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