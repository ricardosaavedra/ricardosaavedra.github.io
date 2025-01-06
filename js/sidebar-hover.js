// Handle sidebar click interactions
document.addEventListener('DOMContentLoaded', () => {
    const sectionIndicator = document.querySelector('.section-indicator.click-indicator');
    const sidebar = document.querySelector('.sidebar');
    const blurOverlay = document.querySelector('.blur-overlay');
    let isMenuDisabled = false;
    let isMenuOpen = false;
    let isInHomeSection = true; // Track if we're in home section

    function showMenu() {
        if (isMenuDisabled) return;

        isMenuOpen = true;
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('visible');
        blurOverlay.classList.add('visible');
    }

    function hideMenu() {
        if (isInHomeSection) return; // Don't hide if in home section
        
        isMenuOpen = false;
        sidebar.classList.add('collapsed');
        sidebar.classList.remove('visible');
        blurOverlay.classList.remove('visible');
    }

    function toggleMenu() {
        if (isMenuOpen) {
            hideMenu();
        } else {
            showMenu();
        }
    }

    // Toggle menu on section indicator click
    sectionIndicator.addEventListener('click', () => {
        if (!isMenuDisabled && !isInHomeSection) {
            toggleMenu();
        }
    });

    // Hide menu when clicking outside
    document.addEventListener('click', (event) => {
        const clickedLink = event.target.closest('.nav-links a');
        const clickedIndicator = event.target.closest('.section-indicator.click-indicator');
        const clickedSidebar = event.target.closest('.sidebar');
        
        if (clickedLink) {
            // Handle navigation link clicks
            isMenuDisabled = true;
            hideMenu();
        } else if (!clickedIndicator && !clickedSidebar && isMenuOpen) {
            // Hide menu when clicking outside
            hideMenu();
        }
    });

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
}); 