// ===== DOM ELEMENTS =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const trialForm = document.getElementById('trialForm');
const trialResults = document.getElementById('trialResults');
const contactForm = document.getElementById('contactForm');
const heroSection = document.querySelector('.hero');

// ===== SMOOTH GRADIENT ANIMATION =====
let gradientTime = 0;
const gradientSpeed = 0.008; // Daha hızlı ama smooth animasyon

function updateGradient() {
    if (!heroSection) return;
    
    const heroBefore = heroSection.querySelector('::before') || heroSection;
    
    // Smooth circular motion
    const x1 = 30 + 40 * Math.sin(gradientTime);
    const y1 = 20 + 30 * Math.cos(gradientTime * 0.7);
    const x2 = 70 + 30 * Math.sin(gradientTime * 1.3);
    const y2 = 80 + 20 * Math.cos(gradientTime * 0.5);
    
    const gradient = `radial-gradient(circle at ${x1}% ${y1}%, rgba(57, 239, 215, 0.1) 0%, transparent 50%), radial-gradient(circle at ${x2}% ${y2}%, rgba(57, 239, 215, 0.05) 0%, transparent 50%)`;
    
    heroSection.style.setProperty('--gradient-bg', gradient);
    heroSection.style.background = `linear-gradient(135deg, var(--background-dark) 0%, rgba(57, 239, 215, 0.05) 25%, rgba(57, 239, 215, 0.02) 50%, rgba(57, 239, 215, 0.08) 75%, var(--background-dark) 100%), ${gradient}`;
    
    gradientTime += gradientSpeed;
    requestAnimationFrame(updateGradient);
}

// Start gradient animation
updateGradient();

// ===== NAVIGATION =====

// Mobile menu toggle
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(24, 27, 31, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== TRIAL FORM HANDLING =====
if (trialForm) {
    trialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(trialForm);
        const sellerId = formData.get('sellerId');
        const country = formData.get('country');
        const speed = formData.get('speed');
        
        // Show loading state
        showLoadingState();
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show mock results
            showMockResults(sellerId, country, speed);
            
        } catch (error) {
            showErrorState('Analiz sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        }
    });
}

