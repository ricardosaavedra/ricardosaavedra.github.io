// script-new.js

document.addEventListener('DOMContentLoaded', function() {

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const previewContainer = document.querySelector('.preview-container');
    const previewOverlay = document.querySelector('.preview-overlay');
    const previewProjectName = document.querySelector('.preview-project-name');
    const previewTitle = document.querySelector('.preview-title');
    let activeOverlayIndex = 0;

    // Select the fixed section header elements
    const sectionHeader = document.querySelector('.section-header');
    const headerProjectName = sectionHeader.querySelector('.project-name');
    const headerCompany = sectionHeader.querySelector('.company');
    const headerYear = sectionHeader.querySelector('.year');
    const headerCaseStudyBtn = sectionHeader.querySelector('.case-study-btn');

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

            // Update header content
            const currentSection = maxEntry.target;
            const projectName = currentSection.getAttribute('data-project-name');
            const company = currentSection.getAttribute('data-company');
            const year = currentSection.getAttribute('data-year');
            const caseStudyUrl = currentSection.getAttribute('data-case-study-url');

            headerProjectName.textContent = projectName;
            headerCompany.textContent = company;
            headerYear.textContent = year;

            // Update Case Study button click event
            headerCaseStudyBtn.onclick = function() {
                window.location.href = caseStudyUrl;
            };
        }

    }, options);

    // Observe all sections
    sections.forEach(section => {
        observer.observe(section);
    });

    // Add variables to keep track of current animations
    let currentFadeInAnimation = null;
    let currentFadeOutAnimation = null;

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
                duration: 600, // Duration in milliseconds
                fill: 'forwards'
            }
        );

        currentFadeInAnimation.onfinish = () => {
            currentFadeInAnimation = null;
        };
    }

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

    navLinks.forEach((link, index) => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            const currentActiveLink = document.querySelector('.nav-links li a.active');

            if (this.classList.contains('active')) {
                return;
            }

            fadeOutPreview();

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

    // Set initial header content based on the first section
    const firstSection = document.querySelector('.section');
    const initialProjectName = firstSection.getAttribute('data-project-name');
    const initialCompany = firstSection.getAttribute('data-company');
    const initialYear = firstSection.getAttribute('data-year');
    const initialCaseStudyUrl = firstSection.getAttribute('data-case-study-url');

    headerProjectName.textContent = initialProjectName;
    headerCompany.textContent = initialCompany;
    headerYear.textContent = initialYear;

    headerCaseStudyBtn.onclick = function() {
        window.location.href = initialCaseStudyUrl;
    };

});
