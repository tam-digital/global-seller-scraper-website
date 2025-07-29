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
const paymentForm = document.getElementById('paymentForm');
const authForms = document.getElementById('authForms');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authMessage = document.getElementById('authMessage');

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
        console.log('initializePaymentForm başladı');
        
        // Kullanıcının giriş durumunu kontrol et
        const currentUser = auth.currentUser;
        console.log('Current user:', currentUser);
        
        if (currentUser) {
            // Giriş yapmış kullanıcı - ödeme formunu göster
            console.log('Kullanıcı giriş yapmış, ödeme formu gösteriliyor...');
            showPaymentForm(currentUser.email);
        } else {
            // Giriş yapmamış kullanıcı - kayıt formunu göster
            console.log('Kullanıcı giriş yapmamış, kayıt formu gösteriliyor...');
            showRegisterForm();
        }
        
    } catch (error) {
        console.error('Ödeme formu başlatma hatası:', error);
        showError('Ödeme formu yüklenemedi!');
    }
}

// ===== SHOW PAYMENT FORM =====
async function showPaymentForm(userEmail) {
    try {
        console.log('showPaymentForm çağrıldı, email:', userEmail);
        
        // Önce current user'ı al
        const currentUser = auth.currentUser;
        if (!currentUser) {
            showError('Kullanıcı oturumu bulunamadı!');
            return;
        }
        
        console.log('Current user UID:', currentUser.uid);
        
        // Kullanıcı bilgilerini Firebase'den al (UID ile)
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        if (!userDoc.exists) {
            showError('Kullanıcı bulunamadı! Lütfen önce giriş yapın.');
            return;
        }
        
        const userData = userDoc.data();
        const userName = userData.name || userEmail.split('@')[0];
        
        console.log('Kullanıcı verileri alındı:', userData);
        
        // Formları değiştir
        console.log('Formları değiştiriyor...');
        authForms.style.display = 'none';
        paymentForm.style.display = 'block';
        
        // iyzico ödeme formu oluştur
        const paymentData = {
            email: userEmail,
            name: userName,
            amount: 7999.00, // 199 USD = 7999 TL
            currency: 'TRY', // TL para birimi
            product: 'Global Seller Scraper Premium'
        };
        
        console.log('Payment data:', paymentData);
        console.log('iyzico form oluşturuluyor...');
        createIyzicoForm(paymentData);
        
    } catch (error) {
        console.error('Ödeme formu gösterme hatası:', error);
        showError('Ödeme formu yüklenemedi!');
    }
}

// ===== SHOW REGISTER FORM =====
function showRegisterForm() {
    authForms.style.display = 'flex';
    paymentForm.style.display = 'none';
}

