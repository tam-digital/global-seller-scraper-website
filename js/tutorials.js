// Tutorials Modal Management
class TutorialsManager {
    constructor() {
        this.currentVideo = null;
        this.completedVideos = [];
        this.videoData = {
            'registration-activation': {
                title: 'Kayıt ve Hesap Doğrulama',
                description: 'Global Seller Scraper\'a kayıt olma ve hesap doğrulama süreci',
                duration: '4:20',
                videoId: '1107481351' // Kayıt ve aktivasyon video ID'si
            },
            'mac-install': {
                title: 'macOS Kurulum Rehberi',
                description: 'macOS işletim sisteminde Global Seller Scraper yazılımının kurulum adımları ve gerekli ayarlar',
                duration: '5:32',
                videoId: '1107065389' // macOS kurulum video ID'si - doğru ID
            },
            'windows-install': {
                title: 'Windows Kurulum',
                description: 'Windows işletim sisteminde yazılımın kurulum adımları ve gerekli ayarlar',
                duration: '4:18',
                videoId: '1107134277' // Windows kurulum video ID'si - güncellendi
            },
            'first-login': {
                title: 'İlk Giriş ve Hesap Oluşturma',
                description: 'Yazılıma ilk giriş yapma ve hesap oluşturma süreci',
                duration: '3:45',
                videoId: '1106883237' // İlk giriş video ID'si
            },
            'seller-finder': {
                title: 'Satıcı Bulucu Kullanımı',
                description: 'Rakip satıcıları bulma ve analiz etme özelliğinin kullanımı',
                duration: '6:12',
                videoId: '1107493295' // Satıcı bulucu video ID'si - güncellendi
            },
            'inventory-scan': {
                title: 'Envanter Tarama',
                description: 'Satıcıların envanterlerini tarama ve analiz etme süreci',
                duration: '7:28',
                videoId: '1106883237' // Envanter tarama video ID'si
            },
            'asin-check': {
                title: 'ASIN Kontrol Sistemi',
                description: 'ASIN kontrol sistemi ile benzersiz ürünleri filtreleme',
                duration: '4:55',
                videoId: '1106883237' // ASIN kontrol video ID'si
            }
        };
        
        this.init();
    }

