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
const guestSection = document.getElementById('desktopGuestSection'); // Desktop guest section
const userSection = document.getElementById('userSection');
const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const userProfile = document.getElementById('userProfile');
const userDropdown = document.getElementById('userDropdown');
const dropdownUserEmail = document.getElementById('dropdownUserEmail');

// ===== UTILITY FUNCTIONS =====
function updateNavbar(user) {
    console.log('updateNavbar called with user:', user);
    
    if (user && guestSection && userSection && userEmail) {
        // Kullanıcı giriş yapmış
        guestSection.style.display = 'none';
        userSection.style.display = 'flex';
        userSection.style.opacity = '1';
        userEmail.textContent = user.email;
        
        // Update dropdown email too
        if (dropdownUserEmail) {
            dropdownUserEmail.textContent = user.email;
        }
        
        // Update user plan in dropdown
        const userPlanElement = document.querySelector('.user-plan');
        if (userPlanElement && currentUserData) {
            const userPlan = currentUserData.plan || 'Free Plan';
            userPlanElement.textContent = userPlan;
        }
        
        // Immediate show
        userSection.classList.add('loaded');
        
        // Mobil kullanıcı menüsünü de güncelle
        const mobileUserSection = document.getElementById('mobileUserSection');
        const mobileUserEmail = document.getElementById('mobileUserEmail');
        if (mobileUserSection) {
            mobileUserSection.style.display = 'block';
            mobileUserSection.style.opacity = '1';
            mobileUserSection.classList.add('loaded');
        }
        if (mobileUserEmail) {
            mobileUserEmail.textContent = user.email;
        }
        
        // Mobil guest section'ı gizle
        const mobileGuestSection = document.querySelector('#mobileGuestSection');
        if (mobileGuestSection) {
            mobileGuestSection.style.display = 'none';
            mobileGuestSection.style.opacity = '0';
            mobileGuestSection.style.visibility = 'hidden';
            mobileGuestSection.classList.remove('loaded');
        }
        
        // Desktop guest section'ı da gizle
        const desktopGuestSection = document.querySelector('#desktopGuestSection');
        if (desktopGuestSection) {
            desktopGuestSection.style.display = 'none';
            desktopGuestSection.style.opacity = '0';
            desktopGuestSection.style.visibility = 'hidden';
            desktopGuestSection.classList.remove('loaded');
        }
        
        // Dashboard linkini kontrol et ve aktif sayfayı işaretle
        const dashboardLink = userSection.querySelector('a[href*="dashboard"]');
        if (dashboardLink) {
            // Eğer şu anda dashboard sayfasındaysak active class ekle
            if (window.location.pathname.includes('dashboard.html')) {
                dashboardLink.classList.add('active');
            } else {
                dashboardLink.classList.remove('active');
            }
        }
        
        console.log('✅ Navbar güncellendi - Kullanıcı:', user.email);
    } else if (guestSection && userSection) {
        // Kullanıcı giriş yapmamış
        console.log('🔄 Misafir kullanıcı için navbar güncelleniyor...');
        
        guestSection.style.display = 'block';
        guestSection.style.opacity = '1';
        userSection.style.display = 'none';
        userSection.style.opacity = '0';
        
        // Immediate show
        guestSection.classList.add('loaded');
        userSection.classList.remove('loaded');
        
        // Mobil kullanıcı menüsünü gizle
        const mobileUserSection = document.getElementById('mobileUserSection');
        if (mobileUserSection) {
            console.log('📱 Mobil kullanıcı menüsü gizleniyor...');
            mobileUserSection.style.display = 'none';
            mobileUserSection.style.opacity = '0';
            mobileUserSection.classList.remove('loaded');
        }
        
        // Desktop guest section'ı göster
        const desktopGuestSection = document.querySelector('#desktopGuestSection');
        if (desktopGuestSection) {
            console.log('🖥️ Desktop guest section gösteriliyor...');
            desktopGuestSection.style.display = 'block';
            desktopGuestSection.style.opacity = '1';
            desktopGuestSection.style.visibility = 'visible';
            desktopGuestSection.classList.add('loaded');
        }
            
            // Mobil menüde de guest section'ı zorla göster
            const mobileGuestSection = document.querySelector('#mobileGuestSection');
            if (mobileGuestSection) {
                console.log('📱 Mobil guest section zorla gösteriliyor...');
                mobileGuestSection.style.display = 'block';
                mobileGuestSection.style.opacity = '1';
                mobileGuestSection.style.visibility = 'visible';
                mobileGuestSection.style.position = 'relative';
                mobileGuestSection.style.zIndex = '999';
                mobileGuestSection.style.height = 'auto';
                mobileGuestSection.style.minHeight = '50px';
                mobileGuestSection.style.margin = '0';
                mobileGuestSection.style.padding = '0';
                mobileGuestSection.style.background = 'transparent';
                mobileGuestSection.style.border = 'none';
                mobileGuestSection.style.boxShadow = 'none';
                mobileGuestSection.classList.add('loaded');
                
                // Nav-link'i de zorla göster
                const guestLink = mobileGuestSection.querySelector('.nav-link');
                if (guestLink) {
                    console.log('📱 Mobil guest link zorla gösteriliyor...');
                    guestLink.style.display = 'block';
                    guestLink.style.opacity = '1';
                    guestLink.style.visibility = 'visible';
                    guestLink.style.color = 'var(--text-white)';
                    guestLink.style.background = 'none';
                    guestLink.style.border = 'none';
                    guestLink.style.padding = '15px 20px';
                    guestLink.style.fontSize = '16px';
                    guestLink.style.fontWeight = '500';
                    guestLink.style.textDecoration = 'none';
                    guestLink.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
                    guestLink.style.height = 'auto';
                    guestLink.style.minHeight = '50px';
                    guestLink.style.margin = '0';
                    guestLink.style.lineHeight = '1.5';
                    guestLink.style.textAlign = 'left';
                    guestLink.style.width = '100%';
                    guestLink.style.position = 'relative';
                    guestLink.style.zIndex = '1000';
                }
            }
            
            // Yeni mobil guest section'ı da göster
            const newMobileGuestSection = document.querySelector('#mobileGuestSection');
            if (newMobileGuestSection) {
                console.log('📱 Yeni mobil guest section gösteriliyor...');
                newMobileGuestSection.style.display = 'block';
                newMobileGuestSection.style.opacity = '1';
                newMobileGuestSection.style.visibility = 'visible';
                newMobileGuestSection.classList.add('loaded');
            }
        }
        
        console.log('✅ Navbar güncellendi - Misafir kullanıcı');
    }

