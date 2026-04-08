// admin.js - панель администратора

function renderAdminRequests() {
    if(!currentUser?.isAdmin) return;
    const tbody = document.getElementById('adminRequestsBody');
    if(!tbody) return;
    
    const allRequests = [...db.requests].sort((a,b) => b.id - a.id);
    if(allRequests.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7">Нет заявок</td>';
        return;
    }
    
    tbody.innerHTML = allRequests.map(req => {
        const user = db.users.find(u => u.id === req.userId);
        return `
            <tr>
                <td>${req.id}</td>
                <td>${user ? user.fullname : 'ID:' + req.userId}</td>
                <td>${req.service || '-'}</td>
                <td>${req.device}</td>
                <td>${req.totalCost?.toLocaleString() || '-'} ₽</td>
                <td><select class="status-select" data-id="${req.id}">${getStatusOptions(req.status)}</select></td>
                <td><button class="delete-btn" onclick="adminDeleteRequest(${req.id})">🗑️ Удалить</button></td>
            </tr>
        `;
    }).join('');
    
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', (e) => adminUpdateStatus(parseInt(e.target.dataset.id), e.target.value));
    });
}

function getStatusOptions(current) {
    const statuses = ["Новая", "В работе", "Выполнена", "Отменена"];
    return statuses.map(s => `<option ${s === current ? 'selected' : ''}>${s}</option>`).join('');
}

function adminDeleteRequest(requestId) {
    if(!currentUser?.isAdmin) return;
    const index = db.requests.findIndex(r => r.id === requestId);
    if(index !== -1) {
        db.requests.splice(index, 1);
        saveRequests();
        renderAdminRequests();
        if(typeof renderUserRequests === 'function') renderUserRequests();
        if(typeof updateStatistics === 'function') updateStatistics();
        showNotification('Заявка удалена', 'success');
    }
}

function adminUpdateStatus(requestId, newStatus) {
    const req = db.requests.find(r => r.id === requestId);
    if(req) {
        req.status = newStatus;
        saveRequests();
        renderAdminRequests();
        if(typeof renderUserRequests === 'function') renderUserRequests();
        if(typeof updateStatistics === 'function') updateStatistics();
        showNotification(`Статус заявки #${requestId} изменён на "${newStatus}"`, 'success');
    }
}

function renderUsersTable() {
    if(!currentUser?.isAdmin) return;
    const tbody = document.getElementById('usersTableBody');
    if(!tbody) return;
    
    tbody.innerHTML = db.users.map(user => {
        const userRequests = db.requests.filter(r => r.userId === user.id);
        return `
            <tr>
                <td>${user.id}</td>
                <td>${user.fullname}</td>
                <td>${user.username}</td>
                <td>${userRequests.length}</td>
                <td>${user.isAdmin ? '👑 Админ' : '👤 Пользователь'}</td>
                <td><button class="delete-btn" onclick="adminDeleteUser(${user.id})">🗑️ Удалить</button></td>
            </tr>
        `;
    }).join('');
}

function adminDeleteUser(userId) {
    if(userId === currentUser?.id) { 
        showNotification('Нельзя удалить самого себя', 'error');
        return; 
    }
    const userIndex = db.users.findIndex(u => u.id === userId);
    if(userIndex !== -1) {
        const userName = db.users[userIndex].fullname;
        db.requests = db.requests.filter(r => r.userId !== userId);
        db.users.splice(userIndex, 1);
        saveUsers();
        saveRequests();
        renderUsersTable();
        renderAdminRequests();
        if(typeof renderUserRequests === 'function') renderUserRequests();
        if(typeof updateStatistics === 'function') updateStatistics();
        showNotification(`Пользователь ${userName} удалён`, 'success');
    }
}

function renderAdminServicesList() {
    const container = document.getElementById('adminServicesList');
    if(!container) return;
    container.innerHTML = db.services.map(service => `
        <div class="service-card" style="display:flex; justify-content:space-between; align-items:center;">
            <div><strong>${service.name}</strong> - ${service.price.toLocaleString()} ₽</div>
            <div>
                <button class="btn-primary" onclick="editServicePrompt(${service.id})" style="margin-right:5px;">✏️</button>
                <button class="delete-btn" onclick="deleteServiceAndRefresh(${service.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

function editServicePrompt(id) {
    const service = db.services.find(s => s.id === id);
    if(service) {
        const newName = prompt("Новое название:", service.name);
        const newPrice = prompt("Новая цена (₽):", service.price);
        if(newName && newPrice) {
            updateService(id, newName, parseInt(newPrice));
            renderAdminServicesList();
            if(typeof renderServicesGrid === 'function') renderServicesGrid();
            showNotification('Услуга обновлена', 'success');
        }
    }
}

function deleteServiceAndRefresh(id) {
    if(deleteService(id)) {
        renderAdminServicesList();
        if(typeof renderServicesGrid === 'function') renderServicesGrid();
        showNotification('Услуга удалена', 'success');
    }
}

function initAdminPanel() {
    const adminLink = document.getElementById('adminPanelLink');
    if(adminLink) {
        adminLink.addEventListener('click', (e) => {
            e.preventDefault();
            if(currentUser?.isAdmin) {
                document.getElementById('adminPanel').style.display = 'block';
                document.getElementById('statistics').style.display = 'none';
                renderAdminRequests();
                renderUsersTable();
                renderAdminServicesList();
                if(typeof updateStatistics === 'function') updateStatistics();
            } else {
                showNotification('Доступ только для администратора. Войдите как admin / admin123', 'error');
            }
        });
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(tab => tab.style.display = 'none');
            const tabId = btn.dataset.tab + 'Tab';
            const tabElement = document.getElementById(tabId);
            if(tabElement) tabElement.style.display = 'block';
            
            if(btn.dataset.tab === 'services-manage') renderAdminServicesList();
            if(btn.dataset.tab === 'users') renderUsersTable();
            if(btn.dataset.tab === 'stats' && typeof updateStatistics === 'function') updateStatistics();
        });
    });
    
    const addServiceBtn = document.getElementById('addServiceBtn');
    if(addServiceBtn) {
        addServiceBtn.addEventListener('click', () => {
            const name = document.getElementById('newServiceName')?.value;
            const price = document.getElementById('newServicePrice')?.value;
            if(name && price) {
                addService(name, parseInt(price));
                renderAdminServicesList();
                if(typeof renderServicesGrid === 'function') renderServicesGrid();
                document.getElementById('newServiceName').value = '';
                document.getElementById('newServicePrice').value = '';
                showNotification('Услуга добавлена', 'success');
            } else {
                showNotification('Заполните все поля', 'error');
            }
        });
    }
}

function hideAdminPanel() {
    const adminPanel = document.getElementById('adminPanel');
    if(adminPanel) adminPanel.style.display = 'none';
}