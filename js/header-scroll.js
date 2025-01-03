document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.section-header');
    let lastCheckTime = 0;
    const throttleTime = 16; // Approximately 60fps
    
    function checkHeaderImageIntersection(forceCheck = false) {
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
        
        // Immediate state update without requestAnimationFrame for forced checks
        if (forceCheck) {
            if (isOverImage) {
                header.classList.add('over-image');
            } else {
                header.classList.remove('over-image');
            }
        } else {
            requestAnimationFrame(() => {
                if (isOverImage) {
                    header.classList.add('over-image');
                } else {
                    header.classList.remove('over-image');
                }
            });
        }
    }
    
    // For fullPage.js scrolling
    if (window.fullpage_api) {
        // Optimize scroll check
        document.querySelectorAll('.fp-overflow').forEach(section => {
            section.addEventListener('scroll', () => checkHeaderImageIntersection(false), { passive: true });
        });
        
        // Handle section changes
        window.fullpage_api.onLeave = (origin, destination, direction) => {
            // Force immediate check when leaving a section
            checkHeaderImageIntersection(true);
        };
        
        window.fullpage_api.afterLoad = (origin, destination, direction) => {
            // Multiple immediate checks after loading new section
            checkHeaderImageIntersection(true);
            // Additional checks to catch any transitions
            setTimeout(() => checkHeaderImageIntersection(true), 50);
            setTimeout(() => checkHeaderImageIntersection(true), 100);
        };
        
        // Watch for any fullpage movements
        document.addEventListener('wheel', () => checkHeaderImageIntersection(true), { passive: true });
        document.addEventListener('keydown', (e) => {
            if (e.key.startsWith('Arrow')) {
                checkHeaderImageIntersection(true);
            }
        });
        
        // Handle resize
        window.addEventListener('resize', () => checkHeaderImageIntersection(true), { passive: true });
        
        // Initial check
        checkHeaderImageIntersection(true);
    }
}); 