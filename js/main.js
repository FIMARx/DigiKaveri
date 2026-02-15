// js/main.js

// ==========================================
// 1. SERVICE STATUS CHECKER
// ==========================================
async function checkStatus() {
    const badge = document.getElementById('serviceStatus');
    const text = document.getElementById('statusText');

    if (!badge || !text) return;

    try {
        const response = await fetch('data/status.json?v=' + Date.now());
        const data = await response.json();

        if (data.isOpen) {
            badge.className = 'status-badge open';
            text.textContent = data.messageOpen;
        } else {
            badge.className = 'status-badge closed';
            text.textContent = data.messageClosed;
        }
    } catch (error) {
        console.error('Status check error:', error);
        badge.className = 'status-badge closed';
        text.textContent = "Palvelu suljettu";
    }
}

// ==========================================
// MASTER INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Run Status Check
    checkStatus();
    setInterval(checkStatus, 60000);

    // Initialize Page Features
    initFAQ();
    initScrollSpy();
    initSmoothScroller();
});


// ==========================================
// 2. FAQ ACCORDION
// ==========================================
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        questionBtn.addEventListener('click', () => {
            const isOpen = item.classList.contains('active');
            
            // Close all other FAQs
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Open the clicked one if it wasn't already open
            if (!isOpen) {
                item.classList.add('active');
            }
        });
    });
}

// ==========================================
// 3. SCROLLSPY (Highlights Active Nav Link)
// ==========================================
function initScrollSpy() {
    const sections = document.querySelectorAll('.section-spy');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            // Activate when the section is within 150px of the top
            if (scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ==========================================
// 4. FULL-PAGE SMOOTH SCROLLER (Desktop Only)
// ==========================================
function initSmoothScroller() {
    const sections = document.querySelectorAll('header#home, section.section-spy, footer');
    const navLinks = document.querySelectorAll('.nav-links a.nav-link');
    let currentSectionIndex = 0;
    let isScrolling = false;

    // Dynamically checks if the user is on a Desktop AND using a Mouse
    function isDesktopScreen() {
        // Disables JS scroll if screen is smaller than 1024px (Tablets/Phones) 
        // OR if the device has a touch screen.
        return window.innerWidth > 1024 && !('ontouchstart' in window) && navigator.maxTouchPoints === 0;
    }

    window.addEventListener('wheel', (e) => {
        // If on mobile/tablet, abort the JS and let the phone scroll normally!
        if (!isDesktopScreen()) return; 

        if (isScrolling) {
            e.preventDefault();
            return;
        }

        if (e.deltaY > 0) {
            if (currentSectionIndex < sections.length - 1) {
                currentSectionIndex++;
                scrollToSection(currentSectionIndex, e);
            }
        } else if (e.deltaY < 0) {
            if (currentSectionIndex > 0) {
                currentSectionIndex--;
                scrollToSection(currentSectionIndex, e);
            }
        }
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
        if (!isDesktopScreen()) return;

        if (isScrolling) {
            if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key)) {
                e.preventDefault();
            }
            return;
        }

        if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
            if (currentSectionIndex < sections.length - 1) {
                e.preventDefault();
                currentSectionIndex++;
                scrollToSection(currentSectionIndex);
            }
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            if (currentSectionIndex > 0) {
                e.preventDefault();
                currentSectionIndex--;
                scrollToSection(currentSectionIndex);
            }
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (!isDesktopScreen()) return; // Let CSS handle mobile menu clicks natively

            e.preventDefault(); 
            const targetId = link.getAttribute('href').substring(1);
            
            sections.forEach((section, index) => {
                if (section.id === targetId) {
                    currentSectionIndex = index;
                    scrollToSection(currentSectionIndex);
                }
            });
        });
    });

    // Custom Easing Animation Engine
    function smoothScrollTo(targetPosition, duration) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            
            const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        // Mathematical easing logic
        function easeInOutQuad(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    // Scroll Executor with Dynamic Speeds
    function scrollToSection(index, event) {
        isScrolling = true;
        if (event) event.preventDefault();
        
        const targetSection = sections[index];
        const targetPosition = targetSection.offsetTop;
        const currentPosition = window.pageYOffset;
        
        // Dynamic speed based on direction
        const isScrollingUp = targetPosition < currentPosition;
        const scrollDuration = isScrollingUp ? 400 : 1000; // Fast up, Smooth down

        smoothScrollTo(targetPosition, scrollDuration);

        setTimeout(() => {
            isScrolling = false;
        }, scrollDuration + 50);
    }
}