async function logoutUser() {
    try {
        console.log('🔄 Çıkış yapılıyor...');
        await auth.signOut();
        console.log('✅ Başarıyla çıkış yapıldı');
        
        // Navbar'ı güncelle
        console.log('🔄 Navbar güncelleniyor...');
        updateNavbar(null);
        
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
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    currentUserData = { uid: user.uid, ...userDoc.data() };
                    console.log('📊 Kullanıcı verileri yüklendi:', currentUserData);
                } else {
                    // Eğer kullanıcı verisi yoksa yeni doküman oluştur
                    console.log('⚠️ Kullanıcı verisi Firestore\'da bulunamadı, yeni doküman oluşturuluyor...');
                    
                    const newUserData = {
                        email: user.email,
                        name: user.displayName || user.email.split('@')[0],
                        company: 'Belirtilmemiş',
                        created_at: firebase.firestore.FieldValue.serverTimestamp(),
                        trial_status: 'free',
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
                        last_login: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    // Firestore'a kaydet
                    await db.collection('users').doc(user.uid).set(newUserData);
                    console.log('✅ Yeni kullanıcı dokümanı oluşturuldu');
                    
                    currentUserData = { uid: user.uid, ...newUserData };
                }
                
                // Premium kontrolü ve free doküman temizliği
                if (currentUserData && currentUserData.trial_status === 'premium') {
                    console.log('🌟 Premium kullanıcı tespit edildi, free dokümanlar temizleniyor...');
                    
                    try {
                        // Aynı email'e sahip tüm dokümanları bul
                        const usersRef = db.collection('users');
                        const querySnapshot = await usersRef.where('email', '==', user.email).get();
                        
                        let premiumDocId = null;
                        let freeDocIds = [];
                        
                        querySnapshot.forEach(doc => {
                            const data = doc.data();
                            if (data.trial_status === 'premium') {
                                premiumDocId = doc.id;
                            } else if (data.trial_status === 'free') {
                                freeDocIds.push(doc.id);
                            }
                        });
                        
                        // Free dokümanları sil
                        if (freeDocIds.length > 0 && premiumDocId) {
                            console.log(`🗑️ ${freeDocIds.length} adet free doküman siliniyor...`);
                            
                            for (const freeDocId of freeDocIds) {
                                await db.collection('users').doc(freeDocId).delete();
                                console.log(`✅ Free doküman silindi: ${freeDocId}`);
                            }
                            
                            console.log('✅ Tüm free dokümanlar temizlendi');
                        }
                        
                    } catch (cleanupError) {
                        console.error('❌ Free doküman temizleme hatası:', cleanupError);
                    }
                }
                
                // Last login güncelle (opsiyonel)
                try {
                    console.log('💾 Last login güncelleniyor...');
                    await db.collection('users').doc(user.uid).update({
                        last_login: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    console.log('✅ Last login güncellendi');
                } catch (updateError) {
                    console.log('⚠️ Last login güncellenemedi:', updateError.message);
                    console.log('⚠️ Bu normal bir durum, kullanıcı dokümanı henüz oluşturulmamış olabilir');
                }
                
            } catch (firestoreError) {
                console.error('❌ Firestore veri çekme hatası:', firestoreError);
                // Firestore hatası olsa bile navbar'ı güncelle
                currentUserData = { uid: user.uid, plan: 'Free Plan', email: user.email };
            }
            
            // Her durumda navbar'ı güncelle
            updateNavbar(user);
            
        } else {
            // Kullanıcı giriş yapmamış
            console.log('🚫 Kullanıcı giriş yapmamış');
            currentUserData = null;
            updateNavbar(null);
        }
    } catch (error) {
        console.error('❌ Auth state işleme hatası:', error);
        // Hata durumunda bile navbar'ı güncelle
        if (user) {
            console.log('⚠️ Genel hata ama kullanıcı giriş yapmış, navbar güncelleniyor');
            currentUserData = { uid: user.uid, plan: 'Free Plan', email: user.email };
            updateNavbar(user);
        } else {
            updateNavbar(null);
        }
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
    
    // Hamburger menü event listener'ını kaldırdım çünkü script.js'de var
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

    // ===== USER DROPDOWN FUNCTIONALITY =====
    document.addEventListener('DOMContentLoaded', function() {
        const userProfile = document.getElementById('userProfile');
        const userDropdown = document.getElementById('userDropdown');
        const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
        
        // Mobil logout butonu
        if (mobileLogoutBtn) {
            mobileLogoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logoutUser();
            });
        }
        
        if (userProfile && userDropdown) {
            // Toggle dropdown on profile click
            userProfile.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleDropdown();
            });
            
            // Close dropdown when clicking outside
            document.addEventListener('click', function(e) {
                if (!userProfile.contains(e.target) && !userDropdown.contains(e.target)) {
                    closeDropdown();
                }
            });
            
            // Prevent dropdown from closing when clicking inside
            userDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
            });
        }
    
    function toggleDropdown() {
        const isOpen = userDropdown.classList.contains('show');
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    }
    
    function openDropdown() {
        userDropdown.classList.add('show');
        userProfile.classList.add('active');
    }
    
    function closeDropdown() {
        userDropdown.classList.remove('show');
        userProfile.classList.remove('active');
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
                document.querySelector('.nav-link[href="index.html#why-choose"]')?.classList.add('active');
            } else if (currentHash === '#pricing') {
                // Fiyatlandırma section'ındaysa
                document.querySelector('.nav-link[href="index.html#pricing"]')?.classList.add('active');
            } else {
                // Ana sayfa default
                document.querySelector('.nav-link[href="index.html"]')?.classList.add('active');
            }
        } else if (currentPage === 'trial.html') {
            document.querySelector('.nav-link[href="trial.html"]')?.classList.add('active');
        } else if (currentPage === 'payment.html') {
            document.querySelector('.nav-link[href="payment.html"]')?.classList.add('active');
        } else if (currentPage === 'login.html') {
            document.querySelector('.nav-link[href="login.html"]')?.classList.add('active');
        } else if (currentPage === 'dashboard.html') {
            document.querySelector('.nav-link[href="dashboard.html"]')?.classList.add('active');
        }
    }
    
    // ===== SECTION SCROLL DETECTION =====
    function setupSectionObserver() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        // Sadece ana sayfada çalışsın
        if (currentPage !== 'index.html' && currentPage !== '') return;
        
        const sections = [
            { id: 'home', navLink: '.nav-link[href="index.html"]' },
            { id: 'why-choose', navLink: '.nav-link[href="index.html#why-choose"]' },
            { id: 'pricing', navLink: '.nav-link[href="index.html#pricing"]' }
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
    
    // Sayfa yüklendiğinde active item'ı güncelle
    setActiveMenuItem();
    
    // Section observer'ı başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupSectionObserver);
    } else {
        setupSectionObserver();
    }
}); 