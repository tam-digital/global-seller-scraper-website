// ===== DOM ELEMENTS =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const trialForm = document.getElementById('trialForm');
const trialResults = document.getElementById('trialResults');
const contactForm = document.getElementById('contactForm');
const heroSection = document.querySelector('.hero');
const registerForm = document.getElementById('registerForm');
const registerMessage = document.getElementById('registerMessage');

// ===== FIREBASE CONFIG =====
const firebaseConfig = {
    apiKey: "AIzaSyCPJay7-9xPVVXh-0FzKsaMw6LxmmLjvws",
    authDomain: "globalsellerscraper.firebaseapp.com",
    projectId: "globalsellerscraper",
    storageBucket: "globalsellerscraper.appspot.com",
    messagingSenderId: "768895134845",
    appId: "768895134845:web:9907c4a23f57e0eb0f1514"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== HARDWARE FINGERPRINTING =====
function generateHardwareFingerprint() {
    const fingerprint = {
        screen: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        doNotTrack: navigator.doNotTrack,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: navigator.deviceMemory
    };
    
    // Hash oluştur
    const fingerprintString = JSON.stringify(fingerprint);
    return btoa(fingerprintString);
}

// ===== REGISTER FORM HANDLING =====
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        const name = formData.get('name');
        const company = formData.get('company');
        
        // Şifre kontrolü
        if (password !== confirmPassword) {
            showRegisterMessage('Şifreler eşleşmiyor!', 'error');
            return;
        }
        
        if (password.length < 6) {
            showRegisterMessage('Şifre en az 6 karakter olmalıdır!', 'error');
            return;
        }
        
        // Loading state
        const submitBtn = document.getElementById('registerSubmit');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hesap Oluşturuluyor...';
        submitBtn.disabled = true;
        
        try {
            // Firebase Auth ile kullanıcı oluştur
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Hardware fingerprint oluştur
            const fingerprint = generateHardwareFingerprint();
            
            // Email verification gönder
            await userCredential.user.sendEmailVerification({
                url: window.location.origin + '/trial.html?verified=true',
                handleCodeInApp: false
            });
            
            // Firestore'a kullanıcı verilerini kaydet
            await db.collection('users').doc(userCredential.user.uid).set({
                email: email,
                name: name,
                company: company || '',
                hardware_fingerprint: fingerprint,
                trial_status: "free",
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                last_login: firebase.firestore.FieldValue.serverTimestamp(),
                email_verified: false,
                email_verification_sent: firebase.firestore.FieldValue.serverTimestamp(),
                monthly_usage: { 
                    asin_scans: 0, 
                    product_scans: 0, 
                    seller_searches: 0 
                },
                limits: { 
                    asin_scans: 10000, 
                    product_scans: 10000, 
                    seller_searches: 0 
                },
                abuse_score: 0,
                is_verified: false,
                is_active: true,
                is_admin: false
            });
            
            // Hardware fingerprint kontrolü
            await checkHardwareFingerprint(fingerprint, userCredential.user.uid);
            
            showRegisterMessage(`
                <div class="success-message">
                    <h3>✅ Hesabınız Başarıyla Oluşturuldu!</h3>
                    <p>📧 Email adresinize doğrulama linki gönderilmeye çalışıldı.</p>
                    <div class="verification-options">
                        <p><strong>Seçenek 1:</strong> Email gelirse linke tıklayın</p>
                        <p><strong>Seçenek 2:</strong> Email gelmezse <a href="mailto:hello@tam-digital.com?subject=Email Verification&body=Merhaba, email verification işlemi için yardım istiyorum. Email: ${email}">buraya tıklayarak</a> bize yazın</p>
                    </div>
                    <div class="verification-info">
                        <p><i class="fas fa-info-circle"></i> Email gelmedi mi? Spam klasörünü de kontrol edin.</p>
                        <button id="resendVerification" class="btn btn-secondary" style="margin-top: 10px;">
                            <i class="fas fa-redo"></i> Tekrar Gönder
                        </button>
                    </div>
                </div>
            `, 'success');
            
            // Form'u temizle
            registerForm.reset();
            
            // Tekrar gönder butonuna event listener ekle
            const resendBtn = document.getElementById('resendVerification');
            if (resendBtn) {
                resendBtn.addEventListener('click', async () => {
                    try {
                        await userCredential.user.sendEmailVerification({
                            url: window.location.origin + '/trial.html?verified=true',
                            handleCodeInApp: false
                        });
                        showRegisterMessage('✅ Doğrulama emaili tekrar gönderildi!', 'success');
                    } catch (error) {
                        showRegisterMessage('❌ Email gönderilemedi. Lütfen tekrar deneyin.', 'error');
                    }
                });
            }
            
        } catch (error) {
            let errorMessage = 'Hesap oluşturulurken bir hata oluştu.';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Bu email adresi zaten kullanımda.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Şifre çok zayıf. Daha güçlü bir şifre seçin.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz email adresi.';
            } else if (error.message.includes('hardware')) {
                errorMessage = 'Bu cihazdan çok fazla hesap oluşturulmuş.';
            }
            
            showRegisterMessage(errorMessage, 'error');
        } finally {
            // Button'u eski haline getir
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// ===== EMAIL VERIFICATION CHECK =====
function checkEmailVerificationStatus() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
        showRegisterMessage(`
            <div class="success-message">
                <h3>✅ Email Adresiniz Doğrulandı!</h3>
                <p>Artık yazılımı indirip giriş yapabilirsiniz.</p>
                <div class="download-section">
                    <a href="#" class="btn btn-primary">
                        <i class="fas fa-download"></i>
                        Yazılımı İndir
                    </a>
                </div>
            </div>
        `, 'success');
    }
}

