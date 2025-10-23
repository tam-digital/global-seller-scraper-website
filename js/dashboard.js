// ===== FIREBASE CONFIGURATION =====
// Firebase zaten user-management.js'de başlatıldı, sadece referans al
// const auth = firebase.auth(); // Çakışma yaratıyor
// const db = firebase.firestore(); // Çakışma yaratıyor

// ===== DASHBOARD JAVASCRIPT =====

// DOM Elements
const loadingState = document.getElementById('loadingState');
const dashboardContent = document.getElementById('dashboardContent');
const accessDenied = document.getElementById('accessDenied');
const welcomeMessage = document.getElementById('welcomeMessage');
const planBadge = document.getElementById('planBadge');
const planStatus = document.getElementById('planStatus');

// Account Info Elements
const accountEmail = document.getElementById('accountEmail');
const accountName = document.getElementById('accountName');
const accountCompany = document.getElementById('accountCompany');
const memberSince = document.getElementById('memberSince');

// Plan Info Elements
const currentPlan = document.getElementById('currentPlan');
const planFeatures = document.getElementById('planFeatures');
const upgradeSection = document.getElementById('upgradeSection');

// Usage Stats Elements
const asinScans = document.getElementById('asinScans');
const asinLimit = document.getElementById('asinLimit');
const asinProgress = document.getElementById('asinProgress');
const productScans = document.getElementById('productScans');
const productLimit = document.getElementById('productLimit');
const productProgress = document.getElementById('productProgress');
const sellerSearches = document.getElementById('sellerSearches');
const sellerLimit = document.getElementById('sellerLimit');
const sellerProgress = document.getElementById('sellerProgress');
const resetDate = document.getElementById('resetDate');

// Buttons
const refreshDataBtn = document.getElementById('refreshDataBtn');

