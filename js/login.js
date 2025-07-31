// ===== FIREBASE CONFIGURATION =====
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
const authForms = document.getElementById('authForms');
const userDashboard = document.getElementById('userDashboard');
const loginFormContainer = document.getElementById('loginFormContainer');
const signupFormContainer = document.getElementById('signupFormContainer');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showSignup = document.getElementById('showSignup');
const showLogin = document.getElementById('showLogin');
const authMessage = document.getElementById('authMessage');
const userSection = document.getElementById('userSection');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const dashboardEmail = document.getElementById('dashboardEmail');
const dashboardPlan = document.getElementById('dashboardPlan');
const dashboardLogout = document.getElementById('dashboardLogout');

// ===== NAVIGATION ELEMENTS =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const navbar = document.getElementById('navbar');

// ===== UTILITY FUNCTIONS =====
function showMessage(message, type = 'info') {
    authMessage.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
        authMessage.innerHTML = '';
    }, 5000);
}

function generateFingerprint() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Fingerprint', 2, 2);
    
    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
    ].join('|');
    
    return btoa(fingerprint).substring(0, 32);
}

// ===== AUTH STATE LISTENER =====
auth.onAuthStateChanged(async (user) => {
    if (user) {
        console.log('Kullanıcı giriş yaptı:', user.email);
        await showUserDashboard(user);
        updateNavbar(user);
    } else {
        console.log('Kullanıcı giriş yapmadı');
        showAuthForms();
        updateNavbar(null);
    }
});

// ===== SHOW USER DASHBOARD =====
async function showUserDashboard(user) {
    authForms.style.display = 'none';
    userDashboard.style.display = 'block';
    
    dashboardEmail.textContent = user.email;
    
    try {
        // Kullanıcının plan durumunu kontrol et
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            const userData = userDoc.data();
            const planStatus = userData.trial_status === 'premium' ? '🌟 Premium Üye' : '📦 Ücretsiz Plan';
            dashboardPlan.innerHTML = planStatus;
            dashboardPlan.className = userData.trial_status === 'premium' ? 'plan-status premium' : 'plan-status free';
        }
    } catch (error) {
        console.error('Plan durumu kontrol hatası:', error);
        dashboardPlan.innerHTML = '📦 Ücretsiz Plan';
        dashboardPlan.className = 'plan-status free';
    }
}

// ===== SHOW AUTH FORMS =====
function showAuthForms() {
    authForms.style.display = 'block';
    userDashboard.style.display = 'none';
}

// ===== UPDATE NAVBAR =====
function updateNavbar(user) {
    if (user) {
        userSection.style.display = 'flex';
        userEmail.textContent = user.email;
    } else {
        userSection.style.display = 'none';
    }
}

// ===== FORM SWITCHING =====
showSignup.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    signupFormContainer.style.display = 'block';
});

showLogin.addEventListener('click', (e) => {
    e.preventDefault();
    signupFormContainer.style.display = 'none';
    loginFormContainer.style.display = 'block';
});

// ===== LOGIN FUNCTION =====
async function loginUser() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showMessage('Lütfen tüm alanları doldurun!', 'error');
        return;
    }

    try {
        showMessage('Giriş yapılıyor...', 'info');
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;

        // Firestore'da last_login güncelle
        await db.collection('users').doc(user.uid).update({
            last_login: firebase.firestore.FieldValue.serverTimestamp()
        });

        showMessage('✅ Başarıyla giriş yaptınız!', 'success');
        
    } catch (error) {
        console.error('Giriş hatası:', error);
        let errorMessage = 'Giriş yapılırken hata oluştu!';
        
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'Bu email adresi ile kayıtlı kullanıcı bulunamadı!';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Yanlış şifre!';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Geçersiz email adresi!';
                break;
            case 'auth/user-disabled':
                errorMessage = 'Bu hesap devre dışı bırakılmış!';
                break;
        }
        
        showMessage(errorMessage, 'error');
    }
}

// ===== REGISTER FUNCTION =====
async function registerUser() {
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const company = document.getElementById('signupCompany').value.trim();

    if (!name || !email || !password) {
        showMessage('Lütfen zorunlu alanları doldurun!', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }

    try {
        showMessage('Hesap oluşturuluyor...', 'info');
        
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        const fingerprint = generateFingerprint();

        // Email verification gönder
        await user.sendEmailVerification({
            url: window.location.origin + '/trial.html?verified=true',
            handleCodeInApp: false
        });

        // Firestore'a kullanıcı verilerini kaydet
        await db.collection('users').doc(user.uid).set({
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

        showMessage(`
            <div class="success-message">
                <h3>✅ Hesabınız Başarıyla Oluşturuldu!</h3>
                <p>📧 Email adresinize doğrulama linki gönderildi.</p>
                <div class="verification-options">
                    <p><strong>Seçenek 1:</strong> Email'inizi kontrol edin ve doğrulama linkine tıklayın</p>
                    <p><strong>Seçenek 2:</strong> Email gelmezse <a href="mailto:hello@tam-digital.com?subject=Email Verification&body=Merhaba, email verification işlemi için yardım istiyorum. Email: ${email}">buraya tıklayarak</a> bize yazın</p>
                </div>
                <div class="verification-info">
                    <p><i class="fas fa-info-circle"></i> Email gelmedi mi? Spam klasörünü de kontrol edin.</p>
                </div>
            </div>
        `, 'success');
        
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

// ===== LOGOUT FUNCTION =====
async function logoutUser() {
    try {
        await auth.signOut();
        showMessage('✅ Başarıyla çıkış yaptınız!', 'success');
    } catch (error) {
        console.error('Çıkış hatası:', error);
        showMessage('Çıkış yapılırken hata oluştu!', 'error');
    }
}

// ===== EVENT LISTENERS =====
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

if (logoutBtn) {
    logoutBtn.addEventListener('click', logoutUser);
}

if (dashboardLogout) {
    dashboardLogout.addEventListener('click', logoutUser);
}

// ===== MOBILE MENU =====
if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

// ===== NAVBAR SCROLL EFFECT =====
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.style.background = '#181b1f';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'transparent';
        navbar.style.boxShadow = 'none';
    }
});

console.log('Login sayfası yüklendi!'); 