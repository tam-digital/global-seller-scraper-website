// ===== SIMPLE PAYMENT PAGE LOGIC =====

// DOM Elements
const authForms = document.getElementById('authForms');
const paymentForm = document.getElementById('paymentForm');
const paymentContainer = document.querySelector('.payment-container');

// Show loading initially
function showLoading() {
    if (authForms) authForms.style.display = 'none';
    if (paymentForm) paymentForm.style.display = 'none';
    if (paymentContainer) paymentContainer.classList.remove('loaded');
}

// Simple Functions
async function showPaymentForm(user) {
    console.log('💳 Showing payment form for:', user.email);
    if (authForms) authForms.style.display = 'none';
    if (paymentForm) paymentForm.style.display = 'block';
    if (paymentContainer) paymentContainer.classList.add('loaded');
    
    // Get user data to check plan
    try {
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        let userPlan = 'Free Plan';
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            userPlan = userData.plan || 'Free Plan';
        }
        
        // Update plan status if available
        const planStatus = document.getElementById('planStatus');
        if (planStatus) {
            if (userPlan === 'Premium Plan') {
                planStatus.innerHTML = '<span style="color: #39efdc;">✨ Premium Plan</span>';
            } else {
                planStatus.innerHTML = '<span style="color: #ffa500;">📦 Ücretsiz Plan</span>';
            }
        }
        
        console.log('💳 User plan:', userPlan);
    } catch (error) {
        console.error('❌ Error getting user plan:', error);
        // Default to free plan on error
        const planStatus = document.getElementById('planStatus');
        if (planStatus) {
            planStatus.innerHTML = '<span style="color: #ffa500;">📦 Ücretsiz Plan</span>';
        }
    }
}

function showAuthForms() {
    console.log('💳 Showing auth forms');
    if (authForms) authForms.style.display = 'block';
    if (paymentForm) paymentForm.style.display = 'none';
    if (paymentContainer) paymentContainer.classList.add('loaded');
}

// Simple Check Function
async function checkUser() {
    const user = firebase.auth().currentUser;
    console.log('💳 Check user:', user ? user.email : 'None');
    
    if (user) {
        await showPaymentForm(user);
    } else {
        showAuthForms();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('💳 Payment page loaded');
    
    // Hide everything initially
    showLoading();
    
    // Quick check first
    setTimeout(async () => {
        await checkUser();
    }, 100);
    
    // Then wait for Firebase to fully initialize
    setTimeout(async () => {
        await checkUser();
        // Check periodically
        setInterval(async () => {
            await checkUser();
        }, 3000);
    }, 1000);
});

// Manual trigger for testing
window.forceShowPaymentForm = async () => {
    const user = firebase.auth().currentUser;
    if (user) {
        await showPaymentForm(user);
    } else {
        console.log('No user found');
    }
};

console.log('💳 Simple payment script loaded'); 