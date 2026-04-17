const toggleIcons = document.querySelectorAll(".toggle-password");
const emailInput = document.getElementById("email") as HTMLInputElement;
const confirmBtn = document.getElementById("confirm-btn") as HTMLButtonElement;
const errorMsg = document.getElementById("code-error") as HTMLParagraphElement;
const emailDiv = document.querySelector(".email-div") as HTMLDivElement;

const resetCodeDiv = document.querySelector(".reset-code") as HTMLDivElement;
const codeInput = document.getElementById("code-input") as HTMLInputElement;
const verifyBtn = document.getElementById("verify-btn") as HTMLButtonElement;
const otpError = document.getElementById("otp-error") as HTMLParagraphElement;

const setPasswordInput = document.getElementById("setPassword") as HTMLInputElement;
const confirmPasswordInput = document.getElementById("confirmPassword") as HTMLInputElement;
const continueBtn = document.getElementById("continue-btn") as HTMLButtonElement;
const form = document.querySelector(".form") as HTMLFormElement;
const registerCodeDiv = document.querySelector(".register-code") as HTMLDivElement;
const registerBtn = document.getElementById("register-btn") as HTMLButtonElement;
const registerSuccessMsg = document.getElementById("messageR") as HTMLParagraphElement;

const passwordGroup = document.querySelector(".password-group1") as HTMLDivElement;
const setNewPasswordInput = document.getElementById("setNewPassword") as HTMLInputElement;
const confirmNewPasswordInput = document.getElementById("confirmNewPassword") as HTMLInputElement;
const passwordError = document.getElementById("password-error") as HTMLParagraphElement;
const confirmError = document.getElementById("confirm-error") as HTMLParagraphElement;
const waitMessage = document.getElementById("wait-message") as HTMLParagraphElement;


const a_form = document.getElementById("a-form") as HTMLFormElement;
const successMessage = document.getElementById("message") as HTMLParagraphElement;

let currentEmail = "";

if (continueBtn) {
     setPasswordInput.addEventListener("keyup", () => {
        validatePasswords(setPasswordInput.value.trim(), confirmPasswordInput.value.trim());
    });

    confirmPasswordInput.addEventListener("keyup", () => {
        validatePasswords(setPasswordInput.value.trim(), confirmPasswordInput.value.trim());
    });

    continueBtn.addEventListener("click", async function(e) {
    // registerCodeDiv.style.display = "block";
    e.preventDefault();
    
    const errors = validatePasswords(setPasswordInput.value.trim(), confirmPasswordInput.value.trim());
    
    if (errors.isValid === false) {
        return;
    }

    registerCodeDiv.style.display = "block";
    continueBtn.style.display = "none";
    await fetch("/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationEmail: emailInput.value.trim() })
    });
    
    passwordError.textContent = '';
    confirmError.textContent = '';

    registerBtn.addEventListener("click", async () => {
    const code = codeInput.value.trim();

    if (!code) {
        otpError.textContent = "Please enter the code.";
        return;
    }

    otpError.textContent = "";

    const data = await fetch("/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.value.trim(), code })
    }).then(r => r.json());

    if (!data.success) {
        otpError.textContent = data.message;
        return;
    }

    // });


    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                password: setPasswordInput.value.trim(),
                email: emailInput.value.trim()
             })
        });
        
        const data = await response.json();
        // console.log('Response data:', data);

        if (data.success) {
            console.log('Success! Redirecting...');
            registerSuccessMsg.textContent = 'Success!'
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            passwordError.textContent = data.error;
        }
    } catch (err) {
        console.error(err);
        passwordError.textContent = 'Registration failed';
    }
        });
    });

} else if (a_form) {
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

    waitMessage.textContent = "Please wait while we send the verification code...";

    await fetch("/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });

        currentEmail = email;
        emailDiv.style.display = "none";
        resetCodeDiv.style.display = "block";
        waitMessage.textContent = "";
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

    setNewPasswordInput.addEventListener("keyup", () => {
    validatePasswords(setNewPasswordInput.value.trim(), confirmNewPasswordInput.value.trim());
    });

    confirmNewPasswordInput.addEventListener("keyup", () => {
    validatePasswords(setNewPasswordInput.value.trim(), confirmNewPasswordInput.value.trim());
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
}


function validatePasswords(pass1: string, pass2: string) {
  let isValid = true;
  passwordError.textContent = "";
  confirmError.textContent = "";

    if (pass1 !== '' && pass1!.length < 8) {
        passwordError.textContent = 'Password must be at least 8 characters';
        isValid = false;
    }

    if (pass2 !== "" && pass1 !== pass2) {
        confirmError.textContent = "Passwords do not match.";
        isValid = false;
    }

  return { isValid };
}


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

