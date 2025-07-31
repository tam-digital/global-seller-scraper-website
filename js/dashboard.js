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
                <li>✅ Sınırsız ASIN Tarama</li>
                <li>✅ Sınırsız Ürün Tarama</li>
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
                <li>✅ 10,000 ASIN Tarama</li>
                <li>✅ 10,000 Ürün Tarama</li>
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
        
        // Firestore'dan kullanıcı verilerini çek
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            throw new Error('Kullanıcı verileri bulunamadı');
        }
        
        const userData = userDoc.data();
        console.log('👤 Kullanıcı verileri:', userData);
        
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
        const isPremium = userData.trial_status === 'premium';
        const planStatusText = isPremium ? '🌟 Premium Üye' : '📦 Ücretsiz Plan';
        
        if (planStatus) planStatus.textContent = planStatusText;
        if (currentPlan) currentPlan.textContent = planStatusText;
        
        if (planBadge) {
            planBadge.className = `plan-badge ${isPremium ? 'premium' : 'free'}`;
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
        
        console.log('✅ Dashboard verileri yüklendi');
        
    } catch (error) {
        console.error('❌ Dashboard veri yükleme hatası:', error);
        alert('Dashboard verileri yüklenirken hata oluştu!');
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
    if (!user) {
        // Kullanıcı giriş yapmamış
        loadingState.style.display = 'none';
        accessDenied.style.display = 'block';
        dashboardContent.style.display = 'none';
        return;
    }
    
    // Kullanıcı giriş yapmış
    loadingState.style.display = 'none';
    accessDenied.style.display = 'none';
    dashboardContent.style.display = 'block';
    
    // Dashboard verilerini yükle
    loadDashboardData(user);
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Dashboard sayfası yüklendi');
    
    // Refresh button
    if (refreshDataBtn) {
        refreshDataBtn.addEventListener('click', refreshDashboardData);
    }
    
    // Firebase auth state listener
    firebase.auth().onAuthStateChanged((user) => {
        console.log('🔄 Auth state changed in dashboard:', user ? user.email : 'No user');
        initializeDashboard(user);
    });
});

console.log('✅ Dashboard script yüklendi'); 