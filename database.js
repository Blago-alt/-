// database.js - работа с localStorage

let db = {
    users: [],
    requests: [],
    services: []
};

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin123";

function loadDB() {
    const storedUsers = localStorage.getItem('coolmaster_users');
    const storedRequests = localStorage.getItem('coolmaster_requests');
    const storedServices = localStorage.getItem('coolmaster_services');
    
    if(storedUsers) db.users = JSON.parse(storedUsers);
    if(storedRequests) db.requests = JSON.parse(storedRequests);
    if(storedServices) db.services = JSON.parse(storedServices);
    
    if(db.users.length === 0) {
        db.users.push({ 
            id: 1, 
            fullname: "Тестовый Пользователь", 
            username: "user", 
            password: "1234", 
            isAdmin: false, 
            email: "user@example.com",
            createdAt: new Date().toISOString(),
            phone: ""
        });
        saveUsers();
    }
    
    db.users.forEach(u => { 
        if(u.isAdmin === undefined) u.isAdmin = false;
    });
    saveUsers();
}

function saveUsers() { 
    localStorage.setItem('coolmaster_users', JSON.stringify(db.users)); 
}

function saveRequests() { 
    localStorage.setItem('coolmaster_requests', JSON.stringify(db.requests)); 
}

function saveServices() { 
    localStorage.setItem('coolmaster_services', JSON.stringify(db.services)); 
}

function getNextId(arr) {
    return arr.length > 0 ? Math.max(...arr.map(i => i.id)) + 1 : 1;
}

let currentUser = null;

function login(username, password) {
    if(username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        currentUser = { 
            id: 0, 
            fullname: "Администратор", 
            username: "admin", 
            isAdmin: true,
            email: "admin@coolmaster.ru"
        };
        sessionStorage.setItem('coolmaster_session', JSON.stringify(currentUser));
        return true;
    }
    
    const user = db.users.find(u => u.username === username && u.password === password);
    if(user) {
        currentUser = { 
            id: user.id, 
            fullname: user.fullname, 
            username: user.username, 
            isAdmin: user.isAdmin === true,
            email: user.email || ""
        };
        sessionStorage.setItem('coolmaster_session', JSON.stringify(currentUser));
        return true;
    }
    return false;
}

function register(fullname, username, password, email) {
    if(db.users.some(u => u.username === username)) return false;
    
    const newUser = { 
        id: getNextId(db.users), 
        fullname, 
        username, 
        password, 
        email: email || "",
        isAdmin: false, 
        createdAt: new Date().toISOString(),
        phone: ""
    };
    db.users.push(newUser);
    saveUsers();
    return true;
}

function logout() {
    currentUser = null;
    sessionStorage.removeItem('coolmaster_session');
}

function restoreSession() {
    const session = sessionStorage.getItem('coolmaster_session');
    if(session) {
        const data = JSON.parse(session);
        if(data.username === "admin" && data.isAdmin) {
            currentUser = { 
                id: 0, 
                fullname: "Администратор", 
                username: "admin", 
                isAdmin: true,
                email: "admin@coolmaster.ru"
            };
        } else {
            const found = db.users.find(u => u.id === data.id);
            if(found) {
                currentUser = { 
                    id: found.id, 
                    fullname: found.fullname, 
                    username: found.username, 
                    isAdmin: found.isAdmin === true,
                    email: found.email || ""
                };
            }
        }
    }
}

function updateUIByAuth() {
    const authDiv = document.getElementById('authButtons');
    const welcomeDiv = document.getElementById('userWelcome');
    const userNameSpan = document.getElementById('userNameDisplay');
    const adminIndicator = document.getElementById('adminIndicator');
    const authMsg = document.getElementById('authRequiredMsg');
    const submitBtn = document.getElementById('submitRequestBtn');
    
    if(currentUser) {
        if(authDiv) authDiv.style.display = 'none';
        if(welcomeDiv) welcomeDiv.style.display = 'flex';
        if(userNameSpan) userNameSpan.innerText = currentUser.fullname;
        if(adminIndicator) adminIndicator.style.display = currentUser.isAdmin ? 'inline-block' : 'none';
        if(authMsg) authMsg.style.display = 'none';
        if(submitBtn) submitBtn.disabled = currentUser.isAdmin;
        
        const requestForm = document.getElementById('request-form');
        if(requestForm) requestForm.style.opacity = currentUser.isAdmin ? '0.6' : '1';
    } else {
        if(authDiv) authDiv.style.display = 'flex';
        if(welcomeDiv) welcomeDiv.style.display = 'none';
        if(authMsg) authMsg.style.display = 'block';
        if(submitBtn) submitBtn.disabled = true;
        
        const requestForm = document.getElementById('request-form');
        if(requestForm) requestForm.style.opacity = '1';
    }
    
    if(typeof renderUserRequests === 'function') renderUserRequests();
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'flex';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
}

window.onclick = (e) => {
    if(e.target.classList && e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
};
// Добавить промокоды
let promocodes = [];

function initPromocodes() {
    const stored = localStorage.getItem('coolmaster_promocodes');
    if(stored) {
        promocodes = JSON.parse(stored);
    } else {
        promocodes = [
            { code: "WELCOME10", discount: 10, active: true, usedCount: 0 },
            { code: "SUMMER20", discount: 20, active: true, usedCount: 0 }
        ];
        savePromocodes();
    }
}

function savePromocodes() { localStorage.setItem('coolmaster_promocodes', JSON.stringify(promocodes)); }

function validatePromo(code) {
    const promo = promocodes.find(p => p.code === code && p.active);
    return promo ? promo.discount : null;
}

function usePromo(code) {
    const promo = promocodes.find(p => p.code === code);
    if(promo) {
        promo.usedCount++;
        savePromocodes();
    }
}