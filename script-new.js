// script-new.js

document.addEventListener('DOMContentLoaded', function() {

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const previewContainer = document.querySelector('.preview-container');
    const previewOverlays = document.querySelectorAll('.preview-overlay');
    const previewProjectName = document.querySelector('.preview-project-name');
    const previewTitle = document.querySelector('.preview-title');
    let activeOverlayIndex = 0;

    // Create threshold list for smoother tracking
    function buildThresholdList() {
        let thresholds = [];
        let numSteps = 20;
        for (let i = 0; i <= numSteps; i++) {
            let ratio = i / numSteps;
            thresholds.push(ratio);
        }
        return thresholds;
    }

    const options = {
        root: document.querySelector('main'),
        threshold: buildThresholdList(), // Create multiple thresholds for smooth tracking
        rootMargin: '0px'
    };

    // Create intersection observer
    const observer = new IntersectionObserver((entries) => {
        // Find the entry with the largest intersection ratio
        let maxEntry = entries.reduce((max, entry) => {
            return (entry.intersectionRatio > max.intersectionRatio) ? entry : max;
        }, entries[0]);

        if (maxEntry.intersectionRatio > 0.5) { // More than 50% visible
            // Update active menu item
            const sectionId = maxEntry.target.id;
            const correspondingLink = document.querySelector(`.nav-links li a[data-section="${sectionId}"]`);
            
            if (correspondingLink && !correspondingLink.classList.contains('active')) {
                // Remove active class from all links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current link
                correspondingLink.classList.add('active');
            }
        }
    }, options);

    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });

    function updatePreview(projectName, title, imageUrl) {
        // Use a single overlay for simplicity
        const overlay = previewOverlays[0];
        overlay.style.backgroundImage = `url(${imageUrl})`;

        // Update content
        previewProjectName.textContent = projectName;
        previewTitle.textContent = title;

        // Trigger transition with a small delay for smoothness
        requestAnimationFrame(() => {
            previewContainer.classList.add('active');
            overlay.classList.add('active');
        });
    }

    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            const currentActiveLink = document.querySelector('.nav-links li a.active');

            if (this.classList.contains('active')) {
                return;
            }

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
            // Don't show preview if link is active
            if (this.classList.contains('active')) {
                return;
            }

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

            if (!this.classList.contains('active')) {
                const section = sections[index];
                const projectName = section.querySelector('.project-name').textContent;
                const title = section.querySelector('.big-title').textContent;
                const previewImage = section.getAttribute('data-preview-image');

                updatePreview(projectName, title, previewImage);
            }
        });

        link.addEventListener('blur', function() {
            // Remove 'hovered' class on blur
            this.classList.remove('hovered');

            previewContainer.classList.remove('active');
            previewOverlays.forEach(overlay => overlay.classList.remove('active'));
        });
    });

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
