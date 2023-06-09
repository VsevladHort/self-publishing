const report_content = document.getElementById("report_content");
const id_comment = document.getElementById("id_comment");

function saveDoc(text_review1) {
    return fetch(`/comment/${id_comment.value}/report`, {
        method: "POST",
        body: JSON.stringify({
            report_content: text_review1
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
