// script-new.js

document.addEventListener('DOMContentLoaded', function() {

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const previewContainer = document.querySelector('.preview-container');
    const previewOverlay = document.querySelector('.preview-overlay');
    const previewProjectName = document.querySelector('.preview-project-name');
    const previewTitle = document.querySelector('.preview-title');

    // Select the fixed section header elements
    const sectionHeader = document.querySelector('.section-header');
    const headerProjectName = sectionHeader.querySelector('.project-name');
    const headerCompany = sectionHeader.querySelector('.company');
    const headerYear = sectionHeader.querySelector('.year');
    const headerCaseStudyBtn = sectionHeader.querySelector('.case-study-btn');

    const main = document.querySelector('main');

    // Function to scroll to a specific section
    function scrollToSection(index) {
        const section = sections[index];
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Function to update preview
    function updatePreview(projectName, title, imageUrl) {
        // Cancel any ongoing fade-out animation
        if (currentFadeOutAnimation) {
            currentFadeOutAnimation.cancel();
            currentFadeOutAnimation = null;
        }

        // Cancel any ongoing fade-in animation
        if (currentFadeInAnimation) {
            currentFadeInAnimation.cancel();
        }

        // Set the preview overlay image
        previewOverlay.style.backgroundImage = `url(${imageUrl})`;

        // Update preview content
        previewProjectName.textContent = projectName;
        previewTitle.textContent = title;

        // Ensure the preview container is visible
        previewContainer.style.visibility = 'visible';

        // Start a fade-in animation
        currentFadeInAnimation = previewContainer.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            {
                duration: 200, // Duration in milliseconds
                fill: 'forwards'
            }
        );

        currentFadeInAnimation.onfinish = () => {
            currentFadeInAnimation = null;
        };
    }

    // Function to fade out preview
    function fadeOutPreview() {
        // Cancel any ongoing fade-in animation
        if (currentFadeInAnimation) {
            currentFadeInAnimation.cancel();
            currentFadeInAnimation = null;
        }

        // Cancel any ongoing fade-out animation
        if (currentFadeOutAnimation) {
            currentFadeOutAnimation.cancel();
        }

        // Start a fade-out animation
        currentFadeOutAnimation = previewContainer.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            {
                duration: 200, // Duration in milliseconds
                fill: 'forwards'
            }
        );

        currentFadeOutAnimation.onfinish = () => {
            // Hide the preview container after fade-out completes
            previewContainer.style.visibility = 'hidden';
            currentFadeOutAnimation = null;
        };
    }

    // Helper function to update header content
    function updateHeaderContent(section) {
        headerProjectName.textContent = section.getAttribute('data-project-name');
        headerCompany.textContent = section.getAttribute('data-company');
        headerYear.textContent = section.getAttribute('data-year');
        headerCaseStudyBtn.onclick = () => {
            window.location.href = section.getAttribute('data-case-study-url');
        };
    }

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
        root: main,
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

            // Update header content
            const currentSection = maxEntry.target;
            updateHeaderContent(currentSection);
        }

    }, options);

    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });

    // Add variables to keep track of current animations
    let currentFadeInAnimation = null;
    let currentFadeOutAnimation = null;

    // Handle scroll event for updating active section
    main.addEventListener('scroll', () => {
        requestAnimationFrame(() => {
            const currentSection = Array.from(sections).find(section => {
                const rect = section.getBoundingClientRect();
                return rect.top >= 0 && rect.top <= window.innerHeight / 2;
            });

            if (currentSection) {
                // Update navigation
                const sectionId = currentSection.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active',
                        link.getAttribute('data-section') === sectionId);
                });

                // Update header content
                updateHeaderContent(currentSection);
            }
        });
    }, { passive: true });

    // Modify nav link click events
    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);

            // Scroll to the target section
            scrollToSection(index);

            // Update active link styling
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });

        link.addEventListener('mouseenter', function() {
            // Don't show preview if link is active
            if (this.classList.contains('active')) {
                return;
            }

            this.classList.add('hovered');

            const section = sections[index];
            const projectName = section.getAttribute('data-project-name');
            const title = section.querySelector('.big-title').textContent;
            const previewImage = section.getAttribute('data-preview-image');

            updatePreview(projectName, title, previewImage);
        });

        link.addEventListener('mouseleave', function() {
            // Remove 'hovered' class when mouse leaves
            this.classList.remove('hovered');

            fadeOutPreview();
        });

        link.addEventListener('focus', function() {
            // Add 'hovered' class on focus for keyboard navigation
            this.classList.add('hovered');

            if (!this.classList.contains('active')) {
                const section = sections[index];
                const projectName = section.getAttribute('data-project-name');
                const title = section.querySelector('.big-title').textContent;
                const previewImage = section.getAttribute('data-preview-image');

                updatePreview(projectName, title, previewImage);
            }
        });

        link.addEventListener('blur', function() {
            // Remove 'hovered' class on blur
            this.classList.remove('hovered');

            fadeOutPreview();
        });
    });

    // Set initial header content based on the first section
    const firstSection = sections[0];
    updateHeaderContent(firstSection);

});
