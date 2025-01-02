document.addEventListener('DOMContentLoaded', () => {
    // Create a more efficient image loading system
    const preloadImages = () => {
        const images = document.querySelectorAll('img');
        
        // Set initial dimensions before loading
        images.forEach(img => {
            // Add loading class and placeholder
            img.classList.add('loading');
            
            // Get natural dimensions from the image or data attributes
            const naturalWidth = img.getAttribute('width') || img.naturalWidth;
            const naturalHeight = img.getAttribute('height') || img.naturalHeight;
            
            // Set aspect ratio if dimensions are available
            if (naturalWidth && naturalHeight) {
                img.style.aspectRatio = `${naturalWidth}/${naturalHeight}`;
            }
            
            // Force dimensions to prevent layout shifts
            if (img.height > 0) {
                img.style.height = `${img.height}px`;
                img.style.width = `${img.width}px`;
            }
        });

        // Use Intersection Observer for lazy loading with improved timing
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Create new image to preload
                    const preloadImage = new Image();
                    
                    preloadImage.onload = () => {
                        // Use double RAF for smoother transitions
                        requestAnimationFrame(() => {
                            requestAnimationFrame(() => {
                                // Apply loaded image
                                img.src = preloadImage.src;
                                // Remove fixed dimensions after load
                                img.style.removeProperty('height');
                                img.style.removeProperty('width');
                                img.classList.remove('loading');
                                img.classList.add('loaded');
                            });
                        });
                    };
                    
                    preloadImage.src = img.getAttribute('data-src') || img.src;
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '100px 0px', // Increased margin for earlier loading
            threshold: 0.1
        });

        images.forEach(img => imageObserver.observe(img));
    };

    // Optimize reveal animations with improved timing
    const observeElements = () => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Use double RAF for smoother animations
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            entry.target.classList.add('reveal');
                        });
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, options);

        // Add stagger delay to children with improved timing
        document.querySelectorAll('.image-grid, .image-row').forEach((container, containerIndex) => {
            container.classList.add('reveal-item');
            observer.observe(container);

            // Add coordinated stagger to child elements
            const children = container.querySelectorAll('img');
            children.forEach((el, index) => {
                el.style.setProperty('--stagger-delay', `${index * 100}ms`);
                el.classList.add('reveal-item');
                observer.observe(el);
            });
        });
    };

    // Initialize with performance optimizations
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            preloadImages();
            // Slight delay for reveal animations
            setTimeout(observeElements, 100);
        });
    } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(() => {
            preloadImages();
            setTimeout(observeElements, 100);
        }, 0);
    }
}); 