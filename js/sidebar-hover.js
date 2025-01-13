// Handle sidebar click interactions
document.addEventListener('DOMContentLoaded', () => {
    const sectionIndicator = document.querySelector('.section-indicator');
    const sidebar = document.querySelector('.sidebar');
    const blurOverlay = document.querySelector('.blur-overlay');
    
    let isMenuDisabled = false;
    let isMenuOpen = false;
    let isInHomeSection = false;

    function showMenu() {
        if (isMenuDisabled) return;
        isMenuOpen = true;
        sidebar.classList.remove('collapsed');
        sidebar.classList.add('visible');
        blurOverlay.classList.add('visible');
        document.body.classList.add('preview-visible');
        const fpNav = document.getElementById('fp-nav');
        if (fpNav) {
            fpNav.classList.add('hidden');
        }
    }

    function hideMenu() {
        isMenuOpen = false;
        sidebar.classList.add('collapsed');
        sidebar.classList.remove('visible');
        blurOverlay.classList.remove('visible');
        document.body.classList.remove('preview-visible');
        const fpNav = document.getElementById('fp-nav');
        if (fpNav && !isInHomeSection) {
            setTimeout(() => {
                if (!isMenuOpen && !isInHomeSection) {
                    fpNav.classList.remove('hidden');
                }
            }, 300);
        }
    }

    document.addEventListener('click', (event) => {
        const clickedLink = event.target.closest('.nav-links a');
        const clickedSidebar = event.target.closest('.sidebar');
        const clickedBlurOverlay = event.target.closest('.blur-overlay');
        const fpNav = document.getElementById('fp-nav');
        
        if ((clickedBlurOverlay || !clickedSidebar) && isMenuOpen) {
            hideMenu();
            if (fpNav && !isInHomeSection) {
                setTimeout(() => {
                    if (!isMenuOpen && !isInHomeSection) {
                        fpNav.classList.remove('hidden');
                    }
                }, 300);
            }
        } else if (clickedLink) {
            isMenuDisabled = true;
            hideMenu();
            setTimeout(() => {
                isMenuDisabled = false;
            }, 1000);
        }
    });

    if (window.fullpage_api) {
        window.fullpage_api.on('afterLoad', function(origin, destination, direction) {
            const wasInHomeSection = isInHomeSection;
            isInHomeSection = destination.anchor === 'intro';
            
            const fpNav = document.getElementById('fp-nav');
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

        const currentSection = document.querySelector('.section.active');
        if (currentSection) {
            isInHomeSection = currentSection.getAttribute('data-anchor') === 'intro';
        }

        window.fullpage_api.on('onLeave', function(origin, destination, direction) {
            if (!isInHomeSection && !isMenuOpen) {
                sidebar.classList.add('collapsed');
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            hideMenu();
            const fpNav = document.getElementById('fp-nav');
            if (fpNav && !isInHomeSection) {
                setTimeout(() => {
                    if (!isMenuOpen && !isInHomeSection) {
                        fpNav.classList.remove('hidden');
                    }
                }, 300);
            }
        }
    });

    const fpNav = document.getElementById('fp-nav');
    if (fpNav) {
        if (isInHomeSection || isMenuOpen) {
            fpNav.classList.add('hidden');
        }
    }
}); 