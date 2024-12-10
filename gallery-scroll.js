// slider.js
const Slider = (function() {
    function initializeSwiper() {
        const swipers = document.querySelectorAll('.swiper');
        
        swipers.forEach(swiperElement => {
            new Swiper(swiperElement, {
                slidesPerView: 2, // Show 2 slides at once
                spaceBetween: 20,
                grabCursor: true,
                resistance: true,
                resistanceRatio: 0.5,
                touchRatio: 1,
                speed: 400,
                
                // Remove freeMode and add these options for snapping
                slidesPerGroup: 1, // Number of slides to snap at once
                centeredSlides: false,
                slideToClickedSlide: true,
                
                // Add snapping effect
                snapOnRelease: true,
                snapGrid: [20], // Snap points
                
                // Optional: Add navigation
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
            });
        });
    }

    function init() {
        initializeSwiper();
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', Slider.init);
