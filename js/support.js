// Support System
document.addEventListener('DOMContentLoaded', function() {
    const supportBtn = document.getElementById('supportBtn');
    const supportModal = document.getElementById('supportModal');
    const closeSupportModal = document.getElementById('closeSupportModal');
    const cancelSupport = document.getElementById('cancelSupport');
    const supportForm = document.getElementById('supportForm');

    // Open support modal
    supportBtn.addEventListener('click', function() {
        supportModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });

    // Close support modal
    function closeModal() {
        supportModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        supportForm.reset();
    }

    closeSupportModal.addEventListener('click', closeModal);
    cancelSupport.addEventListener('click', closeModal);

    // Close modal when clicking outside
    supportModal.addEventListener('click', function(e) {
        if (e.target === supportModal) {
            closeModal();
        }
    });

    // Handle form submission
    supportForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const subject = document.getElementById('supportSubject').value;
        const title = document.getElementById('supportTitle').value;
        const message = document.getElementById('supportMessage').value;
        const priority = document.getElementById('supportPriority').value;

        if (!subject || !title || !message) {
            showMessage('Lütfen tüm gerekli alanları doldurun.', 'error');
            return;
        }

        // Get user info
        const user = firebase.auth().currentUser;
        if (!user) {
            showMessage('Giriş yapmanız gerekiyor.', 'error');
            return;
        }

        // Create support ticket
        const ticketData = {
            user_id: user.uid,
            user_email: user.email,
            subject: subject,
            title: title,
            message: message,
            priority: priority,
            status: 'Yeni',
            created_at: firebase.firestore.FieldValue.serverTimestamp(),
            user_plan: 'Free', // Will be updated from user data
            last_login: null // Will be updated from user data
        };

        try {
            // Get user data from Firestore
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                ticketData.user_plan = userData.plan || 'Free';
                ticketData.last_login = userData.last_login;
            }

            // Save to Firestore
            await firebase.firestore().collection('support_tickets').add(ticketData);

            // Send email
            await sendSupportEmail(ticketData);

            showMessage('Destek talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.', 'success');
            closeModal();

        } catch (error) {
            console.error('Support ticket error:', error);
            showMessage('Destek talebi gönderilirken hata oluştu. Lütfen tekrar deneyin.', 'error');
        }
    });
});

// Send support email
async function sendSupportEmail(ticketData) {
    const emailData = {
        to: 'hello@tam-digital.com',
        subject: `[Destek Talebi] ${ticketData.subject} - ${ticketData.title}`,
        body: `
Yeni destek talebi alındı:

📧 Kullanıcı: ${ticketData.user_email}
🎯 Konu: ${ticketData.subject}
📝 Başlık: ${ticketData.title}
🔴 Öncelik: ${ticketData.priority}
📋 Plan: ${ticketData.user_plan}

📄 Mesaj:
${ticketData.message}

---
Bu email Global Seller Scraper destek sistemi tarafından otomatik olarak gönderilmiştir.
        `.trim()
    };

    // For now, we'll use a simple mailto link
    // In production, you'd use a proper email service
    const mailtoLink = `mailto:hello@tam-digital.com?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
    
    // Open email client
    window.open(mailtoLink);
}

// Show message function (reuse existing)
function showMessage(message, type = 'info') {
    // This function should already exist in your codebase
    // If not, you can implement a simple alert for now
    alert(message);
} 