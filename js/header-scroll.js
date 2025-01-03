document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.section-header');
    
    // Create intersection observer for the entire image sections
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const headerRect = header.getBoundingClientRect();
            const containerRect = entry.target.getBoundingClientRect();
            
            // Check if we're in the image section area
            if (headerRect.bottom > containerRect.top && 
                containerRect.bottom > headerRect.top) {
                header.classList.add('over-image');
            } else {
                // Only remove the class if we're not intersecting with any image section
                const allImageSections = document.querySelectorAll('#fullpage .image-grid, #fullpage .image-row');
                const isOverAnyImage = Array.from(allImageSections).some(section => {
                    const sectionRect = section.getBoundingClientRect();
                    return headerRect.bottom > sectionRect.top && 
                           sectionRect.bottom > headerRect.top;
                });
                
                if (!isOverAnyImage) {
                    header.classList.remove('over-image');
                }
            }
        });
    }, {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px 0px -20% 0px'
    });
    
    // Function to observe ALL image sections in the fullpage
    function observeAllImageSections() {
        // First disconnect existing observations
        observer.disconnect();
        
        // Observe ALL image sections in the fullpage, not just the active section
        const allImageSections = document.querySelectorAll('#fullpage .image-grid, #fullpage .image-row');
        allImageSections.forEach(section => observer.observe(section));
    }
    
    // For fullPage.js scrolling
    if (window.fullpage_api) {
        window.fullpage_api.onLeave = (origin, destination, direction) => {
            // Re-observe all sections after any section change
            setTimeout(observeAllImageSections, 50);
        };
        
        window.fullpage_api.afterLoad = (origin, destination, direction) => {
            observeAllImageSections();
        };
        
        // Initial observation of all sections
        observeAllImageSections();
    }
}); 