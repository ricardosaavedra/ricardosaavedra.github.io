// script-new.js

document.addEventListener('DOMContentLoaded', function() {

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const previewContainer = document.querySelector('.preview-container');
    const previewOverlays = document.querySelectorAll('.preview-overlay');
    const previewProjectName = document.querySelector('.preview-project-name');
    const previewTitle = document.querySelector('.preview-title');
    let activeOverlayIndex = 0;

    function updatePreview(projectName, title, imageUrl) {
        const nextIndex = (activeOverlayIndex + 1) % 2;
        const currentOverlay = previewOverlays[activeOverlayIndex];
        const nextOverlay = previewOverlays[nextIndex];

        // Setup next overlay
        nextOverlay.style.backgroundImage = `url(${imageUrl})`;

        // Update content
        previewProjectName.textContent = projectName;
        previewTitle.textContent = title;

        // Trigger transition
        previewContainer.classList.add('active');
        currentOverlay.classList.remove('active');
        nextOverlay.classList.add('active');

        // Update active index
        activeOverlayIndex = nextIndex;
    }

    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            const currentActiveLink = document.querySelector('.nav-links li a.active');

            previewContainer.classList.remove('active');

            // Smooth scroll to the target section
            targetSection.scrollIntoView({ behavior: 'smooth' });

            // Update active link styling
            if (currentActiveLink) {
                currentActiveLink.classList.remove('active');
            }
            this.classList.add('active');
        });

        link.addEventListener('mouseenter', function() {
            // Add 'hovered' class to ensure consistent hover effect
            this.classList.add('hovered');

            const section = sections[index];
            const projectName = section.querySelector('.project-name').textContent;
            const title = section.querySelector('.big-title').textContent;
            const previewImage = section.getAttribute('data-preview-image');

            updatePreview(projectName, title, previewImage);
        });

        link.addEventListener('mouseleave', function() {
            // Remove 'hovered' class when mouse leaves
            this.classList.remove('hovered');

            previewContainer.classList.remove('active');
            previewOverlays.forEach(overlay => overlay.classList.remove('active'));
        });

        link.addEventListener('focus', function() {
            // Add 'hovered' class on focus for keyboard navigation
            this.classList.add('hovered');

            const section = sections[index];
            const projectName = section.querySelector('.project-name').textContent;
            const title = section.querySelector('.big-title').textContent;
            const previewImage = section.getAttribute('data-preview-image');

            updatePreview(projectName, title, previewImage);
        });

        link.addEventListener('blur', function() {
            // Remove 'hovered' class on blur
            this.classList.remove('hovered');

            previewContainer.classList.remove('active');
            previewOverlays.forEach(overlay => overlay.classList.remove('active'));
        });
    });

    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -10% 0px', // Adjust threshold area
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] // More granular thresholds
    };

    function sectionObserverCallback(entries, observer) {
        entries.forEach(entry => {
            const index = Array.from(sections).indexOf(entry.target);
            const section = entry.target;

            if (entry.isIntersecting) {
                // Remove fade-out class when section is visible
                section.classList.remove('fade-out');
                navLinks.forEach(link => link.classList.remove('active'));
                navLinks[index].classList.add('active');
            } else {
                // Add fade-out class when section is not visible
                if (entry.boundingClientRect.top < 0) {
                    section.classList.add('fade-out');
                }
            }
        });
    }

    const observer = new IntersectionObserver(sectionObserverCallback, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Add the new scroll handler
    const main = document.querySelector('main');
    let ticking = false;

    main.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const windowHeight = window.innerHeight;

                sections.forEach((section, index) => {
                    const rect = section.getBoundingClientRect();
                    let opacity = 1;
                    let scale = 1;

                    // Fade out the current section as it scrolls out of view
                    if (rect.top < 0 && rect.bottom > 0) {
                        // Section is partially out of view at the top
                        opacity = 1 + (rect.top / windowHeight);
                        opacity = Math.max(opacity, 0); // Ensure opacity doesn't go below 0
                    }

                    // Scale in the next section as it scrolls into view
                    if (rect.top < windowHeight && rect.bottom > 0) {
                        // Section is partially in view
                        const scaleProgress = Math.min((windowHeight - rect.top) / windowHeight, 1);
                        scale = 0.95 + scaleProgress * 0.05; // Scale from 0.95 to 1
                    } else if (rect.top >= windowHeight) {
                        // Section is below the viewport
                        scale = 0.95;
                    }

                    // Apply the calculated opacity and scale
                    section.style.opacity = opacity;
                    section.style.transform = `scale(${scale})`;
                });
                ticking = false;
            });
            ticking = true;
        }
    });

});
