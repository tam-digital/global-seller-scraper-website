// Şifre Değiştirme Modal İşlemleri
document.addEventListener('DOMContentLoaded', function() {
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
    const cancelChangePassword = document.getElementById('cancelChangePassword');
    const changePasswordForm = document.getElementById('changePasswordForm');
    
    // Modal'ı aç
    changePasswordBtn.addEventListener('click', function() {
        changePasswordModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    });
    
    // Modal'ı kapat
    function closeModal() {
        changePasswordModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        changePasswordForm.reset();
    }
    
    closeChangePasswordModal.addEventListener('click', closeModal);
    cancelChangePassword.addEventListener('click', closeModal);
    
    // Modal dışına tıklandığında kapat
    changePasswordModal.addEventListener('click', function(e) {
        if (e.target === changePasswordModal) {
            closeModal();
        }
    });
    
    // Şifre değiştirme formu
    changePasswordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validasyon
        if (newPassword.length < 6) {
            showMessage('Yeni şifre en az 6 karakter olmalıdır.', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showMessage('Yeni şifreler eşleşmiyor.', 'error');
            return;
        }
        
        try {
            // Firebase Auth ile şifre değiştirme
            const user = firebase.auth().currentUser;
            if (!user) {
                showMessage('Kullanıcı oturumu bulunamadı.', 'error');
                return;
            }
            
            // Mevcut şifreyi doğrula
            const credential = firebase.auth.EmailAuthProvider.credential(user.email, currentPassword);
            await user.reauthenticateWithCredential(credential);
            
            // Yeni şifreyi ayarla
            await user.updatePassword(newPassword);
            
            showMessage('Şifreniz başarıyla değiştirildi!', 'success');
            closeModal();
            
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            
            let errorMessage = 'Şifre değiştirme sırasında bir hata oluştu.';
            
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Mevcut şifre yanlış.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Yeni şifre çok zayıf. En az 6 karakter kullanın.';
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Güvenlik nedeniyle tekrar giriş yapmanız gerekiyor.';
            }
            
            showMessage(errorMessage, 'error');
        }
    });
    
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
}); 