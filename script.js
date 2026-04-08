// script.js - основная логика приложения

let statisticsVisible = false;

function init() {
    loadDB();
    initServices();
    restoreSession();
    renderServicesGrid();
    initAuth();
    initRequestForm();
    initStatistics();
    initAdminPanel();
    updateUIByAuth();
}

function initRequestForm() {
    const form = document.getElementById('repairRequestForm');
    if(form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            if(!currentUser) { 
                showNotification('Авторизуйтесь для создания заявки', 'error');
                openModal('loginModal'); 
                return; 
            }
            if(currentUser.isAdmin) { 
                showNotification('Администратор не может создавать заявки', 'error');
                return; 
            }
            
            const device = document.getElementById('requestDevice').value.trim();
            const service = document.getElementById('requestService').value;
            const description = document.getElementById('requestDesc').value.trim();
            const phone = document.getElementById('requestPhone').value.trim();
            const urgency = document.getElementById('requestUrgency').value;
            const address = document.getElementById('requestAddress').value.trim();
            
            if(!device || !service || !description || !phone || !address) {
                showNotification('Заполните все поля', 'error');
                return;
            }
            
            const totalCost = calculateTotal(service, urgency);
            const newRequest = {
                id: getNextId(db.requests),
                userId: currentUser.id,
                device,
                service,
                description,
                phone,
                urgency,
                address,
                totalCost,
                status: "Новая",
                createdAt: new Date().toISOString()
            };
            
            db.requests.push(newRequest);
            saveRequests();
            showNotification(`Заявка создана! Стоимость: ${totalCost.toLocaleString()} ₽`, 'success');
            form.reset();
            renderUserRequests();
            if(typeof updateStatistics === 'function') updateStatistics();
        };
    }
}

function renderUserRequests() {
    const tbody = document.getElementById('requestsTableBody');
    if(!currentUser || currentUser.isAdmin) {
        if(tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Авторизуйтесь как пользователь</td></tr>';
        return;
    }
    
    const userRequests = db.requests.filter(r => r.userId === currentUser.id);
    if(userRequests.length === 0) {
        if(tbody) tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">У вас пока нет заявок</td></tr>';
        return;
    }
    
    if(tbody) {
        tbody.innerHTML = userRequests.map(req => `
            <tr>
                <td>${req.id}</td>
                <td>${req.service || '-'}</td>
                <td>${req.device}</td>
                <td>${req.description.substring(0, 50)}</td>
                <td><strong>${req.totalCost?.toLocaleString() || '-'} ₽</strong></td>
                <td><span class="badge">${req.status}</span></td>
                <td><button class="delete-btn" onclick="deleteOwnRequest(${req.id})">🗑️ Удалить</button></td>
            </tr>
        `).join('');
    }
}

function deleteOwnRequest(requestId) {
    const index = db.requests.findIndex(r => r.id === requestId && r.userId === currentUser?.id);
    if(index !== -1) {
        db.requests.splice(index, 1);
        saveRequests();
        renderUserRequests();
        if(typeof updateStatistics === 'function') updateStatistics();
        showNotification('Заявка удалена', 'success');
    }
}

function initStatistics() {
    const statsLink = document.getElementById('statsLink');
    if(statsLink) {
        statsLink.onclick = (e) => {
            e.preventDefault();
            if(currentUser) {
                document.getElementById('statistics').style.display = 'block';
                document.getElementById('adminPanel').style.display = 'none';
                updateStatistics();
            } else {
                showNotification('Авторизуйтесь для просмотра статистики', 'error');
                openModal('loginModal');
            }
        };
    }
}

function updateStatistics() {
    const container = document.getElementById('statsDashboard');
    if(!container) return;
    
    const totalRequests = db.requests.length;
    const completedRequests = db.requests.filter(r => r.status === "Выполнена").length;
    const totalRevenue = db.requests.reduce((sum, r) => sum + (r.totalCost || 0), 0);
    const pendingRequests = db.requests.filter(r => r.status === "Новая").length;
    const inProgressRequests = db.requests.filter(r => r.status === "В работе").length;
    
    container.innerHTML = `
        <div class="stat-card"><h3>📋 Всего заявок</h3><div class="stat-number">${totalRequests}</div></div>
        <div class="stat-card"><h3>✅ Выполнено</h3><div class="stat-number">${completedRequests}</div></div>
        <div class="stat-card"><h3>💰 Выручка</h3><div class="stat-number">${totalRevenue.toLocaleString()} ₽</div></div>
        <div class="stat-card"><h3>⏳ В работе</h3><div class="stat-number">${inProgressRequests}</div></div>
        <div class="stat-card"><h3>🆕 Новые</h3><div class="stat-number">${pendingRequests}</div></div>
    `;
    
    const adminStats = document.getElementById('adminStatsDashboard');
    if(adminStats) {
        adminStats.innerHTML = `
            <div class="stat-card"><h3>👥 Пользователей</h3><div class="stat-number">${db.users.length}</div></div>
            <div class="stat-card"><h3>📊 Средний чек</h3><div class="stat-number">${totalRequests ? Math.round(totalRevenue/totalRequests).toLocaleString() : 0} ₽</div></div>
            <div class="stat-card"><h3>🏆 Услуг</h3><div class="stat-number">${db.services.length}</div></div>
            <div class="stat-card"><h3>⭐ Конверсия</h3><div class="stat-number">${totalRequests ? Math.round((completedRequests/totalRequests)*100) : 0}%</div></div>
        `;
    }
}

// Глобальные функции для вызова из HTML
window.deleteOwnRequest = deleteOwnRequest;
window.adminDeleteRequest = adminDeleteRequest;
window.adminDeleteUser = adminDeleteUser;
window.editServicePrompt = editServicePrompt;
window.deleteServiceAndRefresh = deleteServiceAndRefresh;
window.selectService = selectService;
window.showNotification = showNotification;

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);