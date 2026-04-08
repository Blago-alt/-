// reviews.js - улучшенная система отзывов с анимациями

let reviews = [];
let selectedRating = 0;

function initReviews() {
    const storedReviews = localStorage.getItem('coolmaster_reviews');
    if(storedReviews) {
        reviews = JSON.parse(storedReviews);
    } else {
        // Более живые и реалистичные отзывы
        reviews = [
            { 
                id: 1, 
                userId: 1, 
                userName: "Алексей Смирнов", 
                userAvatar: "AS",
                rating: 5, 
                text: "Огромное спасибо команде CoolMaster! Кондиционер перестал охлаждать в самый разгар жары. Мастер приехал через 40 минут, быстро диагностировал проблему, заправил фреоном. Цена адекватная, работа качественная. Обязательно буду рекомендовать друзьям!", 
                date: "2025-03-15", 
                approved: true,
                service: "Заправка фреоном"
            },
            { 
                id: 2, 
                userId: 2, 
                userName: "Елена Виноградова", 
                userAvatar: "ЕВ",
                rating: 5, 
                text: "Заказывала чистку кондиционера. Приехал вежливый мастер, всё объяснил, показал до/после. Результат отличный - воздух стал свежее, работает тише. Цена фиксированная, никаких доплат. Спасибо!", 
                date: "2025-03-10", 
                approved: true,
                service: "Чистка кондиционера"
            },
            { 
                id: 3, 
                userId: 3, 
                userName: "Дмитрий Козлов", 
                userAvatar: "ДК",
                rating: 5, 
                text: "Ремонтировал плату управления. Мастер приехал с запчастями, всё сделал за час. Даже дал гарантию 6 месяцев на заменённую деталь. Очень доволен сервисом, обращусь ещё!", 
                date: "2025-03-05", 
                approved: true,
                service: "Ремонт платы"
            },
            { 
                id: 4, 
                userId: 4, 
                userName: "Ольга Михайлова", 
                userAvatar: "ОМ",
                rating: 5, 
                text: "Заказывала монтаж сплит-системы. Ребята установили аккуратно, все коммуникации спрятали. Даже помогли выбрать место для лучшего распределения воздуха. Рекомендую!", 
                date: "2025-02-28", 
                approved: true,
                service: "Монтаж"
            },
            { 
                id: 5, 
                userId: 5, 
                userName: "Игорь Петров", 
                userAvatar: "ИП",
                rating: 5, 
                text: "Срочно потребовался ремонт в офис. Приехали через час, быстро нашли проблему (компрессор), заменили. Офис снова работает в комфортном режиме. Спасибо за оперативность!", 
                date: "2025-02-20", 
                approved: true,
                service: "Замена компрессора"
            },
            { 
                id: 6, 
                userId: 6, 
                userName: "Татьяна Соколова", 
                userAvatar: "ТС",
                rating: 4, 
                text: "Всё понравилось, но немного задержались с приездом на 15 минут. В остальном отлично - и цену озвучили заранее, и работу выполнили качественно.", 
                date: "2025-02-15", 
                approved: true,
                service: "Диагностика"
            }
        ];
        saveReviews();
    }
    renderReviews();
    updateRatingSummary();
    initStarRating();
}

function saveReviews() {
    localStorage.setItem('coolmaster_reviews', JSON.stringify(reviews));
}

