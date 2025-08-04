// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXq",
    authDomain: "globalsellerscraper.firebaseapp.com",
    projectId: "globalsellerscraper",
    storageBucket: "globalsellerscraper.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Affiliate Registration Form
document.addEventListener('DOMContentLoaded', function() {
    const affiliateForm = document.getElementById('affiliateForm');
    
    if (affiliateForm) {
        affiliateForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Form data'sını al
            const formData = {
                companyName: document.getElementById('companyName').value,
                contactName: document.getElementById('contactName').value,
                contactEmail: document.getElementById('contactEmail').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                website: document.getElementById('website').value,
                businessType: document.getElementById('businessType').value,
                targetAudience: document.getElementById('targetAudience').value,
                marketingPlan: document.getElementById('marketingPlan').value,
                status: 'pending',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                affiliateId: generateAffiliateId(),
                discountCode: generateDiscountCode(),
                totalEarnings: 0,
                totalReferrals: 0
            };
            
            try {
                // Firestore'a kaydet
                await db.collection('affiliates').doc(formData.affiliateId).set(formData);
                
                // Başarı mesajı göster
                showMessage('✅ Başvurunuz başarıyla gönderildi!', 'success');
                
                // Form'u temizle
                affiliateForm.reset();
                
                // Email notification gönder
                sendAffiliateNotification(formData);
                
            } catch (error) {
                console.error('Affiliate kayıt hatası:', error);
                showMessage('❌ Başvuru gönderilirken hata oluştu. Lütfen tekrar deneyin.', 'error');
            }
        });
    }
});

// Affiliate ID oluştur
function generateAffiliateId() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `AFF${timestamp}${randomStr}`.toUpperCase();
}

// Discount code oluştur
function generateDiscountCode() {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 6);
    return `AFF${timestamp}${randomStr}`.toUpperCase();
}

// Email notification gönder
async function sendAffiliateNotification(affiliateData) {
    try {
        // Email template
        const emailData = {
            to: affiliateData.contactEmail,
            subject: 'Affiliate Başvurunuz Alındı - Global Seller Scraper',
            body: `
                Merhaba ${affiliateData.contactName},
                
                Affiliate başvurunuz başarıyla alınmıştır.
                
                Başvuru Detayları:
                - Firma: ${affiliateData.companyName}
                - Affiliate ID: ${affiliateData.affiliateId}
                - İndirim Kodu: ${affiliateData.discountCode}
                - Durum: İnceleme Aşamasında
                
                Başvurunuz incelendikten sonra size bilgi verilecektir.
                
                Teşekkürler,
                Global Seller Scraper Ekibi
            `
        };
        
        // Email gönderme (Firebase Functions ile)
        await db.collection('emailNotifications').add({
            ...emailData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        });
        
        console.log('Email notification kaydedildi');
        
    } catch (error) {
        console.error('Email notification hatası:', error);
    }
}

// Mesaj gösterme fonksiyonu
function showMessage(message, type = 'info') {
    // Mevcut mesaj varsa kaldır
    const existingMessage = document.querySelector('.message-box');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const messageBox = document.createElement('div');
    messageBox.className = `message-box ${type}`;
    messageBox.innerHTML = `
        <h3>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'} ${type === 'success' ? 'Başarılı' : type === 'error' ? 'Hata' : 'Bilgi'}</h3>
        <p>${message}</p>
    `;
    
    document.body.appendChild(messageBox);
    
    // 5 saniye sonra kaldır
    setTimeout(() => {
        if (messageBox.parentNode) {
            messageBox.remove();
        }
    }, 5000);
}

// Affiliate Dashboard (eğer kullanıcı giriş yapmışsa)
async function loadAffiliateDashboard() {
    try {
        const user = firebase.auth().currentUser;
        if (!user) return;
        
        // Kullanıcının affiliate bilgilerini al
        const affiliateDoc = await db.collection('affiliates')
            .where('contactEmail', '==', user.email)
            .limit(1)
            .get();
        
        if (!affiliateDoc.empty) {
            const affiliateData = affiliateDoc.docs[0].data();
            
            // Dashboard'u göster
            showAffiliateDashboard(affiliateData);
        }
        
    } catch (error) {
        console.error('Affiliate dashboard yükleme hatası:', error);
    }
}

// Affiliate dashboard göster
function showAffiliateDashboard(affiliateData) {
    const dashboardHTML = `
        <div class="affiliate-dashboard">
            <h2><i class="fas fa-chart-line"></i> Affiliate Dashboard</h2>
            <div class="dashboard-stats">
                <div class="stat-card">
                    <h3>Toplam Kazanç</h3>
                    <span class="stat-value">₺${affiliateData.totalEarnings || 0}</span>
                </div>
                <div class="stat-card">
                    <h3>Toplam Referral</h3>
                    <span class="stat-value">${affiliateData.totalReferrals || 0}</span>
                </div>
                <div class="stat-card">
                    <h3>İndirim Kodu</h3>
                    <span class="stat-value">${affiliateData.discountCode}</span>
                </div>
            </div>
            <div class="dashboard-actions">
                <button class="btn btn-primary" onclick="copyDiscountCode('${affiliateData.discountCode}')">
                    <i class="fas fa-copy"></i> İndirim Kodunu Kopyala
                </button>
                <a href="affiliate.html" class="btn btn-secondary">
                    <i class="fas fa-external-link-alt"></i> Affiliate Sayfası
                </a>
            </div>
        </div>
    `;
    
    // Dashboard'u sayfaya ekle
    const container = document.querySelector('.container');
    if (container) {
        container.insertAdjacentHTML('beforeend', dashboardHTML);
    }
}

// İndirim kodunu kopyala
function copyDiscountCode(code) {
    navigator.clipboard.writeText(code).then(() => {
        showMessage('✅ İndirim kodu kopyalandı!', 'success');
    }).catch(() => {
        showMessage('❌ Kopyalama başarısız', 'error');
    });
}

// Sayfa yüklendiğinde affiliate dashboard'u kontrol et
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadAffiliateDashboard);
} else {
    loadAffiliateDashboard();
} 