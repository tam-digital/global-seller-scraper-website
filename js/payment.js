// ===== PAYMENT PAGE JAVASCRIPT =====

// Firebase konfigürasyonu
const firebaseConfig = {
    apiKey: "AIzaSyCPJay7-9xPVVXh-0FzKsaMw6LxmmLjvws",
    authDomain: "globalsellerscraper.firebaseapp.com",
    projectId: "globalsellerscraper",
    storageBucket: "globalsellerscraper.appspot.com",
    messagingSenderId: "768895134845",
    appId: "768895134845:web:9907c4a23f57e0eb0f1514"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===== DOM ELEMENTS =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const paymentForm = document.getElementById('iyzipay-checkout-form');

// ===== NAVBAR FUNCTIONALITY =====
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = '#181b1f';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    }
});

// ===== PAYMENT FORM INITIALIZATION =====
async function initializePaymentForm() {
    try {
        // URL'den email parametresini al
        const urlParams = new URLSearchParams(window.location.search);
        const userEmail = urlParams.get('email');
        
        if (!userEmail) {
            // Email parametresi yoksa login formu göster
            showLoginForm();
            return;
        }
        
        // Kullanıcı bilgilerini Firebase'den al
        const userDoc = await db.collection('users').doc(userEmail).get();
        if (!userDoc.exists) {
            showError('Kullanıcı bulunamadı! Lütfen önce giriş yapın.');
            return;
        }
        
        const userData = userDoc.data();
        const userName = userData.name || userEmail.split('@')[0];
        
        // iyzico ödeme formu oluştur
        const paymentData = {
            email: userEmail,
            name: userName,
            amount: 199.00,
            currency: 'USD',
            product: 'Global Seller Scraper Premium'
        };
        
        createIyzicoForm(paymentData);
        
    } catch (error) {
        console.error('Ödeme formu başlatma hatası:', error);
        showError('Ödeme formu yüklenemedi!');
    }
}

// ===== LOGIN FORM =====
function showLoginForm() {
    paymentForm.innerHTML = `
        <div class="login-form">
            <h3>Premium Özellikler İçin Giriş Yapın</h3>
            <p>Premium özellikleri kullanmak için lütfen giriş yapın veya hesap oluşturun.</p>
            
            <div class="form-actions">
                <a href="trial.html" class="btn btn-primary">
                    <i class="fas fa-sign-in-alt"></i>
                    Giriş Yap / Hesap Oluştur
                </a>
                <a href="index.html" class="btn btn-secondary">
                    <i class="fas fa-arrow-left"></i>
                    Ana Sayfaya Dön
                </a>
            </div>
        </div>
    `;
}

// ===== iyzico FORM CREATION =====
function createIyzicoForm(paymentData) {
    // iyzico Checkout Form parametreleri
    const options = {
        locale: 'tr',
        conversationId: `premium_${paymentData.email}_${Date.now()}`,
        price: paymentData.amount.toString(),
        paidPrice: paymentData.amount.toString(),
        currency: paymentData.currency,
        basketId: `basket_${Date.now()}`,
        paymentGroup: 'PRODUCT',
        callbackUrl: window.location.origin + '/payment-success.html',
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: {
            id: paymentData.email,
            name: paymentData.name.split(' ')[0] || paymentData.name,
            surname: paymentData.name.split(' ').slice(1).join(' ') || '',
            gsmNumber: '+905350000000',
            email: paymentData.email,
            identityNumber: '74300864791',
            lastLoginDate: new Date().toISOString(),
            registrationDate: new Date().toISOString(),
            registrationAddress: 'Test Mahallesi Test Sokak',
            ip: '85.34.78.112',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: {
            contactName: paymentData.name,
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Test Mahallesi Test Sokak',
            zipCode: '34742'
        },
        billingAddress: {
            contactName: paymentData.name,
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Test Mahallesi Test Sokak',
            zipCode: '34742'
        },
        basketItems: [
            {
                id: 'premium_lifetime',
                name: paymentData.product,
                category1: 'Software',
                category2: 'Premium',
                itemType: 'VIRTUAL',
                price: paymentData.amount.toString()
            }
        ]
    };
    
    // iyzico Checkout Form oluştur
    IyzipayCheckoutForm.init(options).then(function(result) {
        if (result.status === 'success') {
            // Ödeme formunu göster
            paymentForm.innerHTML = result.checkoutFormContent;
            
            // Ödeme kaydını Firebase'e ekle
            savePaymentRecord(options.conversationId, paymentData);
            
        } else {
            showError('Ödeme formu oluşturulamadı: ' + result.errorMessage);
        }
    }).catch(function(error) {
        console.error('iyzico form hatası:', error);
        showError('Ödeme formu yüklenemedi!');
    });
}

// ===== FIREBASE PAYMENT RECORD =====
async function savePaymentRecord(paymentId, paymentData) {
    try {
        const paymentRecord = {
            payment_id: paymentId,
            user_email: paymentData.email,
            amount: paymentData.amount,
            currency: paymentData.currency,
            status: 'pending',
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            product: paymentData.product,
            billing_type: 'lifetime'
        };
        
        await db.collection('payments').doc(paymentId).set(paymentRecord);
        console.log('Ödeme kaydı oluşturuldu:', paymentId);
        
    } catch (error) {
        console.error('Ödeme kaydı hatası:', error);
    }
}

// ===== UTILITY FUNCTIONS =====
function showError(message) {
    paymentForm.innerHTML = `
        <div class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
            <button onclick="location.reload()" class="btn btn-primary">Tekrar Dene</button>
        </div>
    `;
}

function showSuccess(message) {
    paymentForm.innerHTML = `
        <div class="success-message">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
        </div>
    `;
}

// ===== PAGE INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('💳 Payment page loaded successfully!');
    
    // Ödeme formunu başlat
    initializePaymentForm();
    
    // Loading animation
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ===== ERROR HANDLING =====
window.addEventListener('error', (event) => {
    console.error('Page error:', event.error);
});

// ===== ANALYTICS =====
function trackPaymentEvent(eventName, data = {}) {
    // Google Analytics tracking
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            'event_category': 'payment',
            'event_label': 'premium_upgrade',
            'value': 199,
            ...data
        });
    }
    
    // Console logging
    console.log('📊 Payment event:', eventName, data);
} 