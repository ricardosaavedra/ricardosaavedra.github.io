// preview.js

const Preview = (function() {
    const previewContainer = document.querySelector('.preview-container');
    const previewProjectName = document.querySelector('.preview-project-name');
    const previewTitle = document.querySelector('.preview-title');
    const navItems = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.section');
    const body = document.body;

    let currentImageUrl = '';
    let isPreviewVisible = false;
    let fadeOutTimeout = null;
    let fadeOutDelay = 150; // Delay before starting fade out

    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = reject;
            img.src = url;
        });
    }

    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'preview-overlay';
        return overlay;
    }

    function setPreviewVisible(visible) {
        if (visible) {
            body.classList.add('preview-visible');
            previewContainer.style.visibility = 'visible';
            requestAnimationFrame(() => {
                previewContainer.style.opacity = '1';
            });
        } else {
            body.classList.remove('preview-visible');
            previewContainer.style.opacity = '0';
            setTimeout(() => {
                if (!isPreviewVisible) {
                    previewContainer.style.visibility = 'hidden';
                }
            }, 300);
        }
        isPreviewVisible = visible;
    }

    async function updatePreview(projectName, title, imageUrl) {
        if (!imageUrl) return;

        try {
            // Clear any pending fade out
            if (fadeOutTimeout) {
                clearTimeout(fadeOutTimeout);
                fadeOutTimeout = null;
            }

            // If it's the same image and already visible, do nothing
            if (currentImageUrl === imageUrl && isPreviewVisible) {
                return;
            }

            // Preload the new image
            await preloadImage(imageUrl);

            // Create new overlay for the next image
            const nextOverlay = createOverlay();
            nextOverlay.style.backgroundImage = `url(${imageUrl})`;
            nextOverlay.classList.add('next');
            
            // Add the new overlay to the container
            previewContainer.appendChild(nextOverlay);

            // Show the preview container if it's not visible
            if (!isPreviewVisible) {
                setPreviewVisible(true);
            }

            // Update content
            previewProjectName.textContent = projectName;
            previewTitle.textContent = title;

            // Fade in the new overlay
            requestAnimationFrame(() => {
                nextOverlay.classList.remove('next');
                nextOverlay.classList.add('current');
                
                // Remove old overlays after transition
                const oldOverlays = previewContainer.querySelectorAll('.preview-overlay:not(.current)');
                setTimeout(() => {
                    oldOverlays.forEach(overlay => overlay.remove());
                }, 300);
            });

            currentImageUrl = imageUrl;
        } catch (error) {
            console.error('Error loading preview image:', error);
        }
    }

    function fadeOutPreview() {
        if (!isPreviewVisible) return;
        
        // Clear any existing timeout
        if (fadeOutTimeout) {
            clearTimeout(fadeOutTimeout);
        }
        
        // Set new timeout for delayed fade out
        fadeOutTimeout = setTimeout(() => {
            setPreviewVisible(false);
            
            // Clean up overlays after transition
            setTimeout(() => {
                if (!isPreviewVisible) {
                    currentImageUrl = '';
                    const overlays = previewContainer.querySelectorAll('.preview-overlay');
                    overlays.forEach(overlay => overlay.remove());
                }
            }, 300);
        }, fadeOutDelay);
    }

    function init() {
        navItems.forEach((item, index) => {
            const link = item.querySelector('a');
            
            const handlePreview = function() {
                if (link.classList.contains('active')) {
                    fadeOutPreview();
                    return;
                }

                const section = sections[index];
                const projectName = section.getAttribute('data-project-name');
                const imageUrl = section.getAttribute('data-preview-image');
                const title = section.querySelector('.item-display2')?.textContent || '';

                link.classList.add('hovered');
                updatePreview(projectName, title, imageUrl);
            };

            const handlePreviewEnd = function() {
                link.classList.remove('hovered');
                fadeOutPreview();
            };

            // Mouse events on the list item instead of the anchor
            item.addEventListener('mouseenter', handlePreview);
            item.addEventListener('mouseleave', handlePreviewEnd);

            // Keep keyboard events on the anchor
            link.addEventListener('focus', handlePreview);
            link.addEventListener('blur', handlePreviewEnd);
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', Preview.init);


