const ban_elem = document.getElementById("is_banned");
const ban = document.getElementById("ban");
const id_user = document.getElementById("id_user");

ban.addEventListener('click', async (e) => {
    e.preventDefault();
    let bannedValue = ban_elem.value;
    if (bannedValue === "1")
        bannedValue = 0;
    else
        bannedValue = 1;
    banUnbanUser(bannedValue).then(async (resp) => {
        message.style.display = 'block';
        messageSpan.textContent = resp;
    }).catch(async (resp) => {
        message.style.display = 'block';
        messageSpan.textContent = resp;
    })
});

function banUnbanUser(bannedValue) {
    return fetch(`/user/${id_user.value}/ban`, {
        method: "POST",
        body: JSON.stringify({
            banned: bannedValue
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
