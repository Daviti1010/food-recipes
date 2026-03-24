const toggleIcons = document.querySelectorAll(".toggle-password");
const form = document.querySelector(".form") as HTMLFormElement;
const setPasswordInput = document.getElementById("setPassword") as HTMLInputElement;
const confirmPasswordInput = document.getElementById("confirmPassword") as HTMLInputElement;
const emailInput = document.getElementById("email") as HTMLInputElement;

const setNewPasswordInput = document.getElementById("setNewPassword") as HTMLInputElement;
const confirmNewPasswordInput = document.getElementById("confirmNewPassword") as HTMLInputElement;

const passwordError = document.getElementById('password-error') as HTMLElement;
const confirmError = document.getElementById('confirm-error') as HTMLElement;

const a_form = document.getElementById('a-form') as HTMLFormElement;

const successMessage = document.getElementById("message") as HTMLParagraphElement;
 
let setPassword = null;
let confirmPassword = null;


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




if (setNewPasswordInput) {
    setNewPasswordInput.addEventListener("keyup", () => {
        validatePasswords(setNewPasswordInput.value.trim(), confirmNewPasswordInput.value.trim());
    });

    confirmNewPasswordInput.addEventListener("keyup", () => {
        validatePasswords(setNewPasswordInput.value.trim(), confirmNewPasswordInput.value.trim());
    });

    try {
        a_form?.addEventListener("submit", async (e) => {
            e.preventDefault();
    
        const errors = validatePasswords(setNewPasswordInput.value.trim(), confirmNewPasswordInput.value.trim());
    
        if (errors.isValid === false) {
            return;
        }
        
        passwordError.textContent = '';
        confirmError.textContent = '';

        await updatePassword(setNewPasswordInput.value.trim(), emailInput.value.trim());
        // console.log(setNewPasswordInput.value.trim());
        // console.log(emailInput.value.trim())
    })

    } catch (err) {
        console.log(err)
    }
    ////////
} else if (setPasswordInput) {
    setPasswordInput.addEventListener("keyup", () => {
        validatePasswords(setPasswordInput.value.trim(), confirmPasswordInput.value.trim());
    });

    confirmPasswordInput.addEventListener("keyup", () => {
        validatePasswords(setPasswordInput.value.trim(), confirmPasswordInput.value.trim());
    });

    form?.addEventListener("submit", async function(e) {
    e.preventDefault();
    
    const errors = validatePasswords(setPasswordInput.value.trim(), confirmPasswordInput.value.trim());
    
    if (errors.isValid === false) {
        return;
    }
    
    passwordError.textContent = '';
    confirmError.textContent = '';
    submitForm(setPasswordInput.value, emailInput.value);

    });
}




function validatePasswords(pass1:string, pass2:string) {
    setPassword = pass1;
    confirmPassword = pass2;

    let isValid = true;
    
    passwordError.textContent = '';
    confirmError.textContent = '';
    
    if (setPassword !== '' && setPassword!.length < 8) {
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

        // console.log('Response status:', response.status);
        // console.log('Response ok:', response.ok);   
        
        const data = await response.json();
        // console.log('Response data:', data);

        if (data.success) {
            console.log('Success! Redirecting...');
            successMessage.textContent = 'Success!'
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
}


async function updatePassword(password1: string, email: string) {
    try {
        const response = await fetch('/new-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password1, email })
        });

        const data = await response.json();

        if (data.success) {
            console.log("Success!");
            successMessage.textContent = 'Success!'
            setTimeout(() => {
                window.location.href = '/login';
            }, 1500);
        } else {
            console.log('Error');
        }
    } catch (err) {
        console.log(err)
    }

}