const text_review = document.getElementById("text_review");
const public_elem = document.getElementById("public");
const saveBtn = document.getElementById("edit");
const deleteBtn = document.getElementById("delete");
const id_book = document.getElementById("id_book");
const id_user = document.getElementById("id_user");

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
    console.log(text_review1)
    console.log(publicValue1)
    return fetch(`/book/${id_book.value}/reviews/${id_user.value}`, {
        method: "PUT",
        body: JSON.stringify({
            text_review: text_review1,
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
    return fetch(`/book/${id_book.value}/reviews/${id_user.value}`, {
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