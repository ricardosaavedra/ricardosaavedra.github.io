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

    function buildThresholdList() {
        const thresholds = [];
        for (let i = 0; i <= 1.0; i += 0.1) {
            thresholds.push(i);
        }
        return thresholds;
    }

    function updateHeaderContent(section) {
        headerElements.projectName.textContent = section.getAttribute('data-project-name');
        headerElements.company.textContent = section.getAttribute('data-company');
        headerElements.year.textContent = section.getAttribute('data-year');
        headerElements.caseStudyBtn.onclick = () => {
            window.location.href = section.getAttribute('data-case-study-url');
        };
    }

    function scrollToSection(index) {
        sections[index].scrollIntoView({ behavior: 'smooth' });
    }

    function init() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.intersectionRatio > 0.5) {
                    entry.target.classList.add('visible');
                    entry.target.classList.remove('dimmed');

                    const sectionId = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active',
                            link.getAttribute('data-section') === sectionId);
                    });
                    updateHeaderContent(entry.target);
                } else {
                    entry.target.classList.remove('visible');
                    entry.target.classList.add('dimmed');
                }
            });
        }, {
            root: main,
            threshold: buildThresholdList(),
            rootMargin: '0px'
        });

        sections.forEach(section => observer.observe(section));

        // Initialize navigation click handlers
        navLinks.forEach((link, index) => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                scrollToSection(index);
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Hide preview container smoothly
                const preview = document.querySelector('.preview-container');
                preview.style.transition = 'opacity 0.3s ease';
                preview.style.opacity = 0;
                setTimeout(() => {
                    preview.style.visibility = 'hidden';
                }, 300);
            });
        });

        // Set initial header content and visibility for first section
        updateHeaderContent(sections[0]);
        sections[0].classList.add('visible'); // Make first section visible initially
    }

    return {
        init
    };

})();

document.addEventListener('DOMContentLoaded', Navigation.init);
