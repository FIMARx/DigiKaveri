/**
 * Legal Pages Interactive Logic
 * Handles Scroll Progress Bar (in ToC) and ToC Scroll Spy
 */

document.addEventListener("DOMContentLoaded", () => {
    initScrollProgressBar();
    initLegalScrollSpy();
});

/**
 * Updates the width of the progress bar based on scroll position
 */
function initScrollProgressBar() {
    // Target the progress fill inside the ToC box
    const progressFill = document.querySelector(".toc-progress-fill");
    if (!progressFill) return;

    window.addEventListener("scroll", () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        progressFill.style.width = scrolled + "%";
    });
}

/**
 * Highlights the active section in the sidebar Table of Contents
 */
function initLegalScrollSpy() {
    const sections = document.querySelectorAll(".legal-section");
    const tocLinks = document.querySelectorAll(".legal-toc a");

    if (!sections.length || !tocLinks.length) return;

    // Options for regular middle-of-page scrolling
    const options = {
        root: null,
        rootMargin: "-20% 0px -60% 0px", // More balanced zone
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        // If we are at the very bottom, let the scroll event take over for the last section
        if (isAtBottom()) return;

        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                highlightLink(id);
            }
        });
    }, options);

    sections.forEach((section) => {
        observer.observe(section);
    });

    // Fallback for reaching the bottom of the page (to trigger hard-to-reach sections like #10)
    window.addEventListener("scroll", () => {
        if (isAtBottom()) {
            const lastId = sections[sections.length - 1].getAttribute("id");
            highlightLink(lastId);
        }
    });

    function highlightLink(id) {
        tocLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
                link.classList.add("active");
            }
        });
    }

    function isAtBottom() {
        return (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 20);
    }
}