    init() {
        // Authentication kontrolü
        this.checkAuthentication();
        
        // Load completed videos from localStorage
        this.loadCompletedVideos();
        
        // Event listeners
        document.getElementById('markCompleted')?.addEventListener('click', () => this.markAsCompleted());
        document.getElementById('nextVideo')?.addEventListener('click', () => this.nextVideo());
        document.getElementById('downloadResources')?.addEventListener('click', () => this.downloadResources());
        
        // Video item click listeners
        document.querySelectorAll('.video-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const videoId = item.getAttribute('data-video');
                this.loadVideo(videoId);
            });
        });

        // Initialize page
        this.updateProgress();
        this.updateVideoList();
        
        // Load first video by default
        this.loadVideo('registration-activation');
    }

    checkAuthentication() {
        const authCheck = document.getElementById('authCheck');
        const accessDenied = document.getElementById('accessDenied');
        const tutorialsSection = document.getElementById('tutorialsSection');
        
        // Element kontrolü
        if (!authCheck || !accessDenied || !tutorialsSection) {
            console.error('❌ Tutorials sayfası elementleri bulunamadı:', {
                authCheck: !!authCheck,
                accessDenied: !!accessDenied,
                tutorialsSection: !!tutorialsSection
            });
            
            // Eğer tutorials sayfasında değilsek, fonksiyonu sonlandır
            if (!window.location.pathname.includes('tutorials.html')) {
                console.log('✅ Tutorials sayfasında değil, fonksiyon sonlandırılıyor');
                return;
            }
            
            return;
        }
        
        // Auth check göster
        authCheck.style.display = 'flex';
        
        // Firebase auth state listener
        firebase.auth().onAuthStateChanged((user) => {
            authCheck.style.display = 'none';
            
            if (user) {
                // Kullanıcı giriş yapmış
                tutorialsSection.style.display = 'block';
                accessDenied.style.display = 'none';
                
                // Navbar'ı güncelle
                this.updateNavbar(user);
            } else {
                // Kullanıcı giriş yapmamış
                tutorialsSection.style.display = 'none';
                accessDenied.style.display = 'flex';
            }
        });
    }

    updateNavbar(user) {
        // User management.js'deki updateNavbar fonksiyonunu çağır
        if (typeof updateNavbar === 'function') {
            updateNavbar(user);
        }
    }

    loadVideo(videoId) {
        const videoData = this.videoData[videoId];
        if (!videoData) return;

        this.currentVideo = videoId;
        
        // Video'yu değiştir
        this.showVideo(videoId);
        
        // Update video info
        document.getElementById('videoTitle').textContent = videoData.title;
        document.getElementById('videoDescription').textContent = videoData.description;
        
        // Güvenlik onayı ve görsel sadece kurulum videolarında göster
        const securityNote = document.querySelector('.video-info div[style*="background: rgba(57, 239, 215, 0.1)"]');
        const setupImage = document.querySelector('.video-info div[style*="text-align: center"]');
        
        if (securityNote) {
            if (videoId === 'mac-install' || videoId === 'windows-install') {
                securityNote.style.display = 'block';
                
                // Windows için farklı mesaj göster
                if (videoId === 'windows-install') {
                    const securityTitle = securityNote.querySelector('h4');
                    const securityDesc = securityNote.querySelector('p');
                    const securityCode = securityNote.querySelector('div[style*="background: #333"]');
                    const securityInfo = securityNote.querySelector('p[style*="font-size: 12px"]');
                    
                    if (securityTitle) securityTitle.innerHTML = '<i class="fas fa-shield-alt"></i> Windows Güvenlik Onayı';
                    if (securityDesc) securityDesc.textContent = 'Eğer yazılım açılmıyorsa, Windows Defender\'da şu ayarı yapın:';
                    if (securityCode) securityCode.textContent = 'Windows Defender > Virüs ve tehdit koruması > Ayarlar > Gerçek zamanlı koruma > Kapat';
                    if (securityInfo) securityInfo.innerHTML = '<i class="fas fa-info-circle"></i> Bu ayar Windows Defender\'ın yazılımı engellemesini önler.';
                } else {
                    // macOS için orijinal mesajı geri yükle
                    const securityTitle = securityNote.querySelector('h4');
                    const securityDesc = securityNote.querySelector('p');
                    const securityCode = securityNote.querySelector('div[style*="background: #333"]');
                    const securityInfo = securityNote.querySelector('p[style*="font-size: 12px"]');
                    
                    if (securityTitle) securityTitle.innerHTML = '<i class="fas fa-shield-alt"></i> Güvenlik Onayı';
                    if (securityDesc) securityDesc.textContent = 'Eğer yazılım açılmıyorsa, Terminal\'de şu komutu çalıştırın:';
                    if (securityCode) securityCode.textContent = 'sudo xattr -rd com.apple.quarantine';
                    if (securityInfo) securityInfo.innerHTML = '<i class="fas fa-info-circle"></i> Bu komut macOS\'un güvenlik kısıtlamalarını kaldırır.';
                }
            } else {
                securityNote.style.display = 'none';
            }
        }
        
        // Kurulum görselini sadece macOS kurulum videosunda göster
        if (setupImage) {
            if (videoId === 'mac-install') {
                setupImage.style.display = 'block';
            } else {
                setupImage.style.display = 'none';
            }
        }

        // Update active state in video list
        document.querySelectorAll('.video-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-video') === videoId) {
                item.classList.add('active');
            }
        });

        // Update button states
        this.updateButtonStates();
    }

    markAsCompleted() {
        if (!this.currentVideo) return;

        if (!this.completedVideos.includes(this.currentVideo)) {
            this.completedVideos.push(this.currentVideo);
            this.saveCompletedVideos();
        }

        this.updateProgress();
        this.updateVideoList();
        this.updateButtonStates();
    }

    nextVideo() {
        const videoItems = Array.from(document.querySelectorAll('.video-item'));
        const currentIndex = videoItems.findIndex(item => item.getAttribute('data-video') === this.currentVideo);
        
        if (currentIndex < videoItems.length - 1) {
            const nextVideoId = videoItems[currentIndex + 1].getAttribute('data-video');
            this.loadVideo(nextVideoId);
        }
    }

    updateProgress() {
        const totalVideos = Object.keys(this.videoData).length;
        const completedCount = this.completedVideos.length;
        const progressPercentage = Math.round((completedCount / totalVideos) * 100);

        const progressBar = document.getElementById('tutorialProgress');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.width = `${progressPercentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${progressPercentage}% Tamamlandı`;
        }
    }

    updateVideoList() {
        document.querySelectorAll('.video-item').forEach(item => {
            const videoId = item.getAttribute('data-video');
            const icon = item.querySelector('i');
            
            if (this.completedVideos.includes(videoId)) {
                item.classList.add('completed');
                item.classList.remove('active');
                icon.className = 'fas fa-check-circle';
            } else {
                item.classList.remove('completed');
                icon.className = 'fas fa-circle';
            }
        });
    }

    updateButtonStates() {
        const markCompletedBtn = document.getElementById('markCompleted');
        const nextVideoBtn = document.getElementById('nextVideo');
        
        if (markCompletedBtn) {
            if (this.currentVideo && this.completedVideos.includes(this.currentVideo)) {
                markCompletedBtn.innerHTML = '<i class="fas fa-check"></i> Tamamlandı';
                markCompletedBtn.disabled = true;
            } else {
                markCompletedBtn.innerHTML = '<i class="fas fa-check"></i> Tamamlandı';
                markCompletedBtn.disabled = false;
            }
        }
    }

    loadCompletedVideos() {
        const saved = localStorage.getItem('tutorials_completed');
        if (saved) {
            this.completedVideos = JSON.parse(saved);
        }
    }

    saveCompletedVideos() {
        localStorage.setItem('tutorials_completed', JSON.stringify(this.completedVideos));
    }

    showVideo(videoId) {
        // Tüm video embed'lerini gizle
        const videoEmbeds = document.querySelectorAll('.video-embed');
        if (videoEmbeds.length > 0) {
            videoEmbeds.forEach(embed => {
                embed.style.display = 'none';
            });
        }
        
        // Seçilen video'yu göster
        if (videoId === 'registration-activation') {
            const registrationVideo = document.getElementById('registration-activation-video');
            if (registrationVideo) registrationVideo.style.display = 'block';
        } else if (videoId === 'mac-install') {
            const macVideo = document.getElementById('mac-video');
            if (macVideo) macVideo.style.display = 'block';
        } else if (videoId === 'windows-install') {
            const windowsVideo = document.getElementById('windows-video');
            if (windowsVideo) windowsVideo.style.display = 'block';
        } else if (videoId === 'seller-finder') {
            const sellerFinderVideo = document.getElementById('seller-finder-video');
            if (sellerFinderVideo) sellerFinderVideo.style.display = 'block';
        } else {
            // Diğer videolar için placeholder göster
            const otherVideos = document.getElementById('other-videos');
            if (otherVideos) otherVideos.style.display = 'block';
        }
    }

    downloadResources() {
        if (!this.currentVideo) {
            alert('Önce bir video seçin!');
            return;
        }

        const videoData = this.videoData[this.currentVideo];
        if (!videoData) return;

        // Simulated download - gerçek uygulamada dosya linki olacak
        const downloadLinks = {
            'registration-activation': 'https://example.com/registration-activation-guide.pdf',
            'mac-install': 'https://example.com/mac-install-guide.pdf',
            'windows-install': 'https://example.com/windows-install-guide.pdf',
            'first-login': 'https://example.com/first-login-guide.pdf',
            'seller-finder': 'https://example.com/seller-finder-guide.pdf',
            'inventory-scan': 'https://example.com/inventory-scan-guide.pdf',
            'asin-check': 'https://example.com/asin-check-guide.pdf'
        };

        const link = downloadLinks[this.currentVideo];
        if (link) {
            // Create temporary link and trigger download
            const a = document.createElement('a');
            a.href = link;
            a.download = `${videoData.title}.pdf`;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // Show success message
            alert(`${videoData.title} için ders kaynakları indiriliyor...`);
        } else {
            alert('Bu video için henüz kaynak dosyası hazır değil.');
        }
    }
}

// Initialize tutorials manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TutorialsManager();
}); 