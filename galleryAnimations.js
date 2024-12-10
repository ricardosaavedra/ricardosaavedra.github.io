// galleryAnimations.js

(function() {
    // Ensure GSAP and ScrollTrigger are loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        console.error('GSAP or ScrollTrigger not loaded.');
        return;
    }

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);

    // Function to initialize gallery animations for each wrapper
    function initGalleryAnimations() {
        document.querySelectorAll('.wrapper').forEach((wrapper) => {
            const galleryWrapper = wrapper.querySelector('.gallery-wrapper');
            const gallery = wrapper.querySelector('.gallery');

            // Ensure the gallery exists within the wrapper
            if (!galleryWrapper || !gallery) return;

            // Calculate the total scroll distance based on gallery width
            const galleryWidth = gallery.scrollWidth;
            const viewportWidth = window.innerWidth;
            const scrollDistance = galleryWidth - viewportWidth + (60); // Adding margins (30px on each side)

            // Create a timeline for the gallery scroll
            gsap.timeline({
                scrollTrigger: {
                    trigger: galleryWrapper,
                    start: 'top top',
                    end: () => `+=${scrollDistance}`,
                    scrub: 0.5,
                    pin: true,
                    anticipatePin: 1,
                    // markers: true, // Uncomment for debugging
                }
            })
            .to(gallery, {
                x: -scrollDistance,
                ease: 'none'
            });
        });

        // Optional: Refresh ScrollTrigger on window resize to recalculate measurements
        window.addEventListener('resize', () => {
            ScrollTrigger.refresh();
        });
    }

    // Initialize on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', initGalleryAnimations);
})();
