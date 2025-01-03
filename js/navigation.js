// navigation.js

const Navigation = (function () {
    // DOM Cache object to store all queried elements
    const DOM = {
        main: null,
        sections: null,
        navLinks: null,
        sectionHeader: null,
        headerElements: null,
        previewContainer: null,
        currentActiveSection: null, // Track current active section
        init() {
            this.main = document.querySelector('main');
            this.sections = document.querySelectorAll('.section');
            this.navLinks = document.querySelectorAll('.nav-links li a');
            this.sectionHeader = document.querySelector('.section-header');
            this.previewContainer = document.querySelector('.preview-container');
            this.headerElements = {
                projectName: this.sectionHeader.querySelector('.project-name'),
                company: this.sectionHeader.querySelector('.company'),
                year: this.sectionHeader.querySelector('.year'),
                caseStudyBtn: this.sectionHeader.querySelector('.case-study-btn')
            };
            // Set initial active section
            this.currentActiveSection = this.navLinks[0];
            this.currentActiveSection.classList.add('active');
        }
    };

    // Animation Queue for managing transitions
    const AnimationQueue = {
        queue: [],
        isProcessing: false,
        maxQueueLength: 3, // Prevent queue from growing too large

        add(animation, priority = 'normal') {
            // Clear existing animations of same type if queue is too long
            if (this.queue.length >= this.maxQueueLength) {
                this.queue = this.queue.filter(item => item.priority === 'high');
            }

            this.queue.push({
                animation,
                priority,
                timestamp: Date.now()
            });

            if (!this.isProcessing) {
                this.process();
            }
        },

        async process() {
            if (this.queue.length === 0) {
                this.isProcessing = false;
                return;
            }

            this.isProcessing = true;

            // Sort queue by priority and timestamp
            this.queue.sort((a, b) => {
                if (a.priority === 'high' && b.priority !== 'high') return -1;
                if (a.priority !== 'high' && b.priority === 'high') return 1;
                return a.timestamp - b.timestamp;
            });

            const item = this.queue.shift();

            try {
                await item.animation();
            } catch (error) {
                console.error('Animation error:', error);
            }

            // Use requestAnimationFrame for smoother animations
            requestAnimationFrame(() => this.process());
        }
    };

    // Improved throttle function
    function throttle(func, limit) {
        let inThrottle;
        let lastFunc;
        let lastRan;
        return function (...args) {
            if (!inThrottle) {
                func.apply(this, args);
                lastRan = Date.now();
                inThrottle = true;
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    }

    // Optimized header updates
    const updateHeaderContent = throttle((section) => {
        if (!section) return;
        
        AnimationQueue.add(async () => {
            const data = {
                projectName: section.getAttribute('data-project-name'),
                company: section.getAttribute('data-company'),
                year: section.getAttribute('data-year'),
                caseStudyUrl: section.getAttribute('data-case-study-url')
            };

            // Batch DOM updates
            requestAnimationFrame(() => {
                DOM.headerElements.projectName.textContent = data.projectName;
                DOM.headerElements.company.textContent = data.company;
                DOM.headerElements.year.textContent = data.year;
                DOM.headerElements.caseStudyBtn.onclick = () => {
                    window.location.href = data.caseStudyUrl;
                };
            });
        });
    }, 100);

    function init() {
        // Initialize DOM cache
        DOM.init();

        // Initialize fullPage.js with optimized settings
        new fullpage('#fullpage', {
            // Navigation
            menu: '.nav-links',
            anchors: ['section1', 'section2', 'section3', 'section4'],
            navigation: false,
            lockAnchors: true,  // Prevent URL updates during scroll
            
            // Scrolling optimization
            scrollingSpeed: 1000,  // Slightly longer for smoother feel
            easingcss3: 'cubic-bezier(0.22, 1, 0.36, 1)',  // Smooth easing with slight bounce
            fitToSection: true,
            fitToSectionDelay: 800,
            scrollBar: false,
            autoScrolling: true,
            touchSensitivity: 20,
            bigSectionsDestination: 'top',
            scrollingThreshold: 5,  // Smoother threshold detection
            
            // Remove normalScrollElements to allow scrolling while hovering Swiper
            // normalScrollElements: '.swiper',
            // normalScrollElementTouchThreshold: 5,
            
            // Performance optimizations
            css3: true,
            scrollHorizontally: false,
            continuousVertical: false,
            loopBottom: false,
            loopTop: false,
            recordHistory: false,  // Reduce browser operations
            animateAnchor: false,  // Smoother direct navigation
            
            // Disable unnecessary features
            fadingEffect: false,
            parallax: false,
            cards: false,
            lazyLoading: false,
            
            // Design
            verticalCentered: false,
            paddingTop: '0px',
            paddingBottom: '20px',
            
            // Optimized events
            beforeLeave: function(origin, destination, direction) {
                // Cancel scroll if animation queue is processing
                if (AnimationQueue.isProcessing && AnimationQueue.queue.length > 0) {
                    return false;
                }
                
                AnimationQueue.add(async () => {
                    destination.item.classList.add('section-entering');
                    origin.item.classList.add('section-leaving');
                }, 'high');
                return true;
            },

            onLeave: function(origin, destination, direction) {
                // Early menu update as soon as fullPage.js commits to the change
                const nextActiveLink = Array.from(DOM.navLinks).find(link => 
                    link.getAttribute('data-section') === destination.anchor
                );

                if (nextActiveLink && DOM.currentActiveSection !== nextActiveLink) {
                    // Only update if it's actually changing
                    requestAnimationFrame(() => {
                        // Remove active class from all links first
                        DOM.navLinks.forEach(link => link.classList.remove('active'));
                        // Add active to the next link
                        nextActiveLink.classList.add('active');
                        DOM.currentActiveSection = nextActiveLink;
                    });
                }

                // Prepare next section early
                requestAnimationFrame(() => {
                    destination.item.style.willChange = 'opacity, transform';
                });
            },

            afterLoad: function(origin, destination, direction) {
                // Header updates are high priority
                AnimationQueue.add(async () => {
                    updateHeaderContent(destination.item);
                }, 'high');

                // Cleanup is lower priority
                AnimationQueue.add(async () => {
                    if (origin && origin.item) {
                        origin.item.style.willChange = 'auto';
                    }
                    DOM.sections.forEach(section => {
                        section.classList.remove('section-entering', 'section-leaving');
                    });
                    if (DOM.previewContainer) {
                        DOM.previewContainer.classList.add('hidden');
                    }
                }, 'normal');
            },

            // Responsive
            responsiveWidth: 900,
            responsiveHeight: 600,
            observer: true
        });

        // Optimize event listeners
        DOM.navLinks.forEach(link => {
            link.addEventListener('click', (e) => e.preventDefault(), { passive: true });
        });

        // Set initial content
        updateHeaderContent(DOM.sections[0]);
    }

    // Public API
    return { init };
})();

// Initialize based on document readiness
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Navigation.init);
} else {
    Navigation.init();
}