// ===== HARDWARE FINGERPRINT CHECK =====
async function checkHardwareFingerprint(fingerprint, userId) {
    try {
        const fingerprintRef = db.collection('hardware_fingerprints').doc(fingerprint);
        const fingerprintDoc = await fingerprintRef.get();
        
        if (fingerprintDoc.exists) {
            const userCount = fingerprintDoc.data().userCount || 0;
            if (userCount >= 3) {
                throw new Error('Bu cihazdan çok fazla hesap oluşturulmuş');
            }
            await fingerprintRef.update({
                userCount: userCount + 1,
                users: firebase.firestore.FieldValue.arrayUnion(userId),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            await fingerprintRef.set({
                userCount: 1,
                users: [userId],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    } catch (error) {
        throw error;
    }
}

// ===== MESSAGE DISPLAY =====
function showRegisterMessage(message, type = 'info') {
    if (!registerMessage) return;
    
    registerMessage.innerHTML = message;
    registerMessage.className = `message-box ${type}`;
    registerMessage.style.display = 'block';
    
    // Auto hide after 10 seconds for success messages
    if (type === 'success') {
        setTimeout(() => {
            registerMessage.style.display = 'none';
        }, 10000);
    }
}

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

// Navbar scroll effect'i kaldırıyorum
// window.addEventListener('scroll', () => {
//     if (window.scrollY > 100) {
//         navbar.classList.add('scrolled');
//         navbar.style.background = '#181b1f !important';
//         navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3) !important';
//     } else {
//         navbar.classList.remove('scrolled');
//         navbar.style.background = 'transparent !important';
//         navbar.style.boxShadow = 'none !important';
//     }
// });

// Hero section'ı izleyip navbar'ı sadece orada transparent yapıyorum
const heroSectionElement = document.querySelector('.hero-section');
if (heroSectionElement) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Hero section görünür - navbar transparent
                navbar.style.background = 'transparent';
                navbar.style.boxShadow = 'none';
                navbar.classList.add('transparent');
            } else {
                // Hero section görünmez - navbar sabit renk
                navbar.style.background = '#181b1f';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
                navbar.classList.remove('transparent');
            }
        });
    }, {
        threshold: 0.1 // Hero section'ın %10'u görünür olduğunda tetikle
    });
    
    observer.observe(heroSectionElement);
}