// ===== UTILITY FUNCTIONS =====
function formatDate(timestamp) {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateQuotaResetDate(createdAt) {
    if (!createdAt) return '-';
    
    const createdDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const now = new Date();
    
    // Kullanıcının üyelik tarihinden itibaren geçen ay sayısını hesapla
    const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + 
                      (now.getMonth() - createdDate.getMonth());
    
    // Bir sonraki sıfırlanma tarihini hesapla
    const nextResetDate = new Date(createdDate);
    nextResetDate.setMonth(createdDate.getMonth() + monthsDiff + 1);
    nextResetDate.setDate(createdDate.getDate());
    
    // Eğer bu ay zaten geçmişse, gelecek ayın tarihini al
    if (nextResetDate <= now) {
        nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    }
    
    return nextResetDate.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function updateProgressBar(element, current, max) {
    if (!element || max === 0) return;
    const percentage = Math.min((current / max) * 100, 100);
    element.style.width = `${percentage}%`;
    
    // Color coding
    if (percentage < 50) {
        element.style.backgroundColor = '#10b981'; // Green
    } else if (percentage < 80) {
        element.style.backgroundColor = '#f59e0b'; // Yellow
    } else {
        element.style.backgroundColor = '#ef4444'; // Red
    }
}

function showPremiumFeatures() {
    if (planFeatures) {
        planFeatures.innerHTML = `
            <ul>
                <li>✅ Sınırsız ASIN Analizi</li>
                <li>✅ Sınırsız Ürün Analizi</li>
                <li>✅ Sınırsız Satıcı Arama</li>
                <li>✅ Premium Destek</li>
                <li>✅ Gelişmiş Filtreler</li>
                <li>✅ API Erişimi</li>
            </ul>
        `;
    }
    
    if (upgradeSection) {
        upgradeSection.innerHTML = `
            <div class="premium-active">
                <i class="fas fa-check-circle"></i>
                <span>Premium Üyeliğiniz Aktif!</span>
            </div>
        `;
    }
}

function showFreeFeatures() {
    if (planFeatures) {
        planFeatures.innerHTML = `
            <ul>
                <li>✅ 10,000 ASIN Analizi</li>
                <li>✅ 10,000 Ürün Analizi</li>
                <li>❌ Satıcı Arama</li>
                <li>❌ Premium Destek</li>
                <li>❌ Gelişmiş Filtreler</li>
                <li>❌ API Erişimi</li>
            </ul>
        `;
    }
    
    if (upgradeSection) {
        upgradeSection.innerHTML = `
            <a href="payment.html" class="btn btn-primary">
                <i class="fas fa-rocket"></i> Premium'a Geç
            </a>
        `;
    }
}

// ===== LOAD DASHBOARD DATA =====
async function loadDashboardData(user) {
    try {
        console.log('📊 Dashboard verileri yükleniyor...');
        console.log('📊 User UID:', user.uid);
        console.log('📊 Firestore db object:', db);
        
        // Firestore'dan kullanıcı verilerini çek - Email ile arama yap
        console.log('📊 Firestore query başlatılıyor...');
        console.log('📊 Aranan email:', user.email);
        
        // Önce email ile arama yap
        const usersRef = firebase.firestore().collection('users');
        const querySnapshot = await usersRef.where('email', '==', user.email).get();
        
        let userData = null;
        let userDocId = null;
        
        if (!querySnapshot.empty) {
            // Email ile bulunan dokümanları kontrol et
            querySnapshot.forEach(doc => {
                const data = doc.data();
                console.log(`📄 Doküman ID: ${doc.id}, trial_status: ${data.trial_status}`);
                
                // Premium dokümanı tercih et
                if (data.trial_status === 'premium') {
                    userData = data;
                    userDocId = doc.id;
                    console.log('🌟 Premium doküman bulundu:', doc.id);
                } else if (!userData) {
                    // Eğer premium yoksa ilk dokümanı al
                    userData = data;
                    userDocId = doc.id;
                    console.log('📦 Free doküman bulundu:', doc.id);
                }
            });
        }
        
        if (!userData) {
            console.log('⚠️ Kullanıcı dokümanı bulunamadı, oluşturuluyor...');
            
            // Yeni kullanıcı dokümanı oluştur
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
            await firebase.firestore().collection('users').doc(user.uid).set(newUserData);
            console.log('✅ Yeni kullanıcı dokümanı oluşturuldu');
            
            // Oluşturulan veriyi kullan
            userData = newUserData;
            userDocId = user.uid;
        }
        
        console.log('👤 Kullanıcı verileri:', userData);
        console.log('👤 Kullanıcı doküman ID:', userDocId);
        
        console.log('✅ Dashboard verileri yüklendi');
        
        // Dashboard display'i güncelle
        updateDashboardDisplay(userData);
        
    } catch (error) {
        console.error('❌ Dashboard veri yükleme hatası:', error);
        console.error('Hata detayları:', {
            message: error.message,
            stack: error.stack,
            user: user ? user.email : 'No user'
        });
        
        // Daha detaylı hata mesajı
        let errorMessage = 'Dashboard verileri yüklenirken hata oluştu!';
        if (error.message.includes('permission')) {
            errorMessage = 'Firestore erişim izni hatası! Kullanıcı verileri okunamıyor.';
        } else if (error.message.includes('network')) {
            errorMessage = 'Ağ bağlantısı hatası! İnternet bağlantınızı kontrol edin.';
        } else if (error.message.includes('not-found')) {
            errorMessage = 'Kullanıcı verileri bulunamadı! Lütfen tekrar giriş yapın.';
        }
        
        alert(errorMessage);
    }
}

// ===== UPDATE DASHBOARD DISPLAY =====
function updateDashboardDisplay(userData) {
    try {
        console.log('📊 Dashboard display güncelleniyor...');
        
        // Welcome Message
        if (welcomeMessage) {
            welcomeMessage.textContent = `Merhaba ${userData.name || userData.email}!`;
        }
        
        // Account Info
        if (accountEmail) accountEmail.textContent = userData.email || '-';
        if (accountName) accountName.textContent = userData.name || '-';
        if (accountCompany) accountCompany.textContent = userData.company || 'Belirtilmemiş';
        if (memberSince) memberSince.textContent = formatDate(userData.created_at);
        
        // Plan Status
        console.log('🔍 userData.trial_status:', userData.trial_status);
        console.log('🔍 userData.trial_status type:', typeof userData.trial_status);
        const isPremium = userData.trial_status === 'premium';
        console.log('🔍 isPremium:', isPremium);
        const planStatusText = isPremium ? '🌟 Premium Üye' : '📦 Ücretsiz Plan';
        console.log('🔍 planStatusText:', planStatusText);
        
        if (planStatus) planStatus.textContent = planStatusText;
        if (currentPlan) currentPlan.textContent = planStatusText;
        
        if (planBadge) {
            planBadge.className = `plan-badge ${isPremium ? 'premium' : 'free'}`;
        }
        
        // Telegram Button - Sadece premium kullanıcılar için göster
        const telegramBtn = document.getElementById('telegramBtn');
        if (telegramBtn) {
            if (isPremium) {
                telegramBtn.style.display = 'flex';
            } else {
                telegramBtn.style.display = 'none';
            }
        }
        
        // Plan Features
        if (isPremium) {
            showPremiumFeatures();
        } else {
            showFreeFeatures();
        }
        
        // Usage Stats
        const usage = userData.monthly_usage || {
            asin_scans: 0,
            product_scans: 0,
            seller_searches: 0
        };
        
        const limits = userData.limits || {
            asin_scans: 10000,
            product_scans: 10000,
            seller_searches: 0
        };
        
        // Update ASIN Stats
        if (asinScans) asinScans.textContent = usage.asin_scans.toLocaleString();
        if (asinLimit) asinLimit.textContent = isPremium ? '∞' : limits.asin_scans.toLocaleString();
        updateProgressBar(asinProgress, usage.asin_scans, isPremium ? 999999 : limits.asin_scans);
        
        // Update Product Stats
        if (productScans) productScans.textContent = usage.product_scans.toLocaleString();
        if (productLimit) productLimit.textContent = isPremium ? '∞' : limits.product_scans.toLocaleString();
        updateProgressBar(productProgress, usage.product_scans, isPremium ? 999999 : limits.product_scans);
        
        // Update Seller Stats
        if (sellerSearches) sellerSearches.textContent = usage.seller_searches.toLocaleString();
        if (sellerLimit) sellerLimit.textContent = isPremium ? '∞' : limits.seller_searches.toLocaleString();
        updateProgressBar(sellerProgress, usage.seller_searches, isPremium ? 999999 : limits.seller_searches);
        
        // Quota Reset Date
        if (resetDate) {
            const quotaResetDate = calculateQuotaResetDate(userData.created_at);
            resetDate.textContent = quotaResetDate;
        }
        
        console.log('✅ Dashboard display güncellendi');
        
    } catch (error) {
        console.error('❌ Dashboard display güncelleme hatası:', error);
    }
}

// ===== REFRESH DATA =====
async function refreshDashboardData() {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;
    
    if (refreshDataBtn) {
        refreshDataBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Yenileniyor...</span>';
        refreshDataBtn.disabled = true;
    }
    
    await loadDashboardData(currentUser);
    
    if (refreshDataBtn) {
        refreshDataBtn.innerHTML = '<i class="fas fa-sync-alt"></i> <span>Verileri Yenile</span>';
        refreshDataBtn.disabled = false;
    }
}

// ===== INITIALIZE DASHBOARD =====
function initializeDashboard(user) {
    console.log('🔍 initializeDashboard çağrıldı:', user ? user.email : 'No user');
    
    // DOM element kontrolü
    if (!loadingState || !accessDenied || !dashboardContent) {
        console.error('❌ Dashboard elementleri bulunamadı:', {
            loadingState: !!loadingState,
            accessDenied: !!accessDenied,
            dashboardContent: !!dashboardContent
        });
        return;
    }
    
    if (!user) {
        console.log('❌ Kullanıcı giriş yapmamış');
        // Kullanıcı giriş yapmamış
        loadingState.style.display = 'none';
        accessDenied.style.display = 'block';
        dashboardContent.style.display = 'none';
        return;
    }
    
    console.log('✅ Kullanıcı giriş yapmış, dashboard yükleniyor...');
    // Kullanıcı giriş yapmış
    loadingState.style.display = 'none';
    accessDenied.style.display = 'none';
    dashboardContent.style.display = 'block';
    
    // Dashboard verilerini yükle
    loadDashboardData(user);
    
    // Gerçek zamanlı güncelleme için listener ekle - Email ile arama yap
    const usersRef = firebase.firestore().collection('users');
    const query = usersRef.where('email', '==', user.email);
    
    query.onSnapshot((querySnapshot) => {
        if (!querySnapshot.empty) {
            console.log('🔄 Dashboard verileri gerçek zamanlı güncellendi');
            
            let userData = null;
            
            // Premium dokümanı tercih et
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.trial_status === 'premium') {
                    userData = data;
                    console.log('🌟 Premium doküman gerçek zamanlı güncellendi');
                } else if (!userData) {
                    userData = data;
                    console.log('📦 Free doküman gerçek zamanlı güncellendi');
                }
            });
            
            if (userData) {
                updateDashboardDisplay(userData);
            }
        }
    });
}

