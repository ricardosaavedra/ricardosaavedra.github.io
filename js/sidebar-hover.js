// Handle sidebar hover interactions
document.addEventListener('DOMContentLoaded', () => {
    const sectionIndicator = document.querySelector('.section-indicator');
    const sidebar = document.querySelector('.sidebar');
    const blurOverlay = document.querySelector('.blur-overlay');
    let isMenuDisabled = false;
    let isHovering = false;
    let hoverTimeout;
    let isInHomeSection = true; // Track if we're in home section
    const SAFE_ZONE_WIDTH = 200;

    function showMenu() {
        if (isMenuDisabled) {
            console.log('Menu is disabled, not showing');
            return;
        }

        console.log('showMenu called, current states:', {
            isMenuDisabled,
            isInHomeSection,
            isHovering,
            sidebarClasses: sidebar.classList.toString()
        });

        clearTimeout(hoverTimeout);
        isHovering = true;
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('visible');
        blurOverlay.classList.add('visible');

        console.log('After showMenu, sidebar classes:', sidebar.classList.toString());
    }

    function hideMenu() {
        updateHomeSection(); // Double-check current section
        
        console.log('hideMenu called, current states:', {
            isMenuDisabled,
            isInHomeSection,
            isHovering,
            sidebarClasses: sidebar.classList.toString()
        });

        if (isInHomeSection) {
            console.log('In home section, not hiding menu');
            return;
        }
        
        isHovering = false;
        console.log('Set isHovering to false');
        
        // Clear any existing timeout
        clearTimeout(hoverTimeout);
        
        // Set new timeout for smooth transition
        hoverTimeout = setTimeout(() => {
            console.log('hideMenu timeout executing, isHovering:', isHovering);
            if (!isHovering) {
                console.log('Hiding menu now');
                sidebar.classList.add('collapsed');
                sidebar.classList.remove('visible');
                blurOverlay.classList.remove('visible');
                console.log('After hiding, sidebar classes:', sidebar.classList.toString());
            } else {
                console.log('Menu not hidden because isHovering is true');
            }
        }, 100);
    }

    // Track mouse movement across the entire document
    document.addEventListener('mousemove', (event) => {
        if (isMenuDisabled || isInHomeSection) return;
        
        if (event.clientX <= SAFE_ZONE_WIDTH) {
            console.log('Mouse in safe zone, showing menu');
            showMenu();
        } else {
            console.log('Mouse outside safe zone, hiding menu');
            hideMenu();
        }
    });

    // Show menu when hovering over section indicator
    sectionIndicator.addEventListener('mouseenter', () => {
        console.log('Section indicator mouseenter');
        if (!isMenuDisabled && !isInHomeSection) {
            showMenu();
        }
    });
    sectionIndicator.addEventListener('mouseleave', () => {
        console.log('Section indicator mouseleave');
        hideMenu();
    });

    // Show menu when hovering over sidebar
    sidebar.addEventListener('mouseenter', () => {
        console.log('Sidebar mouseenter');
        if (!isMenuDisabled && !isInHomeSection) {
            showMenu();
        }
    });
    sidebar.addEventListener('mouseleave', () => {
        console.log('Sidebar mouseleave');
        hideMenu();
    });

    // Show menu when hovering over blur overlay
    blurOverlay.addEventListener('mouseenter', (event) => {
        console.log('Blur overlay mouseenter');
        if (!isMenuDisabled && !isInHomeSection && event.clientX <= SAFE_ZONE_WIDTH) {
            showMenu();
        }
    });
    blurOverlay.addEventListener('mouseleave', () => {
        console.log('Blur overlay mouseleave');
        hideMenu();
    });

    // Wait for fullPage.js to initialize and add fp-nav hover handler
    const initFpNavHandler = () => {
        const fpNav = document.getElementById('fp-nav');
        if (fpNav) {
            fpNav.addEventListener('mouseenter', () => {
                console.log('fp-nav mouseenter, states:', {
                    isMenuDisabled,
                    isInHomeSection,
                    isHovering,
                    sidebarClasses: sidebar.classList.toString()
                });
                
                // For fp-nav, we only care if menu is disabled
                if (!isMenuDisabled) {
                    showMenu();
                }
            });
        }
    };

    // Check periodically for fp-nav until it exists
    const checkForFpNav = setInterval(() => {
        console.log('Checking for fp-nav...'); // Debug log
        if (document.getElementById('fp-nav')) {
            console.log('fp-nav found, initializing handler'); // Debug log
            initFpNavHandler();
            clearInterval(checkForFpNav);
        }
    }, 100);

    // Listen for fullpage.js section changes
    if (window.fullpage_api) {
        // Handle section changes more reliably
        window.fullpage_api.on('afterLoad', function(origin, destination, direction) {
            isInHomeSection = destination.anchor === 'intro';
            console.log('Section changed to:', destination.anchor, 'isInHomeSection:', isInHomeSection);
        });

        // Also listen for beforeLeave to ensure state is updated before transitions
        window.fullpage_api.on('beforeLeave', function(origin, destination, direction) {
            isInHomeSection = destination.anchor === 'intro';
            console.log('Before leaving to:', destination.anchor, 'isInHomeSection:', isInHomeSection);
            
            if (!isInHomeSection) {
                sidebar.classList.add('collapsed');
                sidebar.classList.remove('visible');
                blurOverlay.classList.remove('visible');
            }
        });
    }

    // Add a function to check current section
    function updateHomeSection() {
        const currentSection = document.querySelector('.section.active');
        if (currentSection) {
            isInHomeSection = currentSection.getAttribute('data-anchor') === 'intro';
            console.log('Manual section check:', isInHomeSection);
        }
    }

    // Call it initially and periodically for the first few seconds to ensure correct state
    updateHomeSection();
    const initCheck = setInterval(() => {
        updateHomeSection();
        if (document.querySelector('.section.active')) {
            clearInterval(initCheck);
        }
    }, 100);

    // Permanently disable menu on click
    document.addEventListener('click', (event) => {
        const clickedLink = event.target.closest('.nav-links a');
        if (clickedLink) {
            isMenuDisabled = true;
            sidebar.classList.add('collapsed');
            sidebar.classList.remove('visible');
            blurOverlay.classList.remove('visible');
        }
    });
}); 