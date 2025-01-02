// preview.js

const Preview = (function() {
    const previewContainer = document.querySelector('.preview-container');
    const previewOverlay = document.querySelector('.preview-overlay');
    const previewProjectName = document.querySelector('.preview-project-name');
    const previewTitle = document.querySelector('.preview-title');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const sections = document.querySelectorAll('.section');

    function updatePreview(projectName, title, imageUrl) {
        // Use CSS transitions instead of Web Animations API
        previewContainer.style.visibility = 'visible';
        previewContainer.style.opacity = '1';
        previewOverlay.style.backgroundImage = `url(${imageUrl})`;
        previewProjectName.textContent = projectName;
        previewTitle.textContent = title;
    }

    function fadeOutPreview() {
        previewContainer.style.opacity = '0';
        setTimeout(() => {
            previewContainer.style.visibility = 'hidden';
        }, 300); // Match transition duration in CSS
    }

    function init() {
        navLinks.forEach((link, index) => {
            const handlePreview = function() {
                if (this.classList.contains('active')) {
                    fadeOutPreview();
                    return;
                }

                this.classList.add('hovered');
                const section = sections[index];
                updatePreview(
                    section.getAttribute('data-project-name'),
                    section.querySelector('.big-title').textContent,
                    section.getAttribute('data-preview-image')
                );
            };

            const handlePreviewEnd = function() {
                this.classList.remove('hovered');
                fadeOutPreview();
            };

            // Mouse events
            link.addEventListener('mouseenter', handlePreview);
            link.addEventListener('mouseleave', handlePreviewEnd);

            // Keyboard events
            link.addEventListener('focus', handlePreview);
            link.addEventListener('blur', handlePreviewEnd);
        });
    }

    return { init };
})();

document.addEventListener('DOMContentLoaded', Preview.init);


