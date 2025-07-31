// ===== FIREBASE CONFIGURATION =====
// Firebase already initialized by user-management.js
const auth = firebase.auth();
const db = firebase.firestore();

// ===== DOM ELEMENTS =====
const authForms = document.getElementById('authForms');
const paymentForm = document.getElementById('paymentForm');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const userInfo = document.getElementById('userInfo');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const authMessage = document.getElementById('authMessage');

// Debug DOM elements
console.log('🔍 DOM ELEMENTS DEBUG:');
console.log('authForms:', authForms ? '✅ Found' : '❌ Not found');
console.log('paymentForm:', paymentForm ? '✅ Found' : '❌ Not found');
console.log('loginForm:', loginForm ? '✅ Found' : '❌ Not found');
console.log('signupForm:', signupForm ? '✅ Found' : '❌ Not found');

// ===== PAYMENT PAGE SPECIFIC AUTH HANDLER =====
function handlePaymentAuth() {
    console.log('Payment page: Checking auth state...');
    
    const user = firebase.auth().currentUser;
    console.log('Payment page: Current user:', user ? user.email : 'No user');
    
    if (user) {
        console.log('✅ User found immediately:', user.email);
        showPaymentForm(user);
    } else {
        console.log('⏳ No user found, waiting for auth state...');
        showAuthForms();
        
        // Backup check after delay
        setTimeout(() => {
            const delayedUser = firebase.auth().currentUser;
            if (delayedUser) {
                console.log('✅ User found after delay:', delayedUser.email);
                showPaymentForm(delayedUser);
            }
        }, 1000);
    }
}

// Removed duplicate auth listener - using the one at the bottom

// ===== SHOW PAYMENT FORM =====
async function showPaymentForm(user) {
    console.log('🎯 showPaymentForm called for:', user.email);
    console.log('🎯 authForms element:', authForms ? '✅ Found' : '❌ Missing');
    console.log('🎯 paymentForm element:', paymentForm ? '✅ Found' : '❌ Missing');
    
    if (authForms) {
        authForms.style.display = 'none';
        console.log('✅ Auth forms hidden');
    }
    if (paymentForm) {
        paymentForm.style.display = 'block';
        console.log('✅ Payment form shown');
    } else {
        console.error('❌ Payment form element not found!');
    }
    
    // Kullanıcı bilgilerini göster
    if (userInfo) {
        userInfo.style.display = 'block';
        if (userEmail) userEmail.textContent = user.email;
    }
    
    // User plan status'ını kontrol et ve göster
    const userPlan = await checkUserPlan(user.uid);
    const planStatusElement = document.getElementById('planStatus');
    if (planStatusElement) {
        if (userPlan === 'premium') {
            planStatusElement.innerHTML = '<span style="color: #39efd7;">🌟 Premium Üye</span>';
            // Premium kullanıcı için payment button'u gizle
            const paymentSection = document.querySelector('.payment-section');
            if (paymentSection) {
                paymentSection.innerHTML = '<div class="premium-message"><h3>🎉 Premium Üyeliğiniz Aktif!</h3><p>Tüm özellikleri sınırsız kullanabilirsiniz.</p></div>';
            }
        } else {
            planStatusElement.innerHTML = '<span style="color: #ffa500;">📦 Ücretsiz Plan</span>';
        }
    }
    
    console.log('Ödeme formu gösteriliyor, Plan:', userPlan);
}

// ===== SHOW AUTH FORMS =====
function showAuthForms() {
    console.log('🎯 showAuthForms called');
    console.log('🎯 authForms element:', authForms);
    console.log('🎯 paymentForm element:', paymentForm);
    
    if (authForms) authForms.style.display = 'block';
    if (paymentForm) paymentForm.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    
    console.log('✅ Giriş formları gösteriliyor');
}

// ===== LOGIN FUNCTION =====
async function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        await auth.signInWithEmailAndPassword(email, password);
        showMessage('Giriş başarılı!', 'success');
        console.log('Giriş başarılı');
    } catch (error) {
        console.error('Giriş hatası:', error);
        showMessage('Giriş hatası: ' + error.message, 'error');
    }
}

