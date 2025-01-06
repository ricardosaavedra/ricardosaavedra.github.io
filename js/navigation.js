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
        sidebar: null,
        sectionIndicator: null,
        init() {
            this.main = document.querySelector('main');
            this.sections = document.querySelectorAll('.section');
            this.navLinks = document.querySelectorAll('.nav-links li a');
            this.sectionHeader = document.querySelector('.section-header');
            this.previewContainer = document.querySelector('.preview-container');
            this.sidebar = document.querySelector('.sidebar');
            this.sectionIndicator = document.querySelector('.section-indicator');
            this.headerElements = {
                projectName: this.sectionHeader.querySelector('.project-name'),
                company: this.sectionHeader.querySelector('.company'),
                year: this.sectionHeader.querySelector('.year'),
                caseStudyBtn: this.sectionHeader.querySelector('.case-study-btn')
            };
            // Remove initial active section setting
            this.currentActiveSection = null;
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

        // Track if navigation was triggered by click
        let isClickNavigation = false;

        // Add home link click handler
        const homeLink = document.querySelector('.fixed-about .logo');
        if (homeLink) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                isClickNavigation = true;
                if (window.fullpage_api) {
                    window.fullpage_api.moveTo('intro');
                }
            });
        }

        // Initialize fullPage.js with optimized settings
        new fullpage('#fullpage', {
            // Navigation
            menu: '.nav-links',
            anchors: ['intro', 'section1', 'section2', 'section3', 'section4'],
            navigation: true,
            navigationPosition: 'left',
            navigationTooltips: ['Intro', 'Meta Cube', 'Meta', '2023', 'Case Study'],
            showActiveTooltip: false,
            lockAnchors: true,  // Prevent URL updates during scroll
            
            // Scrolling optimization
            scrollingSpeed: 1000,  // Default speed for normal scrolling
            easingcss3: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fitToSection: true,
            fitToSectionDelay: 800,
            
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
                // Handle menu visibility
                if (origin.index === 0 && destination.index !== 0) {
                    // Leaving first section, collapse menu
                    DOM.sidebar.classList.add('collapsed');
                    // Show section indicator
                    DOM.sectionIndicator.classList.add('visible');
                } else if (destination.index === 0) {
                    // Going to first section, show menu
                    DOM.sidebar.classList.remove('collapsed');
                    // Hide section indicator
                    DOM.sectionIndicator.classList.remove('visible');
                }

                // Update section indicator text
                const destinationLink = Array.from(DOM.navLinks).find(link => 
                    link.getAttribute('data-section') === destination.anchor
                );
                if (destinationLink && DOM.sectionIndicator) {
                    DOM.sectionIndicator.querySelector('span').textContent = destinationLink.textContent;
                }

                // 1. Fade out the old header FIRST
                const headerContent = document.querySelector('.header-content');
                if (headerContent) {
                    headerContent.classList.remove('fade-in');
                    headerContent.classList.add('fade-out');
                }

                // Cancel scroll if animation queue is processing
                if (AnimationQueue.isProcessing && AnimationQueue.queue.length > 0) {
                    return false;
                }
                
                // Set scrolling speed based on navigation type
                if (isClickNavigation) {
                    fullpage_api.setScrollingSpeed(0);
                } else {
                    fullpage_api.setScrollingSpeed(1000);
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
                // 2. Update the header text AFTER old content has faded out
                setTimeout(() => {
                    DOM.headerElements.projectName.textContent = destination.item.getAttribute('data-project-name');
                    DOM.headerElements.company.textContent = destination.item.getAttribute('data-company');
                    DOM.headerElements.year.textContent = destination.item.getAttribute('data-year');
                    // If you have a CTA or caseStudyBtn, update that too
                }, 200); // small delay so fade-out is mostly done

                // 3. Fade in the new text
                const headerContent = document.querySelector('.header-content');
                if (headerContent) {
                    // Remove fade-out to reset
                    headerContent.classList.remove('fade-out');
                    // Force reflow if needed (sometimes helps ensure transitions)
                    void headerContent.offsetWidth; 
                    // Then add fade-in
                    headerContent.classList.add('fade-in');
                    
                    // Optionally remove fade-in class after a while, if you like:
                    setTimeout(() => {
                        headerContent.classList.remove('fade-in');
                    }, 600); 
                }

                // Reset click navigation flag after transition
                isClickNavigation = false;
                
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
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = link.getAttribute('data-section');
                // Set flag for click navigation
                isClickNavigation = true;
                
                // Immediately hide preview when clicking
                if (DOM.previewContainer) {
                    DOM.previewContainer.classList.add('hidden');
                    DOM.previewContainer.style.opacity = '0';
                    DOM.previewContainer.style.visibility = 'hidden';
                }
                if (sectionId && window.fullpage_api) {
                    window.fullpage_api.moveTo(sectionId);
                }
            });
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