// ===== ACTIVE MENU ITEM =====
function setActiveMenuItem() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const currentHash = window.location.hash;
    
    // Tüm nav-link'lerden active class'ını kaldır
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Mevcut sayfaya göre active class'ı ekle
    if (currentPage === 'index.html' || currentPage === '') {
        // Ana sayfa için
        if (currentHash === '#why-choose' || currentHash === '#features') {
            // Özellikler section'ındaysa
            document.querySelector('.nav-link[href="#why-choose"]')?.classList.add('active');
        } else if (currentHash === '#pricing') {
            // Fiyatlandırma section'ındaysa
            document.querySelector('.nav-link[href="#pricing"]')?.classList.add('active');
        } else {
            // Ana sayfa default
            document.querySelector('.nav-link[href="index.html"]')?.classList.add('active');
        }
    } else if (currentPage === 'trial.html') {
        document.querySelector('.nav-link[href="trial.html"]')?.classList.add('active');
    } else if (currentPage === 'payment.html') {
        document.querySelector('.nav-link[href="payment.html"]')?.classList.add('active');
    }
}

// ===== SECTION SCROLL DETECTION =====
function setupSectionObserver() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Sadece ana sayfada çalışsın
    if (currentPage !== 'index.html' && currentPage !== '') return;
    
    const sections = [
        { id: 'home', navLink: '.nav-link[href="index.html"]' },
        { id: 'why-choose', navLink: '.nav-link[href="#why-choose"]' },
        { id: 'pricing', navLink: '.nav-link[href="#pricing"]' }
    ];
    
    const observerOptions = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Tüm nav-link'lerden active class'ını kaldır
                document.querySelectorAll('.nav-link').forEach(link => {
                    link.classList.remove('active');
                });
                
                // İlgili section'ın nav-link'ine active class ekle
                const section = sections.find(s => s.id === entry.target.id);
                if (section) {
                    const navLink = document.querySelector(section.navLink);
                    if (navLink) {
                        navLink.classList.add('active');
                    }
                }
            }
        });
    }, observerOptions);
    
    // Section'ları observe et
    sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
            sectionObserver.observe(element);
        }
    });
}

// Sayfa yüklendiğinde ve hash değiştiğinde active item'ı güncelle
window.addEventListener('load', () => {
    setActiveMenuItem();
    setupSectionObserver();
});
window.addEventListener('hashchange', setActiveMenuItem);

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
            
            // Smooth scroll sonrası active item'ı güncelle
            setTimeout(() => {
                setActiveMenuItem();
            }, 100);
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
    
    // Email verification durumunu kontrol et
    checkEmailVerificationStatus();
    
    // Add loading animation to page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // FAQ accordion functionality
    const faqItems = document.querySelectorAll('.faq-item');
    console.log('FAQ items found:', faqItems.length);
    
    faqItems.forEach((item, index) => {
        const question = item.querySelector('.faq-question');
        console.log(`FAQ item ${index}:`, question);
        
        if (question) {
            question.addEventListener('click', function() {
                console.log('FAQ clicked:', index);
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle current item
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
    
    // Download tracking
    const downloadLinks = document.querySelectorAll('.download-link:not(.disabled)');
    downloadLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Download tracking
            console.log('📥 Download started:', this.href);
            
            // Analytics tracking (Google Analytics varsa)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'download', {
                    'event_category': 'software',
                    'event_label': 'macos_dmg',
                    'value': 1
                });
            }
            
            // Firestore'a download kaydı (opsiyonel)
            try {
                const downloadData = {
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    platform: 'macos',
                    file: 'Global.Seller.Scraper.dmg',
                    user_agent: navigator.userAgent,
                    referrer: document.referrer
                };
                
                db.collection('downloads').add(downloadData);
            } catch (error) {
                console.log('Download tracking error:', error);
            }
        });
    });
    
    // ===== PAYMENT REDIRECT =====
    function redirectToPayment() {
        // Kullanıcının giriş yapmış olup olmadığını kontrol et
        const currentUser = auth.currentUser;
        
        if (currentUser) {
            // Giriş yapmış kullanıcı - email ile yönlendir
            const userEmail = currentUser.email;
            window.location.href = `payment.html?email=${encodeURIComponent(userEmail)}`;
        } else {
            // Giriş yapmamış kullanıcı - önce giriş yapmasını iste
            showRegisterMessage('Premium özellikler için lütfen önce giriş yapın!', 'error');
            
            // 2 saniye sonra trial sayfasına yönlendir
            setTimeout(() => {
                window.location.href = 'trial.html';
            }, 2000);
        }
    }
    
    // Global scope'a fonksiyonu ekle
    window.redirectToPayment = redirectToPayment;
}); 