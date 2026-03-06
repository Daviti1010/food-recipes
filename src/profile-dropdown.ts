export function profileDropdown() {
    const profileIcon = document.getElementById('profile-btn') as HTMLDivElement;
    const dropdownMenu = document.getElementById('dropdown-menu') as HTMLDivElement;
    const logoutBtn = document.getElementById('logout-btn') as HTMLButtonElement;
    
    if (!profileIcon || !dropdownMenu) return;
    
    profileIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });
    
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
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdownMenu.classList.remove('show');
        }
    });
    
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