// preview.js
const Preview = (function() {
    const previewContainer = document.querySelector('.preview-container');
    const previewOverlay = document.querySelector('.preview-overlay');
    const previewProjectName = document.querySelector('.preview-project-name');
    const previewTitle = document.querySelector('.preview-title');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const sections = document.querySelectorAll('.section');


    let currentFadeInAnimation = null;
    let currentFadeOutAnimation = null;


    function updatePreview(projectName, title, imageUrl) {
        if (currentFadeOutAnimation) {
            currentFadeOutAnimation.cancel();
            currentFadeOutAnimation = null;
        }
        if (currentFadeInAnimation) {
            currentFadeInAnimation.cancel();
        }


        previewOverlay.style.backgroundImage = `url(${imageUrl})`;
        previewProjectName.textContent = projectName;
        previewTitle.textContent = title;
        previewContainer.style.visibility = 'visible';


        currentFadeInAnimation = previewContainer.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: 200, fill: 'forwards' }
        );


        currentFadeInAnimation.onfinish = () => {
            currentFadeInAnimation = null;
        };
    }


    function fadeOutPreview() {
        if (currentFadeInAnimation) {
            currentFadeInAnimation.cancel();
            currentFadeInAnimation = null;
        }
        if (currentFadeOutAnimation) {
            currentFadeOutAnimation.cancel();
        }


        currentFadeOutAnimation = previewContainer.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            { duration: 200, fill: 'forwards' }
        );


        currentFadeOutAnimation.onfinish = () => {
            previewContainer.style.visibility = 'hidden';
            currentFadeOutAnimation = null;
        };
    }


    function init() {
        navLinks.forEach((link, index) => {
            link.addEventListener('mouseenter', function() {
                if (this.classList.contains('active')) return;
                
                this.classList.add('hovered');
                const section = sections[index];
                updatePreview(
                    section.getAttribute('data-project-name'),
                    section.querySelector('.big-title').textContent,
                    section.getAttribute('data-preview-image')
                );
            });


            link.addEventListener('mouseleave', function() {
                this.classList.remove('hovered');
                fadeOutPreview();
            });


            // Keyboard navigation support
            link.addEventListener('focus', function() {
                this.classList.add('hovered');
                if (!this.classList.contains('active')) {
                    const section = sections[index];
                    updatePreview(
                        section.getAttribute('data-project-name'),
                        section.querySelector('.big-title').textContent,
                        section.getAttribute('data-preview-image')
                    );
                }
            });


            link.addEventListener('blur', function() {
                this.classList.remove('hovered');
                fadeOutPreview();
            });
        });
    }


    return { init };
})();


document.addEventListener('DOMContentLoaded', Preview.init);


