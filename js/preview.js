// preview.js

const Preview = (function() {
    const previewContainer = document.querySelector('.preview-container');
    const previewOverlay = document.querySelector('.preview-overlay');
    const previewProjectName = document.querySelector('.preview-project-name');
    const previewTitle = document.querySelector('.preview-title');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const sections = document.querySelectorAll('.section');
    const body = document.body;

    let currentImageUrl = '';
    let isPreviewVisible = false;

    function preloadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(url);
            img.onerror = reject;
            img.src = url;
        });
    }

    async function updatePreview(projectName, title, imageUrl) {
        if (!imageUrl) return;

        try {
            // If it's the same image, just ensure visibility
            if (currentImageUrl === imageUrl && isPreviewVisible) {
                return;
            }

            // Preload the new image
            await preloadImage(imageUrl);
            
            // Set the new image and content
            previewOverlay.style.backgroundImage = `url(${imageUrl})`;
            previewProjectName.textContent = projectName;
            previewTitle.textContent = title;
            
            // Show the preview
            if (!isPreviewVisible) {
                previewContainer.style.visibility = 'visible';
                // Use requestAnimationFrame to ensure proper transition
                requestAnimationFrame(() => {
                    previewContainer.style.opacity = '1';
                    body.classList.add('preview-visible');
                });
            }
            
            currentImageUrl = imageUrl;
            isPreviewVisible = true;
        } catch (error) {
            console.error('Error loading preview image:', error);
        }
    }

    function fadeOutPreview() {
        if (!isPreviewVisible) return;
        
        previewContainer.style.opacity = '0';
        body.classList.remove('preview-visible');
        isPreviewVisible = false;
        
        setTimeout(() => {
            if (!isPreviewVisible) { // Only hide if still not visible
                previewContainer.style.visibility = 'hidden';
                currentImageUrl = '';
            }
        }, 300);
    }

    function init() {
        navLinks.forEach((link, index) => {
            const handlePreview = function() {
                if (this.classList.contains('active')) {
                    fadeOutPreview();
                    return;
                }

                const section = sections[index];
                const projectName = section.getAttribute('data-project-name');
                const imageUrl = section.getAttribute('data-preview-image');
                const title = section.querySelector('.item-display2')?.textContent || '';

                this.classList.add('hovered');
                updatePreview(projectName, title, imageUrl);
            };

            const handlePreviewEnd = function() {
                this.classList.remove('hovered');
                fadeOutPreview();
            };

            // Mouse events
            link.addEventListener('mouseenter', () => {
                handlePreview.call(link);
            });
            
            link.addEventListener('mouseleave', () => {
                handlePreviewEnd.call(link);
            });

            // Keyboard events
            link.addEventListener('focus', handlePreview);
            link.addEventListener('blur', handlePreviewEnd);
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', Preview.init);