// ===== iyzico FORM CREATION =====
function createIyzicoForm(paymentData) {
    console.log('createIyzicoForm başladı');
    console.log('Payment data:', paymentData);
    
    // iyzico Checkout Form parametreleri
    const options = {
        locale: 'tr',
        conversationId: `premium_${paymentData.email}_${Date.now()}`,
        price: paymentData.amount.toString(),
        paidPrice: paymentData.amount.toString(),
        currency: 'TRY', // TL para birimi
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
    
    console.log('iyzico options:', options);
    
    // iyzico SDK kontrolü - tekrar kontrol et
    const waitForIyzicoSDK = () => {
        if (typeof IyzipayCheckoutForm !== 'undefined') {
            console.log('iyzico SDK mevcut, form oluşturuluyor...');
            
            // iyzico Checkout Form oluştur
            console.log('IyzipayCheckoutForm.init çağrılıyor...');
            IyzipayCheckoutForm.init(options).then(function(result) {
                console.log('iyzico result:', result);
                if (result.status === 'success') {
                    console.log('iyzico form başarılı, form gösteriliyor...');
                    // Ödeme formunu göster
                    const iyzicoForm = document.getElementById('iyzipay-checkout-form');
                    iyzicoForm.innerHTML = result.checkoutFormContent;
                    
                    // Ödeme kaydını Firebase'e ekle
                    savePaymentRecord(options.conversationId, paymentData);
                    
                } else {
                    showError('Ödeme formu oluşturulamadı: ' + result.errorMessage);
                }
            }).catch(function(error) {
                console.error('iyzico form hatası:', error);
                showError('Ödeme formu yüklenemedi!');
            });
        } else {
            console.log('iyzico SDK henüz yüklenmedi, bekleniyor...');
            setTimeout(waitForIyzicoSDK, 100);
        }
    };
    
    // SDK kontrolünü başlat
    waitForIyzicoSDK();
}

// ===== AUTH FORM HANDLERS =====
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const email = formData.get('email');
        const password = formData.get('password');
        
        // Loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Giriş Yapılıyor...';
        submitBtn.disabled = true;
        
        try {
            // Firebase Auth ile giriş yap
            await auth.signInWithEmailAndPassword(email, password);
            
            // Başarılı giriş - ödeme formunu göster
            showPaymentForm(email);
            showAuthMessage('Giriş başarılı! Ödeme formu yükleniyor...', 'success');
            
        } catch (error) {
            console.error('Giriş hatası:', error);
            let errorMessage = 'Giriş yapılamadı!';
            
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Bu email adresi ile kayıtlı hesap bulunamadı!';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Hatalı şifre!';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz email adresi!';
            }
            
            showAuthMessage(errorMessage, 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(signupForm);
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Şifre kontrolü
        if (password !== confirmPassword) {
            showAuthMessage('Şifreler eşleşmiyor!', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthMessage('Şifre en az 6 karakter olmalıdır!', 'error');
            return;
        }
        
        // Loading state
        const submitBtn = signupForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Hesap Oluşturuluyor...';
        submitBtn.disabled = true;
        
        try {
            console.log('Firebase Auth başlatılıyor...');
            console.log('Email:', email);
            console.log('Şifre uzunluğu:', password.length);
            
            // Firebase Auth ile kullanıcı oluştur
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            console.log('Kullanıcı oluşturuldu:', userCredential.user.uid);
            
            // Hardware fingerprint oluştur
            const fingerprint = generateHardwareFingerprint();
            console.log('Hardware fingerprint:', fingerprint);
            
            // Firestore'a kullanıcı verilerini kaydet
            const userData = {
                email: email,
                name: name,
                hardware_fingerprint: fingerprint,
                trial_status: "free",
                created_at: firebase.firestore.FieldValue.serverTimestamp(),
                last_login: firebase.firestore.FieldValue.serverTimestamp(),
                email_verified: false,
                monthly_usage: { 
                    asin_scans: 0, 
                    product_scans: 0, 
                    seller_searches: 0 
                }
            };
            
            console.log('Firestore\'a kaydediliyor...');
            await db.collection('users').doc(userCredential.user.uid).set(userData);
            console.log('Kullanıcı Firestore\'a kaydedildi');
            
            // Başarılı kayıt - ödeme formunu göster
            console.log('Kayıt başarılı, ödeme formu gösteriliyor...');
            showPaymentForm(email);
            showAuthMessage('Hesap başarıyla oluşturuldu! Ödeme formu yükleniyor...', 'success');
            
        } catch (error) {
            console.error('Kayıt hatası:', error);
            console.error('Hata kodu:', error.code);
            console.error('Hata mesajı:', error.message);
            let errorMessage = 'Hesap oluşturulamadı!';
            
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Bu email adresi zaten kullanılıyor!';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Geçersiz email adresi!';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Şifre çok zayıf!';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'İnternet bağlantısı hatası!';
            } else if (error.code === 'auth/operation-not-allowed') {
                errorMessage = 'Email/şifre kaydı etkin değil!';
            } else {
                errorMessage = `Hesap oluşturulamadı: ${error.message}`;
            }
            
            showAuthMessage(errorMessage, 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

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

// ===== AUTH MESSAGE HANDLER =====
function showAuthMessage(message, type = 'info') {
    authMessage.textContent = message;
    authMessage.className = `auth-message ${type}`;
    authMessage.style.display = 'block';
    
    // 5 saniye sonra mesajı gizle
    setTimeout(() => {
        authMessage.style.display = 'none';
    }, 5000);
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
    const iyzicoForm = document.getElementById('iyzipay-checkout-form');
    iyzicoForm.innerHTML = `
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
    
    // iyzico SDK yüklenmesini bekle
    const checkIyzicoSDK = () => {
        if (typeof IyzipayCheckoutForm !== 'undefined') {
            console.log('✅ iyzico SDK yüklendi');
            // Ödeme formunu başlat
            initializePaymentForm();
        } else {
            console.log('⏳ iyzico SDK yükleniyor...');
            setTimeout(checkIyzicoSDK, 100);
        }
    };
    
    // SDK kontrolünü başlat
    checkIyzicoSDK();
    
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