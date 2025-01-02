// navigation.js

const Navigation = (function () {

    // Shared DOM elements
    const main = document.querySelector('main');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-links li a');
    const sectionHeader = document.querySelector('.section-header');
    const headerElements = {
        projectName: sectionHeader.querySelector('.project-name'),
        company: sectionHeader.querySelector('.company'),
        year: sectionHeader.querySelector('.year'),
        caseStudyBtn: sectionHeader.querySelector('.case-study-btn')
    };

    function updateHeaderContent(section) {
        headerElements.projectName.textContent = section.getAttribute('data-project-name');
        headerElements.company.textContent = section.getAttribute('data-company');
        headerElements.year.textContent = section.getAttribute('data-year');
        headerElements.caseStudyBtn.onclick = () => {
            window.location.href = section.getAttribute('data-case-study-url');
        };
    }

    function init() {
        // Initialize fullPage.js
        new fullpage('#fullpage', {
            // Navigation
            menu: '.nav-links',
            anchors: ['section1', 'section2', 'section3', 'section4'],
            navigation: false,
            
            // Scrolling
            scrollingSpeed: 800,
            easing: 'easeInOutCubic',
            easingcss3: 'ease-in-out',

        
            touchSensitivity: 10,    // Default balanced setting
            
            
            // Balanced (current setup)
            scrollingSpeed: 600,
            scrollingThreshold: 40,
            easingcss3: 'ease-in-out',

            // Design
            verticalCentered: false,
            paddingTop: '0px',
            paddingBottom: '20px',
            
            // Events
            afterLoad: function(origin, destination, direction) {
                // Update header content
                updateHeaderContent(destination.item);
                
                // Update navigation
                navLinks.forEach(link => {
                    link.classList.toggle('active', 
                        link.getAttribute('data-section') === destination.anchor);
                });

                // Show section with fade effect
                destination.item.style.opacity = '1';
            },
            
            onLeave: function(origin, destination, direction) {
                // Fade out the leaving section
                origin.item.style.opacity = '0';
                
                // Hide preview container smoothly
                const preview = document.querySelector('.preview-container');
                preview.style.transition = 'opacity 0.3s ease';
                preview.style.opacity = '0';
                setTimeout(() => {
                    preview.style.visibility = 'hidden';
                }, 300);
                
                return true; // Allow scrolling to the next section
            },

            // Customize scrolling behavior
            scrollBar: false,
            css3: true,
            normalScrollElements: '.swiper',
            animateAnchor: true,
            keyboardScrolling: true
        });

        // Initialize navigation click handlers
        navLinks.forEach((link) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                // fullPage.js will handle the scrolling
            });
        });

        // Set initial header content
        updateHeaderContent(sections[0]);
    }

    return {
        init
    };

})();

document.addEventListener('DOMContentLoaded', Navigation.init);
