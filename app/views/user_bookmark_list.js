const next = document.getElementById("next");
const prev = document.getElementById("prev");
const bookList = document.getElementById("books");
const message = document.getElementById("message");
const messageSpan = document.getElementById("msg_msg");
message.style.display = 'none';
let page = 1;

if (bookList !== null)
    getChapters(page).then((res) => {
        drawBookList(res);
        if (res.length === 0) {
            next.classList.add('d-none');
        }
    }).catch((err) => {
        message.style.display = 'block';
        messageSpan.textContent = err;
    });
prev.classList.add('d-none');

message.addEventListener('click', () => {
    message.style.display = 'none';
});

next.addEventListener('click', async () => {
    page++;
    getChapters(page).then((res) => {
        drawBookList(res);
        if (res.length === 0) {
            next.classList.add('d-none');
        }
        if (prev.classList.contains('d-none'))
            prev.classList.remove('d-none');
    }).catch((err) => {
        message.style.display = 'block';
        messageSpan.textContent = err;
    });
});

prev.addEventListener('click', async () => {
    page -= 1;
    getChapters(page).then((res) => {
        drawBookList(res);
        if (page === 1) {
            prev.classList.add('d-none');
        }
        if (next.classList.contains('d-none'))
            next.classList.remove('d-none');
    }).catch((err) => {
        message.style.display = 'block';
        messageSpan.textContent = err;
    });
});

function drawBookList(res) {
    bookList.innerHTML = "";
    console.log(res);
    res.forEach(function (book) {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const td3 = document.createElement('td');
        const a = document.createElement('a');
        const button = document.createElement('button');
        button.addEventListener('click', deleteFromList(book.id_chapter, tr));
        button.textContent = "Remove";
        a.setAttribute('href', `/chapter/${book.id_chapter}`)
        a.text = book.chapter_title;
        td1.appendChild(a);
        td3.appendChild(button);
        tr.appendChild(td1);
        tr.appendChild(td3);
        bookList.appendChild(tr);
    });
}

function getChapters(page) {
    return fetch(`/bookmarks/my/back?page=${page}`)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error loading document: ' + text);
                });
            }
            return response.json();
        });
}

function deleteFromList(id, trToHide) {
    return async () => {
        fetch(`/bookmarks/my/delete/${id}`, {method: "DELETE"})
            .then(function () {
                message.style.display = 'block';
                messageSpan.textContent = "Deleted the book from the reading list";
                trToHide.style.display = 'none';
            }).catch(() => {
            message.style.display = 'block';
            messageSpan.textContent = "Could not delete the book from the reading list";
        });
    }
}