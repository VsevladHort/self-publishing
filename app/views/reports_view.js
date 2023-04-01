const next1 = document.getElementById("next1");
const prev1 = document.getElementById("prev1");
const next = document.getElementById("next");
const prev = document.getElementById("prev");
let pageComments = 1;
let pageChapter = 1;

getCommentReports(pageComments).then((res) => {
    drawCommentReports(res);
}).catch((err) => {
    message.style.display = 'block';
    messageSpan.textContent = err;
});

getChapterReports(pageChapter).then((res) => {
    drawChapterReports(res);
}).catch((err) => {
    message.style.display = 'block';
    messageSpan.textContent = err;
});

if (prev1 !== null)
    prev1.classList.add('d-none');
if (prev !== null)
    prev.classList.add('d-none');

function drawCommentReports(res) {
    document.getElementById("commentReportAnchor").innerHTML = "";
    console.log(res);
    res.forEach(function (comment) {
        const divCard = document.createElement('div');
        divCard.classList.add('card');
        const divCardBody = document.createElement('div');
        divCardBody.classList.add('card-body');
        const h5 = document.createElement('a');
        h5.classList.add("card-title");
        const p2 = document.createElement('p');
        const deleteBtn = document.createElement('btn');
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.toggle('btn')
        deleteBtn.classList.toggle('btn-danger')
        deleteBtn.addEventListener('click', () => {
            deleteCommentReport(comment.id_user, comment.id_comment).then(r => {
                    console.log(r);
                    message.style.display = 'block';
                    messageSpan.textContent = r.msg;
                    getCommentReports(pageComments).then((res) => {
                        drawCommentReports(res);
                    }).catch((err) => {
                        message.style.display = 'block';
                        messageSpan.textContent = err;
                    });
                }
            ).catch(r => {
                message.style.display = 'block';
                messageSpan.textContent = r;
            });
        });
        p2.classList.add("card-text");
        h5.textContent = `Report on comment ${comment.id_comment}`;
        p2.textContent = comment.report_content;
        h5.href = `/comment/${comment.id_comment}`
        divCardBody.appendChild(h5);
        divCardBody.appendChild(p2);
        divCardBody.appendChild(deleteBtn);
        divCard.appendChild(divCardBody);
        document.getElementById("commentReportAnchor").appendChild(divCard);
    });
}

function drawChapterReports(res) {
    document.getElementById("chapterReportAnchor").innerHTML = "";
    console.log(res);
    res.forEach(function (comment) {
        const divCard = document.createElement('div');
        divCard.classList.add('card');
        const divCardBody = document.createElement('div');
        divCardBody.classList.add('card-body');
        const h5 = document.createElement('a');
        h5.classList.add("card-title");
        const p2 = document.createElement('p');
        const deleteBtn = document.createElement('btn');
        deleteBtn.classList.toggle('btn')
        deleteBtn.classList.toggle('btn-danger')
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener('click', () => {
            deleteChapterReport(comment.id_user, comment.id_chapter).then(r => {
                    console.log(r);
                    message.style.display = 'block';
                    messageSpan.textContent = r.msg;
                    getChapterReports(pageComments).then((res) => {
                        drawChapterReports(res);
                    }).catch((err) => {
                        message.style.display = 'block';
                        messageSpan.textContent = err;
                    });
                }
            ).catch(r => {
                message.style.display = 'block';
                messageSpan.textContent = r;
            });
        });
        p2.classList.add("card-text");
        h5.textContent = `Report on chapter ${comment.id_chapter}`;
        p2.textContent = comment.report_content;
        h5.href = `/chapter/${comment.id_chapter}`
        divCardBody.appendChild(h5);
        divCardBody.appendChild(p2);
        divCardBody.appendChild(deleteBtn);
        divCard.appendChild(divCardBody);
        document.getElementById("chapterReportAnchor").appendChild(divCard);
    });
}

function getCommentReports(page) {
    return fetch(`/reports/comments?page=${page}`)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error loading comment reports: ' + text);
                });
            }
            return response.json();
        });
}

function deleteCommentReport(id_user, id_comment) {
    return fetch(`/reports/comments/${id_user}/${id_comment}`, {
        method: "DELETE"
    }).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (text) {
                throw new Error('Error deleting comment report: ' + text);
            });
        }
        return response.json();
    });
}

function getChapterReports(page) {
    return fetch(`/reports/chapters?page=${page}`)
        .then(function (response) {
            if (!response.ok) {
                return response.text().then(function (text) {
                    throw new Error('Error loading comment reports: ' + text);
                });
            }
            return response.json();
        });
}

function deleteChapterReport(id_user, id_chapter) {
    return fetch(`/reports/chapters/${id_user}/${id_chapter}`, {
        method: "DELETE"
    }).then(function (response) {
        if (!response.ok) {
            return response.text().then(function (text) {
                throw new Error('Error deleting comment report: ' + text);
            });
        }
        return response.json();
    });
}

if (next1 !== null)
    next1.addEventListener('click', async () => {
        pageChapter++;
        getChapterReports(pageChapter).then((res) => {
            drawChapterReports(res);
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
        pageChapter -= 1;
        getChapterReports(pageChapter).then((res) => {
            drawChapterReports(res);
            if (pageChapter === 1) {
                prev1.classList.add('d-none');
            }
            if (next1.classList.contains('d-none'))
                next1.classList.remove('d-none');
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        });
    });

if (next !== null)
    next.addEventListener('click', async () => {
        pageComments++;
        getCommentReports(pageComments).then((res) => {
            drawCommentReports(res);
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
        pageComments -= 1;
        getCommentReports(pageComments).then((res) => {
            drawCommentReports(res);
            if (pageComments === 1) {
                prev.classList.add('d-none');
            }
            if (next.classList.contains('d-none'))
                next.classList.remove('d-none');
        }).catch((err) => {
            message.style.display = 'block';
            messageSpan.textContent = err;
        });
    });