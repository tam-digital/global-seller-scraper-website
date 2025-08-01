// ===== FIREBASE CONFIGURATION =====
const firebaseConfig = {
    apiKey: "AIzaSyCPJay7-9xPVVXh-0FzKsaMw6LxmmLjvws",
    authDomain: "globalsellerscraper.firebaseapp.com",
    projectId: "globalsellerscraper",
    storageBucket: "globalsellerscraper.appspot.com",
    messagingSenderId: "768895134845",
    appId: "768895134845:web:9907c4a23f57e0eb0f1514"
};

// Firebase'i başlat (eğer başlatılmamışsa)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
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
        // Direkt dashboard'a yönlendir
        window.location.href = 'dashboard.html';
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
    const guestSection = document.getElementById('guestSection');
    const userSection = document.getElementById('userSection');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');
    
    if (user && guestSection && userSection) {
        // Kullanıcı giriş yapmış
        guestSection.style.display = 'none';
        userSection.style.display = 'flex';
        
        // Update dropdown email
        if (dropdownUserEmail) {
            dropdownUserEmail.textContent = user.email;
        }
    } else if (guestSection && userSection) {
        // Kullanıcı giriş yapmamış
        guestSection.style.display = 'block';
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
        
        console.log('🔐 Firebase authentication başlatılıyor...');
        showMessage('🔐 Firebase bağlantısı kuruluyor...', 'info');
        
        // Timeout ile Firebase authentication
        const authPromise = auth.signInWithEmailAndPassword(email, password);
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Bağlantı zaman aşımı')), 10000)
        );
        
        const userCredential = await Promise.race([authPromise, timeoutPromise]);
        console.log('✅ Firebase authentication başarılı');
        showMessage('✅ Firebase bağlantısı başarılı!', 'success');
        const user = userCredential.user;

        // Hardware fingerprint kontrolü
        try {
            showMessage('🔍 Cihaz kontrolü yapılıyor...', 'info');
            const fingerprint = generateFingerprint();
            
            const fingerprintDoc = await db.collection('hardware_fingerprints').doc(fingerprint).get();
            
            if (fingerprintDoc.exists) {
                const fingerprintData = fingerprintDoc.data();
                
                if (fingerprintData.user_id !== user.uid) {
                    showMessage('⚠️ Bu cihazda zaten başka bir hesap kullanılıyor. Güvenlik nedeniyle aynı cihazda birden fazla hesap kullanamazsınız.', 'warning');
                    await auth.signOut();
                    return;
                } else {
                    showMessage('✅ Cihaz doğrulandı!', 'success');
                }
            } else {
                showMessage('📱 Yeni cihaz kaydediliyor...', 'info');
                await db.collection('hardware_fingerprints').doc(fingerprint).set({
                    user_id: user.uid,
                    email: user.email,
                    created_at: firebase.firestore.FieldValue.serverTimestamp(),
                    last_used: firebase.firestore.FieldValue.serverTimestamp()
                });
                showMessage('✅ Yeni cihaz kaydedildi!', 'success');
            }
            
        } catch (fingerprintError) {
            console.error('❌ Hardware fingerprint kontrol hatası:', fingerprintError);
            showMessage('⚠️ Cihaz kontrolünde sorun oluştu ama giriş devam ediyor...', 'warning');
            // Hata durumunda 3 saniye bekle ve devam et
            await new Promise(resolve => setTimeout(resolve, 3000));
        }

        // Firestore'da last_login güncelle
        try {
            await db.collection('users').doc(user.uid).update({
                last_login: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (updateError) {
            console.log('⚠️ Last login güncellenemedi:', updateError.message);
        }

        showMessage('✅ Başarıyla giriş yaptınız!', 'success');
        
    } catch (error) {
        console.error('❌ Giriş hatası:', error);
        console.error('❌ Hata kodu:', error.code);
        console.error('❌ Hata mesajı:', error.message);
        
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
            case 'auth/network-request-failed':
                errorMessage = 'İnternet bağlantısı sorunu! Lütfen bağlantınızı kontrol edin.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Çok fazla deneme yaptınız! Lütfen biraz bekleyin.';
                break;
            default:
                if (error.message === 'Bağlantı zaman aşımı') {
                    errorMessage = 'Bağlantı zaman aşımı! Lütfen internet bağlantınızı kontrol edin.';
                } else {
                    errorMessage = `Giriş hatası: ${error.message}`;
                }
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
        console.log('📧 Email verification gönderiliyor...');
        console.log('📧 Kullanıcı email:', user.email);
        console.log('📧 Kullanıcı UID:', user.uid);
        
        try {
            const actionCodeSettings = {
                url: 'https://tam-digital.github.io/global-seller-scraper-website/trial.html?verified=true',
                handleCodeInApp: false
            };
            
            console.log('📧 Action URL:', actionCodeSettings.url);
            
            await user.sendEmailVerification(actionCodeSettings);
            console.log('✅ Email verification başarıyla gönderildi');
            
            // Email verification durumunu kontrol et
            console.log('📧 Email verification durumu:', user.emailVerified);
            
        } catch (emailError) {
            console.error('❌ Email verification gönderilemedi:', emailError);
            console.error('❌ Hata kodu:', emailError.code);
            console.error('❌ Hata mesajı:', emailError.message);
            
            // Email gönderilemese bile kullanıcı oluşturmaya devam et
            // Ama kullanıcıya bilgi ver
            console.log('⚠️ Email gönderilemedi ama kullanıcı oluşturuldu');
        }

        // Firestore'a kullanıcı verilerini kaydet
        try {
            console.log('💾 Firestore\'a kullanıcı verileri kaydediliyor...');
            console.log('💾 User UID:', user.uid);
            
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
            
            console.log('✅ Firestore\'a kullanıcı verileri başarıyla kaydedildi');
            
        } catch (firestoreError) {
            console.error('❌ Firestore kaydetme hatası:', firestoreError);
            console.error('❌ Hata kodu:', firestoreError.code);
            console.error('❌ Hata mesajı:', firestoreError.message);
            
            // Firestore hatası olsa bile kullanıcı oluşturmaya devam et
            console.log('⚠️ Firestore hatası ama kullanıcı oluşturuldu');
        }

        showMessage(`
            <div class="success-message">
                <h3>✅ Hesabınız Başarıyla Oluşturuldu!</h3>
                <p>📧 <strong>Email adresinize doğrulama linki gönderildi!</strong></p>
                <div class="verification-options">
                    <p><strong>📬 Email'inizi kontrol edin:</strong></p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Gelen kutusunu kontrol edin</li>
                        <li>Spam klasörünü kontrol edin</li>
                        <li>Email gelmezse aşağıdaki butona tıklayın</li>
                    </ul>
                    <p><strong>🔗 Doğrulama linkine tıkladıktan sonra:</strong></p>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Yazılımı indirebilirsiniz</li>
                        <li>Giriş yapabilirsiniz</li>
                        <li>Analiz başlatabilirsiniz</li>
                    </ul>
                </div>
                <div class="verification-info">
                    <a href="mailto:hello@tam-digital.com?subject=Email Verification&body=Merhaba, email verification işlemi için yardım istiyorum. Email: ${email}" class="btn btn-outline" style="margin-top: 10px;">
                        <i class="fas fa-envelope"></i> Yardım İste
                    </a>
                    <p style="margin-top: 10px; font-size: 0.9rem; opacity: 0.8;">
                        <i class="fas fa-info-circle"></i> 
                        <strong>Not:</strong> Email doğrulama linkine tıkladıktan sonra GitHub Pages'e yönlendirileceksiniz.
                    </p>
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

// Form toggle event listeners
if (showSignup) {
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginFormContainer.style.display = 'none';
        signupFormContainer.style.display = 'block';
    });
}

if (showLogin) {
    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
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