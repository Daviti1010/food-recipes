const toggleIcons = document.querySelectorAll(".toggle-password");
const form = document.querySelector(".form") as HTMLFormElement;
const setPasswordInput = document.getElementById("setPassword") as HTMLInputElement;
const confirmPasswordInput = document.getElementById("confirmPassword") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;

const passwordError = document.getElementById('password-error') as HTMLElement;
const confirmError = document.getElementById('confirm-error') as HTMLElement;


toggleIcons.forEach(icon => {

    icon.addEventListener("click", () => {

        const input = icon.previousElementSibling! as HTMLInputElement;
        

        if (input.type === "password") {
            input.type = "text";
            icon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            input.type = "password";
            icon.classList.replace("fa-eye-slash", "fa-eye");
        }

    });

});


form?.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const errors = validatePasswords();
    
    if (errors.isValid === false) {
        return;
    }
    
    passwordError.textContent = '';
    confirmError.textContent = '';
    submitForm(setPasswordInput.value, emailInput.value);

});


setPasswordInput.addEventListener("keyup", () => {
    validatePasswords();
});


confirmPasswordInput.addEventListener("keyup", () => {
    validatePasswords();
});

function validatePasswords() {
    const setPassword = setPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    let isValid = true;
    
    passwordError.textContent = '';
    confirmError.textContent = '';
    
    if (setPassword !== '' && setPassword.length < 8) {
        passwordError.textContent = 'Password must be at least 8 characters';
        isValid = false;
    }
    
    if (confirmPassword !== '' && setPassword !== confirmPassword) {
        confirmError.textContent = 'Passwords do not match';
        isValid = false;
    }
    
    return { isValid };
}

async function submitForm(password: string, email: string) {
    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                password: password,
                email: email
             })
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);   
        
        const data = await response.json();
        console.log('Response data:', data);

        if (data.success) {
            console.log('Success! Redirecting...');
            window.location.href = '/login';
        } else {
            passwordError.textContent = data.error;
        }
    } catch (err) {
        console.error(err);
        passwordError.textContent = 'Registration failed';
    }
}
