export async function profileDropdown() {

    const response = await fetch(`/api/current-user`);
    const data = await response.json();
    const userId = data.userId;
    const email = data.email;

    // console.log(userId);

    const dropdownEmail = document.getElementById("user-email") as HTMLSpanElement;
    dropdownEmail.textContent = email;

    const profileIcon = document.getElementById('profile-btn') as HTMLDivElement;
    const dropdownMenu = document.getElementById('dropdown-menu') as HTMLDivElement;
    const dropdownHeader = document.getElementById("dropdown-header") as HTMLDivElement;
    const dropdownMiddle = document.querySelector('.dropdown-middle') as HTMLDivElement;
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
    const loginBtn = document.getElementById('login-btn') as HTMLButtonElement;

    if (userId === null) {
        dropdownHeader.style.display = 'none';
        dropdownMiddle.style.display = 'none';
    } else {
        loginBtn.style.display = 'none';
    }
    
    if (!profileIcon || !dropdownMenu) return;
    
    profileIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    // closing dropdown when clicking somewhere else
    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (!profileIcon.contains(target) && !dropdownMenu.contains(target)) {
            dropdownMenu.classList.remove('show');
        }
    });
    
    const dropdownLinks = dropdownMenu.querySelectorAll('a');
    dropdownLinks.forEach(link => {
        link.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    });

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = '/login';
        })
    }
    
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                });
                
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                window.location.href = '/login';
                
            } catch (err) {
                console.error('Logout error:', err);
                
                localStorage.clear();
                window.location.href = '/login';
            }
                });
            }
};
