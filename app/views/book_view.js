const next = document.getElementById("next");
const prev = document.getElementById("prev");
const chapterList = document.getElementById("chapter_list");
const id_book = document.getElementById("id_book").value;
const add_btn = document.getElementById("add_btn");
const message = document.getElementById("message");
const messageSpan = document.getElementById("msg_msg");
message.style.display = 'none';
let page = 1;

prev.classList.add('d-none');
if (chapterList.innerHTML === '') {
    next.classList.add('d-none');
}

message.addEventListener('click', () => {
    message.style.display = 'none';
});

add_btn.addEventListener('click', async () => {
    fetch(`/books/my/reading/post/${id_book}`, {method: "POST"})
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

next.addEventListener('click', async () => {
    page++;
    getChapters(id_book, page).then((res) => {
        chapterList.innerHTML = "";
        console.log(res);
        res.forEach(function (chapter) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.setAttribute('href', `/chapter/${chapter.id_chapter}`)
            a.text = chapter.chapter_title;
            if (!chapter.public) {
                a.style.color = 'red';
            }
            li.appendChild(a);
            chapterList.appendChild(li);
        });
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
    getChapters(id_book, page).then((res) => {
        chapterList.innerHTML = "";
        console.log(res);
        res.forEach(function (chapter) {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.setAttribute('href', `/chapter/${chapter.id_chapter}`)
            a.text = chapter.chapter_title;
            if (!chapter.public) {
                a.style.color = 'red';
            }
            li.appendChild(a);
            chapterList.appendChild(li);
        });
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

function getChapters(id, page) {
    return fetch(`/book/${id_book}/chapters?page=${page}`)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error loading document: ' + text);
                });
            }
            return response.json();
        });
}