// ===== CONTACT FORM HANDLING =====
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const subject = formData.get('subject');
        const message = formData.get('message');
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Gönderiliyor...';
        submitBtn.disabled = true;
        
        try {
            // Simulate form submission
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success message
            showSuccessMessage('Mesajınız başarıyla gönderildi! En kısa sürede size dönüş yapacağız.');
            contactForm.reset();
            
        } catch (error) {
            showErrorMessage('Mesaj gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===== UTILITY FUNCTIONS =====

function showLoadingState() {
    trialResults.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            <h4>Analiz Yapılıyor...</h4>
            <p>Satıcı verileri toplanıyor, lütfen bekleyin.</p>
        </div>
    `;
}

function showMockResults(sellerId, country, speed) {
    const countryNames = {
        'US': 'ABD',
        'UK': 'İngiltere',
        'CA': 'Kanada',
        'AU': 'Avustralya',
        'MX': 'Meksika',
        'SA': 'Suudi Arabistan',
        'AE': 'BAE',
        'SG': 'Singapur'
    };
    
    const mockData = generateMockData();
    
    trialResults.innerHTML = `
        <div class="results-content">
            <div class="results-header">
                <h4><i class="fas fa-check-circle"></i> Analiz Tamamlandı</h4>
                <p>Satıcı ID: ${sellerId} | Ülke: ${countryNames[country]} | Hız: ${speed}</p>
            </div>
            
            <div class="results-summary">
                <div class="summary-item">
                    <span class="summary-label">Toplam Ürün</span>
                    <span class="summary-value">${mockData.totalProducts}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Kategoriler</span>
                    <span class="summary-value">${mockData.categories}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Ortalama Fiyat</span>
                    <span class="summary-value">$${mockData.avgPrice}</span>
                </div>
                <div class="summary-item">
                    <span class="summary-label">Ortalama Rating</span>
                    <span class="summary-value">${mockData.avgRating}★</span>
                </div>
            </div>
            
            <div class="results-categories">
                <h5>En Popüler Kategoriler</h5>
                <div class="category-list">
                    ${mockData.topCategories.map(cat => `
                        <div class="category-item">
                            <span class="category-name">${cat.name}</span>
                            <span class="category-count">${cat.count} ürün</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="results-cta">
                <p>Bu sadece demo sonuçtur. Gerçek analiz için Premium'a geçin!</p>
                <a href="#pricing" class="btn btn-primary">
                    <i class="fas fa-crown"></i>
                    Premium'a Geç
                </a>
            </div>
        </div>
    `;
}

function generateMockData() {
    const categories = [
        'Elektronik', 'Kitap', 'Ev & Bahçe', 'Giyim', 'Spor', 
        'Oyuncak', 'Kozmetik', 'Otomotiv', 'Sağlık', 'Müzik'
    ];
    
    const topCategories = [];
    for (let i = 0; i < 5; i++) {
        topCategories.push({
            name: categories[Math.floor(Math.random() * categories.length)],
            count: Math.floor(Math.random() * 200) + 50
        });
    }
    
    return {
        totalProducts: Math.floor(Math.random() * 1000) + 500,
        categories: Math.floor(Math.random() * 20) + 10,
        avgPrice: (Math.random() * 100 + 20).toFixed(2),
        avgRating: (Math.random() * 2 + 3).toFixed(1),
        topCategories: topCategories
    };
}

function showErrorState(message) {
    trialResults.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h4>Hata Oluştu</h4>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">
                <i class="fas fa-redo"></i>
                Tekrar Dene
            </button>
        </div>
    `;
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        </div>
    `;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// ===== ANIMATIONS =====

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// ===== PRICING BUTTONS =====
document.querySelectorAll('.pricing-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        if (btn.textContent.includes('Premium')) {
            showSuccessMessage('Premium plan seçildi! En kısa sürede size ulaşacağız.');
        } else {
            showSuccessMessage('Ücretsiz plan zaten aktif!');
        }
    });
});

// ===== ADDITIONAL CSS FOR DYNAMIC ELEMENTS =====
const additionalStyles = `
    .loading-state, .error-state {
        text-align: center;
        color: var(--text-muted);
    }
    
    .loading-state i, .error-state i {
        font-size: var(--font-size-3xl);
        margin-bottom: var(--spacing-md);
        color: var(--primary-color);
    }
    
    .results-content {
        width: 100%;
    }
    
    .results-header {
        margin-bottom: var(--spacing-lg);
        padding-bottom: var(--spacing-md);
        border-bottom: 1px solid var(--border-color);
    }
    
    .results-header h4 {
        color: var(--primary-color);
        margin-bottom: var(--spacing-xs);
    }
    
    .results-header p {
        color: var(--text-gray);
        font-size: var(--font-size-sm);
    }
    
    .results-summary {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--spacing-md);
        margin-bottom: var(--spacing-lg);
    }
    
    .summary-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-sm);
        background-color: var(--background-dark);
        border-radius: var(--radius-md);
    }
    
    .summary-label {
        color: var(--text-gray);
        font-size: var(--font-size-sm);
    }
    
    .summary-value {
        font-weight: 600;
        color: var(--text-white);
    }
    
    .results-categories {
        margin-bottom: var(--spacing-lg);
    }
    
    .results-categories h5 {
        color: var(--text-white);
        margin-bottom: var(--spacing-md);
    }
    
    .category-list {
        display: flex;
        flex-direction: column;
        gap: var(--spacing-xs);
    }
    
    .category-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--spacing-xs) var(--spacing-sm);
        background-color: var(--background-dark);
        border-radius: var(--radius-sm);
    }
    
    .category-name {
        color: var(--text-white);
    }
    
    .category-count {
        color: var(--text-gray);
        font-size: var(--font-size-sm);
    }
    
    .results-cta {
        text-align: center;
        padding-top: var(--spacing-md);
        border-top: 1px solid var(--border-color);
    }
    
    .results-cta p {
        margin-bottom: var(--spacing-md);
        color: var(--text-gray);
    }
    
    .success-message, .error-message {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    }
    
    .success-content, .error-content {
        display: flex;
        align-items: center;
        gap: var(--spacing-sm);
        padding: var(--spacing-md);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
    }
    
    .success-content {
        background-color: #10b981;
        color: white;
    }
    
    .error-content {
        background-color: #ef4444;
        color: white;
    }
    
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
    
    @media (max-width: 768px) {
        .results-summary {
            grid-template-columns: 1fr;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌍 Global Seller Scraper Website loaded successfully!');
    
    // Add loading animation to page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
}); 