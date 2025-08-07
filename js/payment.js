// ===== SIMPLE PAYMENT PAGE LOGIC =====

// DOM Elements
const authForms = document.getElementById('authForms');
const paymentForm = document.getElementById('paymentForm');
const paymentContainer = document.querySelector('.payment-container');

// Show loading initially
function showLoading() {
    if (authForms) authForms.style.display = 'none';
    if (paymentForm) paymentForm.style.display = 'none';
    if (paymentContainer) paymentContainer.classList.remove('loaded');
}

// Simple Functions
async function showPaymentForm(user) {
    console.log('💳 Showing payment form for:', user.email);
    if (authForms) authForms.style.display = 'none';
    if (paymentForm) paymentForm.style.display = 'block';
    if (paymentContainer) paymentContainer.classList.add('loaded');
    
    // Get user data to check plan
    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        let userPlan = 'Free Plan';
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            userPlan = userData.plan || 'Free Plan';
        }
        
        // Update plan status if available
        const planStatus = document.getElementById('planStatus');
        if (planStatus) {
            if (userPlan === 'Premium Plan') {
                planStatus.innerHTML = '<span style="color: #39efdc;">✨ Premium Plan</span>';
            } else {
                planStatus.innerHTML = '<span style="color: #ffa500;">📦 Ücretsiz Plan</span>';
            }
        }
        
        console.log('💳 User plan:', userPlan);
    } catch (error) {
        console.error('❌ Error getting user plan:', error);
        // Default to free plan on error
        const planStatus = document.getElementById('planStatus');
        if (planStatus) {
            planStatus.innerHTML = '<span style="color: #ffa500;">📦 Ücretsiz Plan</span>';
        }
    }
}

function showAuthForms() {
    console.log('💳 Showing auth forms');
    if (authForms) authForms.style.display = 'block';
    if (paymentForm) paymentForm.style.display = 'none';
    if (paymentContainer) paymentContainer.classList.add('loaded');
}

// Simple Check Function
async function checkUser() {
    const user = firebase.auth().currentUser;
    console.log('💳 Check user:', user ? user.email : 'None');
    
    if (user) {
        await showPaymentForm(user);
    } else {
        showAuthForms();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('💳 Payment page loaded');
    
    // Hide everything initially
    showLoading();
    
    // Quick check first
    setTimeout(async () => {
        await checkUser();
    }, 100);
    
    // Then wait for Firebase to fully initialize
    setTimeout(async () => {
        await checkUser();
        // Check periodically
        setInterval(async () => {
            await checkUser();
        }, 3000);
    }, 1000);
});

// Manual trigger for testing
window.forceShowPaymentForm = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
        await showPaymentForm(user);
    } else {
        console.log('No user found');
    }
};

// ===== REGISTRATION FUNCTION =====
async function registerUser() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    if (!name || !email || !password) {
        showMessage('Lütfen zorunlu alanları doldurun!', 'error');
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Şifreler eşleşmiyor!', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }

    try {
        showMessage('Hesap oluşturuluyor...', 'info');
        
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Firestore'a kullanıcı verilerini kaydet
        try {
            console.log('💾 Firestore\'a kullanıcı verileri kaydediliyor...');
            console.log('💾 User UID:', user.uid);
            
            await firebase.firestore().collection('users').doc(user.uid).set({
                email: email,
                name: name,
                company: '',
                trial_status: "free",
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
                    seller_searches: 0
                },
                abuse_score: 0,
                is_verified: false,
                is_active: true,
                is_admin: false
            });
            
            console.log('✅ Firestore\'a kullanıcı verileri başarıyla kaydedildi');
            showMessage('✅ Hesabınız başarıyla oluşturuldu!', 'success');
            
        } catch (firestoreError) {
            console.error('❌ Firestore kaydetme hatası:', firestoreError);
            showMessage('Hesap oluşturuldu ama veri kaydetme hatası!', 'error');
        }
        
    } catch (error) {
        console.error('Kayıt hatası:', error);
        let errorMessage = 'Hesap oluşturulurken hata oluştu!';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'Bu email adresi zaten kullanımda!';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Geçersiz email adresi!';
                break;
            case 'auth/weak-password':
                errorMessage = 'Şifre çok zayıf!';
                break;
        }
        
        showMessage(errorMessage, 'error');
    }
}

// ===== MESSAGE FUNCTION =====
function showMessage(message, type = 'info') {
    const authMessage = document.getElementById('authMessage');
    if (authMessage) {
        authMessage.innerHTML = `<div class="message ${type}">${message}</div>`;
        authMessage.style.display = 'block';
        setTimeout(() => {
            authMessage.style.display = 'none';
        }, 5000);
    }
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Kayıt formu event listener
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            registerUser();
        });
    }
});

console.log('💳 Simple payment script loaded'); 