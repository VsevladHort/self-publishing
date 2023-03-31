const text_review = document.getElementById("text_review");
const public_elem = document.getElementById("public");
const saveBtn = document.getElementById("edit");
const deleteBtn = document.getElementById("delete");
const id_comment = document.getElementById("id_comment");

saveBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    publicValue = public_elem.checked ? true : false;
    saveDoc(text_review.value, publicValue).then(async (resp) => {
        message.style.display = 'block';
        messageSpan.textContent = resp;
    }).catch(async (resp) => {
        message.style.display = 'block';
        messageSpan.textContent = resp;
    })
});

deleteBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    deleteDoc().then(async (resp) => {
        message.style.display = 'block';
        messageSpan.textContent = resp;
    }).catch(async (resp) => {
        message.style.display = 'block';
        messageSpan.textContent = resp;
    })
});

function saveDoc(text_review1, publicValue1) {
    return fetch(`/comment/${id_comment.value}`, {
        method: "PUT",
        body: JSON.stringify({
            text_comment: text_review1,
            public: publicValue1
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        if (!response.ok) {
            return response.json().then(function (text) {
                throw new Error(text.msg);
            });
        }
        return response.json().then(text => {
            return text.msg
        });
    });
}

function deleteDoc() {
    return fetch(`/comment/${id_comment.value}`, {
        method: "DELETE"
    }).then(function (response) {
        if (!response.ok) {
            return response.json().then(function (text) {
                throw new Error(text.msg);
            });
        }
        return response.json().then(text => {
            return text.msg
        });
    });
}