// ===== REGISTER FUNCTION =====
async function registerUser() {
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    const name = document.getElementById('signupName').value;
    
    // Şifre kontrolü
    if (password !== confirmPassword) {
        showMessage('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Kullanıcı bilgilerini Firestore'a kaydet (UID-based)
        await db.collection('users').doc(user.uid).set({
            email: email,
            name: name,
            company: '',
            trial_status: 'free',  // Consistent with main site
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            last_login: firebase.firestore.FieldValue.serverTimestamp(),
            email_verified: false,
            monthly_usage: { 
                asin_scans: 0, 
                product_scans: 0, 
                seller_searches: 0 
            },
            limits: { 
                asin_scans: 10000, 
                product_scans: 10000, 
                seller_searches: 0  // Free tier'da seller search kapalı
            },
            abuse_score: 0,
            is_verified: false,
            is_active: true,
            is_admin: false
        });
        
        showMessage('Hesap başarıyla oluşturuldu!', 'success');
        console.log('Kayıt başarılı');
    } catch (error) {
        console.error('Kayıt hatası:', error);
        showMessage('Kayıt hatası: ' + error.message, 'error');
    }
}

// ===== PREMIUM UPGRADE FUNCTION =====
async function upgradeToPremium(userUid) {
    try {
        await db.collection('users').doc(userUid).update({
            trial_status: 'premium',
            upgraded_at: firebase.firestore.FieldValue.serverTimestamp(),
            limits: {
                asin_scans: 999999,  // Unlimited
                product_scans: 999999,  // Unlimited  
                seller_searches: 999999  // Unlimited
            },
            premium_features: {
                unlimited_scans: true,
                priority_support: true,
                advanced_filters: true,
                api_access: true
            }
        });
        
        console.log('✅ Premium upgrade başarılı!');
        showMessage('🎉 Premium hesabınız aktifleştirildi!', 'success');
        return true;
    } catch (error) {
        console.error('❌ Premium upgrade hatası:', error);
        showMessage('Premium upgrade hatası: ' + error.message, 'error');
        return false;
    }
}

// ===== CHECK USER PLAN =====
async function checkUserPlan(userUid) {
    try {
        const userDoc = await db.collection('users').doc(userUid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            return userData.trial_status || 'free';
        }
        return 'free';
    } catch (error) {
        console.error('Plan kontrol hatası:', error);
        return 'free';
    }
}

// ===== LOGOUT FUNCTION =====
async function logoutUser() {
    try {
        await auth.signOut();
        console.log('Çıkış yapıldı');
    } catch (error) {
        console.error('Çıkış hatası:', error);
    }
}

// ===== MESSAGE FUNCTION =====
function showMessage(message, type = 'info') {
    if (authMessage) {
        authMessage.textContent = message;
        authMessage.className = `auth-message ${type}`;
        authMessage.style.display = 'block';
        
        setTimeout(() => {
            authMessage.style.display = 'none';
        }, 5000);
    }
}

// ===== NAVBAR TOGGLE =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// ===== FORM SUBMISSION =====
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginUser();
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerUser();
    });
}

// ===== LOGOUT BUTTON =====
if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
}

// ===== MAIN AUTH STATE LISTENER =====
firebase.auth().onAuthStateChanged((user) => {
    console.log('🔥 PAYMENT AUTH STATE CHANGED:', user ? user.email : 'No user');
    
    // Wait a bit for DOM to be fully ready
    setTimeout(() => {
        // Hide everything first
        const authForms = document.getElementById('authForms');
        const paymentForm = document.getElementById('paymentForm');
        
        console.log('🔍 DOM check - authForms:', authForms ? '✅' : '❌');
        console.log('🔍 DOM check - paymentForm:', paymentForm ? '✅' : '❌');
        
        if (authForms) authForms.style.display = 'none';
        if (paymentForm) paymentForm.style.display = 'none';
        
        if (user) {
            console.log('✅ USER FOUND - SHOWING PAYMENT FORM');
            console.log('📧 Email verified:', user.emailVerified);
            console.log('🎯 Bypassing email verification for payment access');
            showPaymentForm(user);
        } else {
            console.log('❌ NO USER - SHOWING AUTH FORMS');
            showAuthForms();
        }
    }, 100);
});

// ===== PAGE LOAD INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('Payment page DOM loaded');
    handlePaymentAuth();
});

// Window load için de backup
window.addEventListener('load', () => {
    console.log('Payment page window loaded');
    setTimeout(() => {
        console.log('🔄 Manual check after window load...');
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            console.log('🎯 Manual check found user:', currentUser.email);
            showPaymentForm(currentUser);
        } else {
            console.log('🎯 Manual check - no user found');
            showAuthForms();
        }
    }, 500);
});

// ===== MANUAL TRIGGER FOR TESTING =====
window.forceShowPaymentForm = function() {
    const user = firebase.auth().currentUser;
    if (user) {
        console.log('🔧 MANUAL TRIGGER - Forcing payment form for:', user.email);
        showPaymentForm(user);
    } else {
        console.log('🔧 MANUAL TRIGGER - No user found');
    }
};

console.log('Payment.js yüklendi - Manual trigger available: forceShowPaymentForm()'); 