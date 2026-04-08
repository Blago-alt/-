// services.js - управление услугами

const DEFAULT_SERVICES = [
    { id: 1, name: "Диагностика", price: 500, icon: "fa-stethoscope", description: "Полная проверка системы", popular: true },
    { id: 2, name: "Чистка кондиционера", price: 1500, icon: "fa-fan", description: "Профессиональная чистка внутреннего и внешнего блока", popular: true },
    { id: 3, name: "Заправка фреоном", price: 2000, icon: "fa-gas-pump", description: "Заправка и дозаправка", popular: true },
    { id: 4, name: "Ремонт платы управления", price: 3000, icon: "fa-microchip", description: "Восстановление электроники", popular: false },
    { id: 5, name: "Замена компрессора", price: 8000, icon: "fa-tools", description: "Полная замена компрессора", popular: false },
    { id: 6, name: "Монтаж кондиционера", price: 5000, icon: "fa-wrench", description: "Установка под ключ", popular: true }
];

function initServices() {
    if(db.services.length === 0) {
        db.services = [...DEFAULT_SERVICES];
        saveServices();
    }
}

function getServiceById(id) {
    return db.services.find(s => s.id === id);
}

function addService(name, price, icon = "fa-cog") {
    const newService = { 
        id: getNextId(db.services), 
        name, 
        price: parseInt(price), 
        icon, 
        description: "",
        popular: false
    };
    db.services.push(newService);
    saveServices();
    return newService;
}

function deleteService(id) {
    const index = db.services.findIndex(s => s.id === id);
    if(index !== -1) {
        db.services.splice(index, 1);
        saveServices();
        return true;
    }
    return false;
}

function updateService(id, name, price) {
    const service = db.services.find(s => s.id === id);
    if(service) {
        service.name = name;
        service.price = parseInt(price);
        saveServices();
        return true;
    }
    return false;
}

function renderServicesGrid() {
    const container = document.getElementById('servicesGrid');
    if(!container) return;
    
    container.innerHTML = db.services.map(service => `
        <div class="service-card" onclick="selectService('${service.name}')">
            <i class="fas ${service.icon}"></i>
            <h3>${service.name}</h3>
            <div class="service-price">${service.price.toLocaleString()} ₽</div>
            <p>${service.description || 'Профессиональное обслуживание'}</p>
            ${service.popular ? '<span class="badge" style="margin-top:10px;">🔥 Популярное</span>' : ''}
        </div>
    `).join('');
    
    const serviceSelect = document.getElementById('requestService');
    if(serviceSelect) {
        serviceSelect.innerHTML = '<option value="">Выберите услугу</option>' + 
            db.services.map(s => `<option value="${s.name}" data-price="${s.price}">${s.name} - ${s.price.toLocaleString()} ₽</option>`).join('');
    }
}

function selectService(serviceName) {
    const select = document.getElementById('requestService');
    if(select) {
        for(let opt of select.options) {
            if(opt.value === serviceName) {
                opt.selected = true;
                document.getElementById('request-form').scrollIntoView({ behavior: 'smooth' });
                break;
            }
        }
    }
}

function calculateTotal(serviceName, urgency) {
    const service = db.services.find(s => s.name === serviceName);
    if(!service) return 0;
    let total = service.price;
    if(urgency === "Срочная (+30%)") total *= 1.3;
    return Math.round(total);
}