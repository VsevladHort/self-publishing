const hiddenInput = document.getElementById('passdiv');
const hiddenInputInput = document.getElementById('password');
const changePassBtn = document.getElementById('changepassbtn');
hiddenInput.style.display = 'none';

changePassBtn.addEventListener('click', () => {
    if (hiddenInput.style.display === 'none') {
        hiddenInput.style.display = 'block';
        hiddenInputInput.setAttribute("required", "");
        changePassBtn.textContent = 'Do not change password';
    } else {
        hiddenInput.style.display = 'none';
        hiddenInputInput.removeAttribute("required");
        hiddenInput.value = null;
        changePassBtn.textContent = 'Change password';
    }
});