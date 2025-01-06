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
        if (!imageUrl) {
            console.error('No image URL provided for preview');
            return;
        }

        console.log('Attempting to load preview image:', imageUrl);

        try {
            // Clear any pending fade out
            if (fadeOutTimeout) {
                clearTimeout(fadeOutTimeout);
                fadeOutTimeout = null;
            }

            // If it's the same image and already visible, do nothing
            if (currentImageUrl === imageUrl && isPreviewVisible) {
                console.log('Image already visible:', imageUrl);
                return;
            }

            // Preload the new image
            await preloadImage(imageUrl).catch(error => {
                console.error('Failed to load preview image:', imageUrl, error);
                throw error;
            });

            console.log('Successfully loaded preview image:', imageUrl);

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
            console.error('Error in updatePreview:', error);
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

    // Add new function for hero transition
    async function createHeroTransition(fromImageUrl, toSection) {
        return new Promise((resolve) => {
            // Get target image first to calculate proportions
            const targetImage = toSection.querySelector('.main-image');
            if (!targetImage) {
                resolve();
                return;
            }

            // Create transitioning element and container immediately
            const clipContainer = document.createElement('div');
            const transitionEl = document.createElement('div');
            
            clipContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                overflow: hidden;
                z-index: 1000;
            `;
            
            transitionEl.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-image: url(${fromImageUrl});
                background-size: cover;
                background-position: center;
                background-repeat: no-repeat;
                z-index: 1000;
                pointer-events: none;
                opacity: 1;
                transform-origin: center;
                will-change: transform;
                transition: none;
            `;

            // Add to DOM immediately
            document.body.appendChild(clipContainer);
            clipContainer.appendChild(transitionEl);
            
            // Force initial render
            transitionEl.offsetHeight;

            // Pre-calculate initial dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const rect = targetImage.getBoundingClientRect();
            const targetAspectRatio = rect.width / rect.height;
            const viewportAspectRatio = viewportWidth / viewportHeight;

            // Create a mutation observer to watch for section becoming active
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.target === toSection && 
                        mutation.type === 'attributes' && 
                        mutation.attributeName === 'class' &&
                        toSection.classList.contains('active')) {
                        
                        observer.disconnect();
                        
                        // Recalculate position after section is active
                        const updatedRect = targetImage.getBoundingClientRect();
                        
                        let scale;
                        if (viewportAspectRatio > targetAspectRatio) {
                            scale = updatedRect.height / viewportHeight;
                        } else {
                            scale = updatedRect.width / viewportWidth;
                        }

                        const translateX = updatedRect.left + (updatedRect.width / 2) - (viewportWidth / 2);
                        const translateY = updatedRect.top + (updatedRect.height / 2) - (viewportHeight / 2);

                        // Hide target image
                        targetImage.style.opacity = '0';

                        // Enable and apply transition immediately
                        transitionEl.style.transition = `transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)`;
                        transitionEl.style.transform = `
                            translate(${translateX}px, ${translateY}px)
                            scale(${scale})
                        `;
                        transitionEl.style.backgroundSize = 'contain';

                        // Single cleanup listener
                        transitionEl.addEventListener('transitionend', function onTransitionEnd(e) {
                            if (e.propertyName === 'transform') {
                                // Remove this listener
                                transitionEl.removeEventListener('transitionend', onTransitionEnd);
                                
                                // Show target image
                                targetImage.style.opacity = '1';
                                
                                // Fade out transition element
                                transitionEl.style.transition = 'opacity 0.6s ease-out';
                                setTimeout(() => {
                                    transitionEl.style.opacity = '0';
                                    transitionEl.addEventListener('transitionend', (e) => {
                                        if (e.propertyName === 'opacity') {
                                            clipContainer.remove(); // Remove both container and transition element
                                            resolve();
                                        }
                                    }, { once: true });
                                }, 200);
                            }
                        });
                    }
                });
            });

            // Start observing immediately
            observer.observe(toSection, {
                attributes: true,
                attributeFilter: ['class']
            });
        });
    }

    function cleanupPreview() {
        // Immediate cleanup of all preview elements
        previewContainer.style.opacity = '0';
        previewContainer.style.visibility = 'hidden';
        isPreviewVisible = false;
        currentImageUrl = '';
        
        // Remove all overlays
        const overlays = previewContainer.querySelectorAll('.preview-overlay');
        overlays.forEach(overlay => {
            overlay.style.opacity = '0';
            overlay.remove();
        });
        
        // Remove preview-specific classes
        body.classList.remove('preview-visible');
        previewContainer.classList.add('hidden');
        
        // Clear any pending timeouts
        if (fadeOutTimeout) {
            clearTimeout(fadeOutTimeout);
            fadeOutTimeout = null;
        }
    }

    function init() {
        // Get all sections except the intro section
        const contentSections = Array.from(sections).filter(section => section.getAttribute('data-anchor') !== 'intro');
        
        navItems.forEach((item, index) => {
            const link = item.querySelector('a');
            
            const handlePreview = function() {
                if (link.classList.contains('active') || link.classList.contains('clicked')) {
                    fadeOutPreview();
                    return;
                }

                // Match with content sections instead of all sections
                const section = contentSections[index];
                const projectName = section.getAttribute('data-project-name');
                const imageUrl = section.getAttribute('data-preview-image');
                const title = section.querySelector('.item-display2')?.textContent || '';

                link.classList.add('hovered');
                updatePreview(projectName, title, imageUrl);
            };

            const handlePreviewEnd = function() {
                link.classList.remove('hovered');
                // Only fade out if the link wasn't clicked
                if (!link.classList.contains('clicked')) {
                    fadeOutPreview();
                }
            };

            // Mouse events on the list item instead of the anchor
            item.addEventListener('mouseenter', handlePreview);
            item.addEventListener('mouseleave', handlePreviewEnd);

            // Keep keyboard events on the anchor
            link.addEventListener('focus', handlePreview);
            link.addEventListener('blur', handlePreviewEnd);

            // Modify click handler
            link.addEventListener('click', async () => {
                const section = sections[index];
                const imageUrl = section.getAttribute('data-preview-image');
                
                if (isPreviewVisible && imageUrl) {
                    // Start transition first
                    const transitionPromise = createHeroTransition(imageUrl, section);
                    
                    // Then cleanup and navigate
                    cleanupPreview();
                    const sectionId = link.getAttribute('data-section');
                    if (sectionId && window.fullpage_api) {
                        window.fullpage_api.moveTo(sectionId);
                    }
                    
                    // Wait for transition to complete
                    await transitionPromise;
                }
                
                link.classList.add('clicked');
                setTimeout(() => {
                    link.classList.remove('clicked');
                }, 1000);
            });
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', Preview.init);


