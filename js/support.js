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
        const subject = document.getElementById('supportSubject').value;
        const title = document.getElementById('supportTitle').value;
        const message = document.getElementById('supportMessage').value;
        const priority = document.getElementById('supportPriority').value;

        if (!subject || !title || !message) {
            e.preventDefault();
            showMessage('Lütfen tüm gerekli alanları doldurun.', 'error');
            return;
        }

        // Get user info
        const user = firebase.auth().currentUser;
        if (!user) {
            e.preventDefault();
            showMessage('Giriş yapmanız gerekiyor.', 'error');
            return;
        }

        // Set user info in hidden fields
        document.getElementById('userEmailField').value = user.email;
        
        // Get user plan from Firestore
        try {
            const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                document.getElementById('userPlanField').value = userData.plan || 'Free';
            } else {
                document.getElementById('userPlanField').value = 'Free';
            }
        } catch (error) {
            document.getElementById('userPlanField').value = 'Free';
        }

        // Show success message and close modal
        showMessage('Destek talebiniz başarıyla gönderildi. En kısa sürede size dönüş yapacağız.', 'success');
        closeModal();
        
        // Form will submit naturally to Web3Forms
    });
});

// Show message function (reuse existing)
function showMessage(message, type = 'info') {
    // This function should already exist in your codebase
    // If not, you can implement a simple alert for now
    alert(message);
} 