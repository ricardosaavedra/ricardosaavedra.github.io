document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.section-header');
    const headerContent = document.querySelector('.header-content');
    let lastCheckTime = 0;
    const throttleTime = 16; // Approximately 60fps
    let isTransitioning = false;
    
    function instantFadeOut() {
        if (!headerContent) return;
        
        // Remove any existing transition classes
        headerContent.classList.remove('fade-in', 'fade-out');
        // Add instant fade and prevent header animations
        headerContent.classList.add('instant-fade');
        header.classList.add('transitioning');
        // Remove over-image class immediately
        header.classList.remove('over-image');
    }

    function fadeInHeader() {
        if (!headerContent) return;
        
        // Remove instant fade
        headerContent.classList.remove('instant-fade');
        header.classList.remove('transitioning');
        // Force reflow
        void headerContent.offsetWidth;
        // Add fade in
        headerContent.classList.add('fade-in');
        
        // Remove fade-in class after animation completes
        setTimeout(() => {
            headerContent.classList.remove('fade-in');
        }, 600);
    }
    
    function checkHeaderImageIntersection(forceCheck = false) {
        // Skip ALL checks if we're transitioning
        if (isTransitioning) return;

        const now = Date.now();
        if (!forceCheck && now - lastCheckTime < throttleTime) return;
        lastCheckTime = now;
        
        const headerRect = header.getBoundingClientRect();
        const currentSection = document.querySelector('.section.active');
        if (!currentSection) return;
        
        const imageGrid = currentSection.querySelector('.image-grid');
        if (!imageGrid) {
            header.classList.remove('over-image');
            return;
        }
        
        const imageRect = imageGrid.getBoundingClientRect();
        const isOverImage = headerRect.bottom > imageRect.top && 
                          headerRect.top < imageRect.bottom &&
                          imageRect.top < window.innerHeight;
        
        // Only apply changes if we're not transitioning
        if (!isTransitioning) {
            requestAnimationFrame(() => {
                if (!isTransitioning) {
                    if (isOverImage && !header.classList.contains('transitioning')) {
                        header.classList.add('over-image');
                    } else {
                        header.classList.remove('over-image');
                    }
                }
            });
        }
    }
    
    // For fullPage.js scrolling
    if (window.fullpage_api) {
        // Optimize scroll check
        document.querySelectorAll('.fp-overflow').forEach(section => {
            section.addEventListener('scroll', () => {
                if (!isTransitioning) {
                    checkHeaderImageIntersection(false);
                }
            }, { passive: true });
        });
        
        // Handle section changes
        window.fullpage_api.beforeLeave = (origin, destination, direction) => {
            // Instantly fade out before any transition starts
            isTransitioning = true;
            instantFadeOut();
        };
        
        window.fullpage_api.onLeave = (origin, destination, direction) => {
            // Ensure we're still in transition state
            isTransitioning = true;
        };
        
        window.fullpage_api.afterLoad = (origin, destination, direction) => {
            // Wait for the transition to complete before showing header
            setTimeout(() => {
                isTransitioning = false;
                fadeInHeader();
                // Check position in new section after everything is done
                setTimeout(() => {
                    checkHeaderImageIntersection(true);
                }, 100);
            }, 600);
        };
        
        // Watch for any fullpage movements, but only if not transitioning
        document.addEventListener('wheel', () => {
            if (!isTransitioning) {
                checkHeaderImageIntersection(true);
            }
        }, { passive: true });
        
        document.addEventListener('keydown', (e) => {
            if (e.key.startsWith('Arrow') && !isTransitioning) {
                checkHeaderImageIntersection(true);
            }
        });
        
        // Handle resize, but only if not transitioning
        window.addEventListener('resize', () => {
            if (!isTransitioning) {
                checkHeaderImageIntersection(true);
            }
        }, { passive: true });
        
        // Initial check
        checkHeaderImageIntersection(true);
    }
}); 