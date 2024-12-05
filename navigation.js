// navigation.js

const Navigation = (function() {

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
        let thresholds = [];
        for (let i = 0; i <= 20; i++) {
            thresholds.push(i / 20);
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
        // Remove smooth scrolling behavior temporarily
        main.style.scrollBehavior = 'auto';
        
        // Instantly scroll to section
        sections[index].scrollIntoView();
        
        // Re-enable smooth scrolling after a short delay
        setTimeout(() => {
            main.style.scrollBehavior = 'smooth';
        }, 50);
    }

    function init() {
        const observer = new IntersectionObserver((entries) => {
            let maxEntry = entries.reduce((max, entry) => {
                return (entry.intersectionRatio > max.intersectionRatio) ? entry : max;
            }, entries[0]);

            if (maxEntry.intersectionRatio > 0.5) {
                const sectionId = maxEntry.target.id;
                navLinks.forEach(link => {
                    link.classList.toggle('active', 
                        link.getAttribute('data-section') === sectionId);
                });
                updateHeaderContent(maxEntry.target);
            }
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
            });
        });

        // Set initial header content
        updateHeaderContent(sections[0]);
    }

    return { init };

})();

document.addEventListener('DOMContentLoaded', Navigation.init);
