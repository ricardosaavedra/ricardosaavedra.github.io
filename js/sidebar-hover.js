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
        if (isInHomeSection) return; // Don't hide if in home section
        
        isHovering = false;
        hoverTimeout = setTimeout(() => {
            if (!isHovering) {
                sidebar.classList.add('collapsed');
                sidebar.classList.remove('visible');
                blurOverlay.classList.remove('visible');
            }
        }, 100);
    }

    // Track mouse movement across the entire document
    document.addEventListener('mousemove', (event) => {
        if (isMenuDisabled || isInHomeSection) return;
        
        if (event.clientX <= SAFE_ZONE_WIDTH) {
            showMenu();
        } else {
            hideMenu();
        }
    });

    // Show menu when hovering over section indicator
    sectionIndicator.addEventListener('mouseenter', () => {
        if (!isMenuDisabled && !isInHomeSection) {
            showMenu();
        }
    });

    // Show menu when hovering over sidebar
    sidebar.addEventListener('mouseenter', () => {
        if (!isMenuDisabled && !isInHomeSection) {
            showMenu();
        }
    });

    // Show menu when hovering over blur overlay
    blurOverlay.addEventListener('mouseenter', (event) => {
        if (!isMenuDisabled && !isInHomeSection && event.clientX <= SAFE_ZONE_WIDTH) {
            showMenu();
        }
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
        window.fullpage_api.on('afterLoad', function(origin, destination, direction) {
            isInHomeSection = destination.anchor === 'intro';
            
            if (isInHomeSection) {
                sidebar.classList.remove('collapsed');
                sidebar.classList.add('visible');
            }
        });
    }

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