function getRandomAvatar(name) {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#ffd966', '#ff9f1c'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function renderReviews() {
    const container = document.getElementById('reviewsGrid');
    if(!container) return;
    
    const approvedReviews = reviews.filter(r => r.approved).sort((a,b) => new Date(b.date) - new Date(a.date));
    
    if(approvedReviews.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem; background: rgba(255,255,255,0.1); border-radius: 28px; backdrop-filter: blur(10px);">
                <i class="fas fa-star" style="font-size: 3rem; color: #ffd966; margin-bottom: 1rem;"></i>
                <p style="color: white; font-size: 1.1rem;">Пока нет отзывов</p>
                <p style="color: rgba(255,255,255,0.7);">Будьте первым, кто оставит отзыв о нашем сервисе!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = approvedReviews.map((review, index) => `
        <div class="review-card" style="animation-delay: ${index * 0.1}s">
            <div class="review-header">
                <strong>
                    <i class="fas fa-user-circle" style="color: ${getRandomAvatar(review.userName)}"></i>
                    ${review.userName}
                    ${review.service ? `<span style="font-size: 0.7rem; background: #eef2ff; padding: 2px 8px; border-radius: 20px; color: #667eea;">${review.service}</span>` : ''}
                </strong>
                <div class="stars">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
            </div>
            <div class="review-text">${review.text}</div>
            <div class="review-date">
                <i class="fas fa-calendar-alt"></i> 
                ${new Date(review.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
        </div>
    `).join('');
}

function updateRatingSummary() {
    const approved = reviews.filter(r => r.approved);
    if(approved.length === 0) return;
    
    const avg = approved.reduce((sum, r) => sum + r.rating, 0) / approved.length;
    
    const avgRatingEl = document.getElementById('avgRating');
    const avgStarsEl = document.getElementById('avgRatingStars');
    const reviewCountEl = document.getElementById('reviewCount');
    
    if(avgRatingEl) avgRatingEl.innerHTML = avg.toFixed(1);
    if(avgStarsEl) {
        const fullStars = Math.round(avg);
        avgStarsEl.innerHTML = '★'.repeat(fullStars) + '☆'.repeat(5-fullStars);
    }
    if(reviewCountEl) reviewCountEl.innerHTML = `${approved.length} отзывов`;
    
    const ratingCounts = {5:0,4:0,3:0,2:0,1:0};
    approved.forEach(r => ratingCounts[r.rating]++);
    
    const barsContainer = document.getElementById('ratingBars');
    if(barsContainer) {
        barsContainer.innerHTML = [5,4,3,2,1].map(rating => {
            const percentage = (ratingCounts[rating] / approved.length) * 100;
            return `
                <div class="rating-bar-item">
                    <span>${rating} ★</span>
                    <div class="bar-bg">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                    </div>
                    <span>${ratingCounts[rating]}</span>
                </div>
            `;
        }).join('');
    }
}

function initStarRating() {
    const stars = document.querySelectorAll('#starRating i');
    const ratingInput = document.getElementById('ratingValue');
    
    stars.forEach(star => {
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            stars.forEach((s, i) => {
                if(i < rating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach((s, i) => {
                if(i < selectedRating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
        });
        
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.rating);
            if(ratingInput) ratingInput.value = selectedRating;
            stars.forEach((s, i) => {
                if(i < selectedRating) {
                    s.classList.remove('far');
                    s.classList.add('fas');
                } else {
                    s.classList.remove('fas');
                    s.classList.add('far');
                }
            });
            
            // Эффект пульсации при выборе
            star.style.transform = 'scale(1.2)';
            setTimeout(() => { star.style.transform = 'scale(1)'; }, 200);
        });
    });
}

function addReview(rating, text) {
    if(!currentUser) {
        showNotification('✨ Авторизуйтесь, чтобы поделиться впечатлениями', 'error');
        return false;
    }
    if(currentUser.isAdmin) {
        showNotification('Администратор не может оставлять отзывы', 'error');
        return false;
    }
    if(!text.trim()) {
        showNotification('Пожалуйста, напишите ваш отзыв', 'error');
        return false;
    }
    
    const newReview = {
        id: getNextId(reviews),
        userId: currentUser.id,
        userName: currentUser.fullname,
        userAvatar: currentUser.fullname.charAt(0),
        rating: rating,
        text: text.trim(),
        date: new Date().toISOString().split('T')[0],
        approved: false,
        service: "Не указана"
    };
    
    reviews.push(newReview);
    saveReviews();
    
    // Показываем красивое уведомление
    showNotification('❤️ Спасибо за ваш отзыв! Он будет опубликован после модерации.', 'success');
    
    // Очищаем форму
    document.getElementById('reviewText').value = '';
    selectedRating = 0;
    const ratingInput = document.getElementById('ratingValue');
    if(ratingInput) ratingInput.value = 0;
    
    const stars = document.querySelectorAll('#starRating i');
    stars.forEach(s => {
        s.classList.remove('fas');
        s.classList.add('far');
    });
    
    return true;
}

function adminApproveReview(id) {
    const review = reviews.find(r => r.id === id);
    if(review) {
        review.approved = true;
        saveReviews();
        renderReviews();
        updateRatingSummary();
        renderAdminReviewsList();
        showNotification(`✅ Отзыв от ${review.userName} опубликован`, 'success');
        
        // Эффект конфетти для одобренного отзыва
        if(typeof createConfetti === 'function') createConfetti();
    }
}

function adminDeleteReview(id) {
    const review = reviews.find(r => r.id === id);
    if(review) {
        const userName = review.userName;
        const index = reviews.findIndex(r => r.id === id);
        if(index !== -1) {
            reviews.splice(index, 1);
            saveReviews();
            renderReviews();
            updateRatingSummary();
            renderAdminReviewsList();
            showNotification(`🗑️ Отзыв от ${userName} удалён`, 'info');
        }
    }
}

function renderAdminReviewsList() {
    const container = document.getElementById('adminReviewsList');
    if(!container) return;
    
    const sortedReviews = [...reviews].sort((a,b) => new Date(b.date) - new Date(a.date));
    
    if(sortedReviews.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:2rem;">Нет отзывов</p>';
        return;
    }
    
    container.innerHTML = sortedReviews.map(review => `
        <div class="review-admin-card">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <strong style="font-size: 1.1rem;">${review.userName}</strong>
                    <div class="stars" style="display: inline-block; margin-left: 10px;">${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</div>
                </div>
                <div class="review-meta" style="margin: 0;">
                    <i class="fas fa-calendar"></i> ${review.date}
                </div>
            </div>
            <div class="review-text">"${review.text}"</div>
            <div class="review-meta">
                Статус: ${review.approved ? '<span style="color:#4CAF50;">✅ Опубликован</span>' : '<span style="color:#ff9800;">⏳ На модерации</span>'}
            </div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                ${!review.approved ? `<button class="btn-primary" onclick="adminApproveReview(${review.id})" style="padding: 6px 16px;"><i class="fas fa-check"></i> Одобрить</button>` : ''}
                <button class="delete-btn" onclick="adminDeleteReview(${review.id})" style="padding: 6px 16px;"><i class="fas fa-trash"></i> Удалить</button>
            </div>
        </div>
    `).join('');
}

// Эффект конфетти
function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#ffd966', '#ff9f1c'];
    for(let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position: fixed;
            width: 10px;
            height: 10px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            left: ${Math.random() * window.innerWidth}px;
            top: -10px;
            border-radius: 2px;
            pointer-events: none;
            z-index: 10000;
            animation: confettiFall ${2 + Math.random() * 2}s linear forwards;
        `;
        document.body.appendChild(confetti);
        setTimeout(() => confetti.remove(), 3000);
    }
}

// Добавляем анимацию конфетти в CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes confettiFall {
        to {
            transform: translateY(${window.innerHeight + 50}px) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    initReviews();
    
    const submitBtn = document.getElementById('submitReviewBtn');
    if(submitBtn) {
        submitBtn.addEventListener('click', () => {
            const textarea = document.getElementById('reviewText');
            if(selectedRating > 0) {
                addReview(selectedRating, textarea.value);
            } else {
                showNotification('⭐ Пожалуйста, оцените нашу работу', 'error');
                
                // Эффект встряски для звёзд
                const starsContainer = document.querySelector('.star-rating');
                if(starsContainer) {
                    starsContainer.style.animation = 'shake 0.5s ease';
                    setTimeout(() => { starsContainer.style.animation = ''; }, 500);
                }
            }
        });
    }
    
    // Отображаем секцию отзыва если пользователь авторизован
    const reviewSection = document.getElementById('addReviewSection');
    if(reviewSection) {
        const checkUser = setInterval(() => {
            if(currentUser && !currentUser.isAdmin) {
                reviewSection.style.display = 'block';
                clearInterval(checkUser);
            } else if(currentUser?.isAdmin) {
                reviewSection.style.display = 'none';
                clearInterval(checkUser);
            }
        }, 100);
    }
});