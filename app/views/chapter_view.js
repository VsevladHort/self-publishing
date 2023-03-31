const add_btn = document.getElementById("add_btn");
const id_chapter = document.getElementById("id_chapter").value;
const publish_comment = document.getElementById("publish_comment");
const next1 = document.getElementById("next1");
const prev1 = document.getElementById("prev1");
let pageComments = 1;

getComments(id_chapter, pageComments).then((res) => {
    drawComments(res);
}).catch((err) => {
    message.style.display = 'block';
    messageSpan.textContent = err;
});

if (prev1 !== null)
    prev1.classList.add('d-none');

if (publish_comment !== null) {
    publish_comment.addEventListener('click', async (e) => {
        e.preventDefault();
        const text_comment = document.getElementById("text_comment").value;
        console.log(text_comment)
        if (text_comment === "" || text_comment === null) {
            message.style.display = 'block';
            messageSpan.textContent = "Comment must be non-empty";
            return;
        }
        publishComment(id_chapter, text_comment).then((res) => {
            message.style.display = 'block';
            messageSpan.textContent = res.msg;
            getComments(id_chapter, pageComments).then((res) => {
                drawComments(res);
            }).catch((err) => {
                message.style.display = 'block';
                messageSpan.textContent = err;
            });
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        })
    });
}

if (add_btn !== null)
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
    });

function drawComments(res) {
    document.getElementById("reviewAnchor").innerHTML = "";
    console.log(res);
    res.forEach(function (comment) {
        const divCard = document.createElement('div');
        divCard.classList.add('card');
        const divCardBody = document.createElement('div');
        divCardBody.classList.add('card-body');
        const h5 = document.createElement('h5');
        h5.classList.add("card-title");
        const p2 = document.createElement('p');
        p2.classList.add("card-text");
        if (!comment.public) {
            divCard.style.opacity = "0.6";
        }
        h5.textContent = `By ${comment.author}`;
        p2.textContent = comment.text_comment;
        divCardBody.appendChild(h5);
        divCardBody.appendChild(p2);
        divCard.appendChild(divCardBody);
        if (comment.editable) {
            const editButton = document.createElement('a');
            editButton.classList.add('btn');
            editButton.classList.add('btn-primary');
            editButton.textContent = "Edit";
            editButton.href = `/comment/${comment.id_comment}`
            divCard.appendChild(editButton);
        }
        if (add_btn !== null) {
            const repBtn = document.createElement('a');
            repBtn.classList.add('btn');
            repBtn.classList.add('btn-secondary');
            repBtn.textContent = "Report comment";
            repBtn.href = `/comment/${comment.id_comment}/report`
            divCard.appendChild(repBtn);
        }
        document.getElementById("reviewAnchor").appendChild(divCard);

    });
}

function getComments(id, page) {
    console.log(page);
    return fetch(`/chapter/${id}/comments?page=${page}`)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error loading document: ' + text);
                });
            }
            return response.json();
        });
}

function publishComment(id, text_comment1) {
    return fetch(`/chapter/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({text_comment: text_comment1}),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (text) {
                throw new Error('Error loading document: ' + text);
            });
        }
        return response.json();
    });
}

if (next1 !== null)
    next1.addEventListener('click', async () => {
        pageComments++;
        getComments(id_chapter, pageComments).then((res) => {
            drawComments(res);
            if (res.length === 0) {
                next1.classList.add('d-none');
            }
            if (prev1.classList.contains('d-none'))
                prev1.classList.remove('d-none');
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        });
    });

if (prev1 !== null)
    prev1.addEventListener('click', async () => {
        pageComments -= 1;
        getComments(id_chapter, pageComments).then((res) => {
            drawComments(res);
            if (pageComments === 1) {
                prev1.classList.add('d-none');
            }
            if (next1.classList.contains('d-none'))
                next1.classList.remove('d-none');
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        });
    });