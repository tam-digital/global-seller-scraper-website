// Tutorials Modal Management
class TutorialsManager {
    constructor() {
        this.currentVideo = null;
        this.completedVideos = [];
        this.videoData = {
            'mac-install': {
                title: 'Mac OS Kurulum',
                description: 'Mac işletim sisteminde yazılımın kurulum adımları ve gerekli ayarlar',
                duration: '5:32',
                videoId: '1106883237' // Mac kurulum video ID'si
            },
            'windows-install': {
                title: 'Windows Kurulum',
                description: 'Windows işletim sisteminde yazılımın kurulum adımları ve gerekli ayarlar',
                duration: '4:18',
                videoId: '1106883237' // Windows kurulum video ID'si
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
                videoId: '1106883237' // Satıcı bulucu video ID'si
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
        // Load completed videos from localStorage
        this.loadCompletedVideos();
        
        // Event listeners
        document.getElementById('markCompleted')?.addEventListener('click', () => this.markAsCompleted());
        document.getElementById('nextVideo')?.addEventListener('click', () => this.nextVideo());
        
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
    }

    loadVideo(videoId) {
        const videoData = this.videoData[videoId];
        if (!videoData) return;

        this.currentVideo = videoId;
        
        // Update video container
        const videoContainer = document.getElementById('videoContainer');
        if (videoContainer) {
            videoContainer.innerHTML = `
                <div style="padding:56.25% 0 0 0;position:relative;border-radius:12px;overflow:hidden;">
                    <iframe src="https://player.vimeo.com/video/${videoData.videoId}?badge=0&autopause=0&player_id=0&app_id=58479" 
                            frameborder="0" 
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin" 
                            style="position:absolute;top:0;left:0;width:100%;height:100%;" 
                            title="${videoData.title}">
                    </iframe>
                </div>
                <script src="https://player.vimeo.com/api/player.js"></script>
            `;
        }

        // Update video info
        document.getElementById('videoTitle').textContent = videoData.title;
        document.getElementById('videoDescription').textContent = videoData.description;

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
}

// Initialize tutorials manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TutorialsManager();
}); 