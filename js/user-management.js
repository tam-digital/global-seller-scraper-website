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

// ===== GLOBAL USER MANAGEMENT =====
let currentUserData = null;

// DOM Elements
const guestSection = document.getElementById('guestSection');
const userSection = document.getElementById('userSection');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');

// ===== UTILITY FUNCTIONS =====
function updateNavbar(user) {
    console.log('updateNavbar called with user:', user);
    
    if (user && guestSection && userSection && userEmail) {
        // Kullanıcı giriş yapmış
        guestSection.style.display = 'none';
        userSection.style.display = 'flex';
        userEmail.textContent = user.email;
        console.log('✅ Navbar güncellendi - Kullanıcı:', user.email);
    } else if (guestSection && userSection) {
        // Kullanıcı giriş yapmamış
        guestSection.style.display = 'block';
        userSection.style.display = 'none';
        console.log('✅ Navbar güncellendi - Misafir kullanıcı');
    }
}

async function logoutUser() {
    try {
        await auth.signOut();
        console.log('✅ Başarıyla çıkış yapıldı');
        
        // Anasayfaya yönlendir
        if (window.location.pathname !== '/index.html' && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('❌ Çıkış hatası:', error);
        alert('Çıkış yapılırken hata oluştu!');
    }
}

// ===== AUTH STATE LISTENER =====
auth.onAuthStateChanged(async (user) => {
    console.log('🔄 Auth state changed:', user ? user.email : 'No user');
    
    try {
        if (user) {
            // Kullanıcı giriş yapmış
            console.log('👤 Kullanıcı giriş yapmış:', user.email);
            
            // Firestore'dan kullanıcı verilerini çek
            const userDoc = await db.collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                currentUserData = { uid: user.uid, ...userDoc.data() };
                console.log('📊 Kullanıcı verileri yüklendi:', currentUserData);
            }
            
            // Last login güncelle
            await db.collection('users').doc(user.uid).update({
                last_login: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            updateNavbar(user);
            
        } else {
            // Kullanıcı giriş yapmamış
            console.log('🚫 Kullanıcı giriş yapmamış');
            currentUserData = null;
            updateNavbar(null);
        }
    } catch (error) {
        console.error('❌ Auth state işleme hatası:', error);
        updateNavbar(user);
    }
});

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 User Management yüklendi');
    
    // Logout button event listener
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('🔄 Logout button tıklandı');
            logoutUser();
        });
    }
    
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
});

// ===== UTILITY FUNCTIONS FOR OTHER SCRIPTS =====
window.getCurrentUser = () => {
    return currentUserData;
};

window.isUserLoggedIn = () => {
    return currentUserData !== null;
};

window.redirectToLogin = () => {
    window.location.href = 'login.html';
};

console.log('✅ User Management script yüklendi'); 