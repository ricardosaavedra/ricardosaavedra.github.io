// slider.js
const Slider = (function() {
    function initializeSwiper() {
        const swipers = document.querySelectorAll('.swiper');
        
        swipers.forEach(swiperElement => {
            new Swiper(swiperElement, {
                slidesPerView: 2,
                spaceBetween: 20,
                grabCursor: true,
                resistance: true,
                resistanceRatio: 0.5,
                touchRatio: 1,
                speed: 400,
                
                // Disable mousewheel control
                mousewheel: {
                    enabled: false
                },
                
                slidesPerGroup: 1,
                centeredSlides: false,
                slideToClickedSlide: true,
                
                snapOnRelease: true,
                snapGrid: [20],
                
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
