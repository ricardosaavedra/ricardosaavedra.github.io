// Handle sidebar click interactions
document.addEventListener('DOMContentLoaded', () => {
    const sectionIndicator = document.querySelector('.section-indicator.click-indicator');
    const sidebar = document.querySelector('.sidebar');
    const blurOverlay = document.querySelector('.blur-overlay');
    
    console.log('Elements found:', {
        sectionIndicator: !!sectionIndicator,
        sidebar: !!sidebar,
        blurOverlay: !!blurOverlay
    });

    let isMenuDisabled = false;
    let isMenuOpen = false;
    let isInHomeSection = false; // Initialize as false and let fullpage.js set it correctly

    function showMenu() {
        console.log('showMenu called', {isMenuDisabled, isMenuOpen, isInHomeSection});
        if (isMenuDisabled) return;

        console.log('Showing menu');
        isMenuOpen = true;
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('visible');
        blurOverlay.classList.add('visible');
        
        // Add preview-visible class to body to trigger inverted styles
        document.body.classList.add('preview-visible');

        // Hide fp-nav
        const fpNav = document.getElementById('fp-nav');
        console.log('Hiding fp-nav', {fpNavExists: !!fpNav});
        if (fpNav) {
            fpNav.classList.add('hidden');
        }
    }

    function hideMenu() {
        console.log('hideMenu called', {isInHomeSection, isMenuOpen});
        
        // Allow hiding even in home section when explicitly called
        console.log('Hiding menu');
        isMenuOpen = false;
        sidebar.classList.add('collapsed');
        sidebar.classList.remove('visible');
        blurOverlay.classList.remove('visible');
        
        // Remove preview-visible class from body
        document.body.classList.remove('preview-visible');

        // Show fp-nav with a slight delay to match transitions
        const fpNav = document.getElementById('fp-nav');
        console.log('Attempting to show fp-nav', {
            fpNavExists: !!fpNav,
            isInHomeSection,
            isMenuOpen,
            willShowNav: !isInHomeSection
        });

        if (fpNav && !isInHomeSection) { // Only show if not in home section
            console.log('Setting timeout to show fp-nav');
            setTimeout(() => {
                console.log('Timeout callback for showing fp-nav', {
                    isMenuOpen,
                    isInHomeSection,
                    willShowNav: !isMenuOpen && !isInHomeSection
                });
                if (!isMenuOpen && !isInHomeSection) { // Double check menu is still closed and not in home
                    console.log('Actually showing fp-nav');
                    fpNav.classList.remove('hidden');
                }
            }, 300);
        }
    }

    function toggleMenu() {
        console.log('toggleMenu called', {isMenuOpen, isInHomeSection});
        if (isMenuOpen) {
            hideMenu();
        } else {
            showMenu();
        }
    }

    // Toggle menu on section indicator click
    sectionIndicator.addEventListener('click', (e) => {
        console.log('Section indicator clicked', {
            isMenuDisabled,
            isInHomeSection,
            isMenuOpen
        });
        
        e.stopPropagation(); // Prevent document click from immediately closing
        if (!isMenuDisabled) { // Remove isInHomeSection check
            toggleMenu();
        }
    });

    // Hide menu when clicking outside
    document.addEventListener('click', (event) => {
        const clickedLink = event.target.closest('.nav-links a');
        const clickedIndicator = event.target.closest('.section-indicator.click-indicator');
        const clickedSidebar = event.target.closest('.sidebar');
        const clickedBlurOverlay = event.target.closest('.blur-overlay');
        const fpNav = document.getElementById('fp-nav');
        
        console.log('Document clicked', {
            clickedLink: !!clickedLink,
            clickedIndicator: !!clickedIndicator,
            clickedSidebar: !!clickedSidebar,
            clickedBlurOverlay: !!clickedBlurOverlay,
            isMenuOpen,
            isInHomeSection,
            fpNavExists: !!fpNav,
            fpNavHidden: fpNav?.classList.contains('hidden'),
            target: event.target
        });

        // Consider clicks on blur overlay as outside clicks
        if ((clickedBlurOverlay || (!clickedIndicator && !clickedSidebar)) && isMenuOpen) {
            console.log('Valid click outside detected');
            // Hide menu when clicking outside
            hideMenu();
            // Explicitly show fp-nav if not in home section
            if (fpNav && !isInHomeSection) {
                console.log('Setting timeout to show fp-nav after click outside');
                setTimeout(() => {
                    console.log('Click outside timeout callback', {
                        isMenuOpen,
                        isInHomeSection,
                        willShowNav: !isMenuOpen && !isInHomeSection
                    });
                    if (!isMenuOpen && !isInHomeSection) {
                        console.log('Actually showing fp-nav after click outside');
                        fpNav.classList.remove('hidden');
                    }
                }, 300);
            }
        } else if (clickedLink) {
            // Handle navigation link clicks
            isMenuDisabled = true;
            hideMenu();
            setTimeout(() => {
                isMenuDisabled = false;
            }, 1000); // Re-enable after transition
        }
    });

    // Listen for fullpage.js section changes
    if (window.fullpage_api) {
        window.fullpage_api.on('afterLoad', function(origin, destination, direction) {
            const wasInHomeSection = isInHomeSection;
            isInHomeSection = destination.anchor === 'intro';
            console.log('Section changed', {
                isInHomeSection,
                wasInHomeSection,
                destinationAnchor: destination.anchor,
                isMenuOpen
            });
            
            // Handle fp-nav visibility
            const fpNav = document.getElementById('fp-nav');
            console.log('Handling fp-nav in section change', {
                fpNavExists: !!fpNav,
                isInHomeSection,
                isMenuOpen,
                willHideNav: isInHomeSection || isMenuOpen
            });
            
            if (fpNav) {
                if (isInHomeSection || isMenuOpen) {
                    fpNav.classList.add('hidden');
                } else {
                    fpNav.classList.remove('hidden');
                }
            }
            
            if (isInHomeSection) {
                sidebar.classList.remove('collapsed');
                sidebar.classList.add('visible');
                blurOverlay.classList.remove('visible');
                document.body.classList.remove('preview-visible');
                isMenuOpen = true;
            } else {
                if (!isMenuOpen || wasInHomeSection) {
                    sidebar.classList.add('collapsed');
                    sidebar.classList.remove('visible');
                    isMenuOpen = false;
                }
            }
        });

        // Immediately check current section
        const currentSection = document.querySelector('.section.active');
        if (currentSection) {
            isInHomeSection = currentSection.getAttribute('data-anchor') === 'intro';
            console.log('Initial section check', { isInHomeSection });
        }

        window.fullpage_api.on('onLeave', function(origin, destination, direction) {
            console.log('Leaving section', {
                isInHomeSection,
                isMenuOpen,
                from: origin?.anchor,
                to: destination?.anchor
            });
            if (!isInHomeSection && !isMenuOpen) {
                sidebar.classList.add('collapsed');
            }
        });
    } else {
        console.warn('fullpage_api not found');
    }

    // Handle escape key to close menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            console.log('Escape pressed, closing menu');
            hideMenu();
            // Explicitly show fp-nav if not in home section
            const fpNav = document.getElementById('fp-nav');
            if (fpNav && !isInHomeSection) {
                console.log('Setting timeout to show fp-nav after escape');
                setTimeout(() => {
                    console.log('Escape timeout callback', {
                        isMenuOpen,
                        isInHomeSection,
                        willShowNav: !isMenuOpen && !isInHomeSection
                    });
                    if (!isMenuOpen && !isInHomeSection) {
                        console.log('Actually showing fp-nav after escape');
                        fpNav.classList.remove('hidden');
                    }
                }, 300);
            }
        }
    });

    // Initial setup of fp-nav visibility
    const fpNav = document.getElementById('fp-nav');
    console.log('Initial fp-nav setup', {
        fpNavExists: !!fpNav,
        isInHomeSection,
        isMenuOpen,
        willHideNav: isInHomeSection || isMenuOpen
    });
    if (fpNav) {
        if (isInHomeSection || isMenuOpen) {
            fpNav.classList.add('hidden');
        }
    }
}); 