// ===== UPDATE BANNER =====
function initializeUpdateBanner() {
    const banner = document.getElementById('updateBanner');
    const closeBtn = document.getElementById('bannerClose');
    
    if (!banner || !closeBtn) return;
    
    // Cookie kontrolü - banner daha önce kapatıldı mı?
    const bannerClosed = localStorage.getItem('updateBannerClosed');
    if (bannerClosed === 'true') {
        banner.style.display = 'none';
        return;
    }
    
    // Kapatma butonu event listener
    closeBtn.addEventListener('click', () => {
        banner.style.animation = 'slideUp 0.3s ease-out';
        setTimeout(() => {
            banner.style.display = 'none';
            localStorage.setItem('updateBannerClosed', 'true');
        }, 300);
    });
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard sayfası yüklendi');
    
    // Hamburger menü
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
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
    }
    
    // Refresh button
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', refreshDashboardData);
    }
    
    // Telegram button
    const telegramBtn = document.getElementById('telegramBtn');
    if (telegramBtn) {
        telegramBtn.addEventListener('click', () => {
            // Telegram grubunun linkini yeni sekmede aç
            window.open('https://t.me/+tICbDQWEKCw2ZTFk', '_blank', 'noopener,noreferrer');
        });
    }
    
    // Consultation button
    const consultationBtn = document.getElementById('consultationBtn');
    if (consultationBtn) {
        consultationBtn.addEventListener('click', () => {
            // WhatsApp mesajı hazırla
            const message = encodeURIComponent(`Merhaba Baran Bey! Global Seller Scraper üyesiyim, saatlik danışmanlık almak istiyorum. Müsait olduğunuzda benimle iletişime geçebilir misiniz?`);
            
            // WhatsApp linkini aç
            window.open(`https://wa.me/905308342267?text=${message}`, '_blank', 'noopener,noreferrer');
        });
    }
    
    // Firebase auth state listener
    firebase.auth().onAuthStateChanged((user) => {
        console.log('🔄 Auth state changed in dashboard:', user ? user.email : 'No user');
        console.log('🔄 User object:', user);
        
        if (user) {
            console.log('✅ User authenticated:', {
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified
            });
        } else {
            console.log('❌ No user authenticated');
        }
        
        initializeDashboard(user);
    });
    
    // Initialize update banner
    initializeUpdateBanner();
});

console.log('✅ Dashboard script yüklendi'); 