const toggleIcons = document.querySelectorAll(".toggle-password");
const emailInput = document.getElementById("email") as HTMLInputElement;
const confirmBtn = document.getElementById("confirm-btn") as HTMLButtonElement;
const errorMsg = document.getElementById("code-error") as HTMLParagraphElement;
const emailDiv = document.querySelector(".email-div") as HTMLDivElement;

const resetCodeDiv = document.querySelector(".reset-code") as HTMLDivElement;
const codeInput = document.getElementById("code-input") as HTMLInputElement;
const verifyBtn = document.getElementById("verify-btn") as HTMLButtonElement;
const otpError = document.getElementById("otp-error") as HTMLParagraphElement;

const passwordGroup = document.querySelector(".password-group1") as HTMLDivElement;
const setNewPasswordInput = document.getElementById("setNewPassword") as HTMLInputElement;
const confirmNewPasswordInput = document.getElementById("confirmNewPassword") as HTMLInputElement;
const passwordError = document.getElementById("password-error") as HTMLParagraphElement;
const confirmError = document.getElementById("confirm-error") as HTMLParagraphElement;

const a_form = document.getElementById("a-form") as HTMLFormElement;
const successMessage = document.getElementById("message") as HTMLParagraphElement;

let currentEmail = "";


confirmBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!isValidEmail) {
    errorMsg.textContent = "Please enter a valid email.";
    return;
  }

  errorMsg.textContent = "";

  const found = await fetch("/find-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  }).then(r => r.json());

  if (!found.success) {
    errorMsg.textContent = found.message;
    return;
  }

  await fetch("/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  currentEmail = email;
  emailDiv.style.display = "none";
  resetCodeDiv.style.display = "block";
});


verifyBtn.addEventListener("click", async () => {
  const code = codeInput.value.trim();

  if (!code) {
    otpError.textContent = "Please enter the code.";
    return;
  }

  otpError.textContent = "";

  const data = await fetch("/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: currentEmail, code })
  }).then(r => r.json());

  if (!data.success) {
    otpError.textContent = data.message;
    return;
  }

  resetCodeDiv.style.display = "none";
  passwordGroup.style.display = "block";
});


a_form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const pass1 = setNewPasswordInput.value.trim();
  const pass2 = confirmNewPasswordInput.value.trim();
  const { isValid } = validatePasswords(pass1, pass2);

  if (!isValid) return;

  await updatePassword(pass1, currentEmail);
});


function validatePasswords(pass1: string, pass2: string) {
  let isValid = true;
  passwordError.textContent = "";
  confirmError.textContent = "";

  if (pass1.length < 8) {
    passwordError.textContent = "Password must be at least 8 characters.";
    isValid = false;
  }

  if (pass2 !== "" && pass1 !== pass2) {
    confirmError.textContent = "Passwords do not match.";
    isValid = false;
  }

  return { isValid };
}

setNewPasswordInput.addEventListener("keyup", () => {
  validatePasswords(setNewPasswordInput.value.trim(), confirmNewPasswordInput.value.trim());
});

confirmNewPasswordInput.addEventListener("keyup", () => {
  validatePasswords(setNewPasswordInput.value.trim(), confirmNewPasswordInput.value.trim());
});


toggleIcons.forEach(icon => {
  icon.addEventListener("click", () => {
    const input = icon.previousElementSibling as HTMLInputElement;
    if (input.type === "password") {
      input.type = "text";
      icon.classList.replace("fa-eye", "fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.replace("fa-eye-slash", "fa-eye");
    }
  });
});

async function updatePassword(password: string, email: string) {
  try {
    const response = await fetch("/new-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, email })
    });

    const data = await response.json();

    if (data.success) {
      successMessage.textContent = "Password updated successfully!";
      successMessage.id = "success";
      setTimeout(() => {
        window.location.href = "/login";
      }, 1800);
    } else {
      passwordError.textContent = data.message || "Something went wrong.";
    }
  } catch (err) {
    console.error(err);
    passwordError.textContent = "Something went wrong.";
  }
}