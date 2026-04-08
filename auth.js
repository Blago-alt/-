// auth.js - отдельный файл для авторизации и регистрации

function initAuth() {
    initAuthButtons();
    initLoginForm();
    initRegisterForm();
}

function initAuthButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');

    if(loginBtn) loginBtn.onclick = () => openModal('loginModal');
    if(registerBtn) registerBtn.onclick = () => openModal('registerModal');
    if(logoutBtn) logoutBtn.onclick = () => {
        logout();
        updateUIByAuth();
        if(typeof hideAdminPanel === 'function') hideAdminPanel();
        if(typeof renderUserRequests === 'function') renderUserRequests();
        showNotification('Вы вышли из системы', 'info');
    };
    if(switchToRegister) switchToRegister.onclick = (e) => {
        e.preventDefault();
        closeAllModals();
        openModal('registerModal');
    };
    if(switchToLogin) switchToLogin.onclick = (e) => {
        e.preventDefault();
        closeAllModals();
        openModal('loginModal');
    };
}

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.onsubmit = (e) => {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            
            if(login(username, password)) {
                showNotification(`Добро пожаловать, ${currentUser.fullname}!`, 'success');
                closeAllModals();
                updateUIByAuth();
                document.getElementById('loginForm').reset();
                if(typeof renderUserRequests === 'function') renderUserRequests();
                if(typeof updateStatistics === 'function') updateStatistics();
            } else {
                showNotification('Неверный логин или пароль', 'error');
            }
        };
    }
}

function initRegisterForm() {
    const registerForm = document.getElementById('registerForm');
    if(registerForm) {
        registerForm.onsubmit = (e) => {
            e.preventDefault();
            const fullname = document.getElementById('regFullname').value.trim();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            
            if(!fullname || !username || password.length < 4) {
                showNotification('Заполните все поля. Пароль минимум 4 символа', 'error');
                return;
            }
            
            if(register(fullname, username, password, email)) {
                showNotification('Регистрация успешна! Теперь войдите.', 'success');
                closeAllModals();
                openModal('loginModal');
                document.getElementById('registerForm').reset();
            } else {
                showNotification('Пользователь с таким логином уже существует', 'error');
            }
        };
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 50px;
        z-index: 10000;
        animation: slideInRight 0.3s;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        font-weight: 500;
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);