const OWNER_CODE = "9641@";

const ownerCodeInput = document.getElementById("ownerCode");
const loginBtn = document.getElementById("loginBtn");
const msg = document.getElementById("msg");

function login() {
  const entered = ownerCodeInput.value;

  if (entered === OWNER_CODE) {
    localStorage.setItem("zeine_logged_in", "true");
    window.location.href = "inbox.html";
    return;
  }

  msg.textContent = "الكود غير صحيح";
}

loginBtn.addEventListener("click", login);
ownerCodeInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") login();
});