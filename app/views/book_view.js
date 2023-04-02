const next = document.getElementById("next");
const next1 = document.getElementById("next1");
const prev = document.getElementById("prev");
const prev1 = document.getElementById("prev1");
const chapterList = document.getElementById("chapter_list");
const id_book = document.getElementById("id_book").value;
const add_btn = document.getElementById("add_btn");
const publish_review = document.getElementById("publish_review");
const bookTagsAnchor = document.getElementById("bookTagsAnchor");
const star1 = document.getElementById("star1");
const star2 = document.getElementById("star2");
const star3 = document.getElementById("star3");
const star4 = document.getElementById("star4");
const star5 = document.getElementById("star5");
let page = 1;
let pageReviews = 1;

if (prev !== null)
    prev.classList.add('d-none');
if (prev1 !== null)
    prev1.classList.add('d-none');
if (chapterList.innerHTML === '') {
    next.classList.add('d-none');
}

getBookTags().then(r => drawBookTags(r))
getReviews(id_book, pageReviews).then((res) => {
    drawReviews(res);
}).catch((err) => {
    message.style.display = 'block';
    messageSpan.textContent = err;
});

if (publish_review !== null) {
    publish_review.addEventListener('click', async (e) => {
        e.preventDefault();
        const text_review = document.getElementById("text_review").value;
        if (text_review === "" || text_review === null) {
            message.style.display = 'block';
            messageSpan.textContent = "Review must be non-empty";
            return;
        }
        publishReview(text_review).then((res) => {
            message.style.display = 'block';
            messageSpan.textContent = res.msg;
            getReviews(id_book, pageReviews).then((res) => {
                drawReviews(res);
            }).catch((err) => {
                message.style.display = 'block';
                messageSpan.textContent = err;
            });
            document.getElementById("submiting_review").style.display = 'none';
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        })
    });
}

if (star1 !== null) {
    star1.addEventListener('click', () => {
        rateBook(1).then((res) => {
            message.style.display = 'block';
            messageSpan.textContent = res.msg;
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        })
    })
    star2.addEventListener('click', () => {
        rateBook(2).then((res) => {
            message.style.display = 'block';
            messageSpan.textContent = res.msg;
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        })
    })
    star3.addEventListener('click', () => {
        rateBook(3).then((res) => {
            message.style.display = 'block';
            messageSpan.textContent = res.msg;
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        })
    })
    star5.addEventListener('click', () => {
        rateBook(5).then((res) => {
            message.style.display = 'block';
            messageSpan.textContent = res.msg;
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        })
    })
    star4.addEventListener('click', () => {
        rateBook(4).then((res) => {
            message.style.display = 'block';
            messageSpan.textContent = res.msg;
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        })
    })
}

if (add_btn !== null)
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

if (next !== null)
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

if (prev !== null)
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

function rateBook(rating) {
    return fetch(`/book/${id_book}/rate`, {
        method: "POST",
        body: JSON.stringify({score: rating}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error loading document: ' + text);
                });
            }
            return response.json();
        });
}

function publishReview(text_review) {
    return fetch(`/book/${id_book}/reviews`, {
        method: "POST",
        body: JSON.stringify({text_review: text_review}),
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

function drawReviews(res) {
    document.getElementById("reviewAnchor").innerHTML = "";
    console.log(res);
    res.forEach(function (review) {
        const divCard = document.createElement('div');
        divCard.classList.add('card');
        const divCardBody = document.createElement('div');
        divCardBody.classList.add('card-body');
        const h4 = document.createElement('h4');
        h4.classList.add("card-title");
        const p1 = document.createElement('p');
        p1.classList.add("card-text");
        const p2 = document.createElement('p');
        p2.classList.add("card-text");
        if (!review.public) {
            divCard.style.opacity = "0.6";
        }
        h4.textContent = `By ${review.author}`;
        p1.textContent = `Rating: ${review.score === 'null' ? 'not given' : review.score}/5`;
        p2.textContent = review.text_review;
        divCardBody.appendChild(h4);
        divCardBody.appendChild(p1);
        divCardBody.appendChild(p2);
        divCard.appendChild(divCardBody);
        if (review.editable) {
            const editButton = document.createElement('a');
            divCard.classList.add('card');
            editButton.classList.add('btn');
            editButton.classList.add('btn-primary');
            editButton.textContent = "Edit";
            editButton.href = `/book/${review.id_book}/reviews/${review.id_user}`
            divCard.appendChild(editButton);
        }
        document.getElementById("reviewAnchor").appendChild(divCard);

    });
}

if (next1 !== null)
    next1.addEventListener('click', async () => {
        pageReviews++;
        getReviews(id_book, pageReviews).then((res) => {
            drawReviews(res);
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
        pageReviews -= 1;
        getReviews(id_book, pageReviews).then((res) => {
            drawReviews(res);
            if (page === 1) {
                prev1.classList.add('d-none');
            }
            if (next1.classList.contains('d-none'))
                next1.classList.remove('d-none');
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        });
    });

function getReviews(id, page) {
    return fetch(`/book/${id}/reviews?page=${page}`)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error loading document: ' + text);
                });
            }
            return response.json();
        });
}

function getBookTags() {
    return fetch(`/book/${id_book}/tags`)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error loading document: ' + text);
                });
            }
            return response.json();
        });
}

function drawBookTags(res) {
    bookTagsAnchor.innerHTML = "";
    console.log(res);
    res.forEach(function (tag) {
        const span = document.createElement('span');
        span.classList.toggle('badge')
        span.classList.toggle('bg-secondary')
        span.classList.toggle('me-1')
        span.textContent = tag.tag_name
        span.addEventListener('click', () => {
            removeTag(tag.id_tag).then((r) => {
                    message.style.display = 'block';
                    messageSpan.textContent = r.msg;
                    getBookTags().then(r => drawBookTags(r))
                }
            ).catch((r) => {
                message.style.display = 'block';
                messageSpan.textContent = r;
            })
        })
        bookTagsAnchor.appendChild(span)
    });
}