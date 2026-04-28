import { createIcons } from 'lucide';
import { ICON_SET } from './icons';

document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Guide Elements ---
    const androidCard = document.getElementById('android-card');
    const iosCard = document.getElementById('ios-card');
    const btnAndroid = document.getElementById('android-switch');
    const btnIos = document.getElementById('ios-switch');

    // --- PC Guide Elements ---
    const windowsCard = document.getElementById('windows-card-pc');
    const macCard = document.getElementById('mac-card-pc');
    const btnWindows = document.getElementById('windows-switch');
    const btnMac = document.getElementById('mac-switch');

    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);
    const isWindows = /win/.test(ua);
    const isMac = /mac/.test(ua) && !isIOS;

    // --- Show "Automatically Detected" badge only for the actual platform ---
    const showPlatformBadge = () => {
        document.querySelectorAll('.guide-detected-badge').forEach(b => b.classList.add('hidden'));

        // PC Section Badge
        let detectedPCCard = null;
        if (isWindows) detectedPCCard = windowsCard;
        else if (isMac) detectedPCCard = macCard;

        if (detectedPCCard) {
            const badge = detectedPCCard.querySelector('.guide-detected-badge');
            if (badge) badge.classList.remove('hidden');
        }

        // Mobile Section Badge
        let detectedMobileCard = null;
        if (isIOS) detectedMobileCard = iosCard;
        else if (isAndroid) detectedMobileCard = androidCard;

        if (detectedMobileCard) {
            const badge = detectedMobileCard.querySelector('.guide-detected-badge');
            if (badge) badge.classList.remove('hidden');
        }
    };
    showPlatformBadge();

    // --- Mobile Switcher Logic ---
    if (androidCard && iosCard && btnAndroid && btnIos) {
        let currentMobilePlatform = 'android';

        const updateMobileUI = (platform) => {
            if (platform === 'ios') {
                androidCard.classList.add('hidden');
                iosCard.classList.remove('hidden');
                btnIos.classList.add('active');
                btnAndroid.classList.remove('active');
            } else {
                iosCard.classList.add('hidden');
                androidCard.classList.remove('hidden');
                btnAndroid.classList.add('active');
                btnIos.classList.remove('active');
            }
            createIcons({ icons: ICON_SET });
            currentMobilePlatform = platform;
        };

        // Initial Mobile Detection
        if (isIOS) updateMobileUI('ios');
        else updateMobileUI('android');

        btnAndroid.addEventListener('click', () => {
            if (currentMobilePlatform !== 'android') {
                updateMobileUI('android');
                scrollToGuide('mobile-guide');
            }
        });

        btnIos.addEventListener('click', () => {
            if (currentMobilePlatform !== 'ios') {
                updateMobileUI('ios');
                scrollToGuide('mobile-guide');
            }
        });
    }

    // --- PC Switcher Logic ---
    if (windowsCard && macCard && btnWindows && btnMac) {
        let currentPCPlatform = 'windows';

        const updatePCUI = (platform) => {
            if (platform === 'mac') {
                windowsCard.classList.add('hidden');
                macCard.classList.remove('hidden');
                btnMac.classList.add('active');
                btnWindows.classList.remove('active');
            } else {
                macCard.classList.add('hidden');
                windowsCard.classList.remove('hidden');
                btnWindows.classList.add('active');
                btnMac.classList.remove('active');
            }
            createIcons({ icons: ICON_SET });
            currentPCPlatform = platform;
        };

        // Initial PC Detection
        if (isMac) updatePCUI('mac');
        else updatePCUI('windows');

        btnWindows.addEventListener('click', () => {
            if (currentPCPlatform !== 'windows') {
                updatePCUI('windows');
                scrollToGuide('pc-guide');
            }
        });

        btnMac.addEventListener('click', () => {
            if (currentPCPlatform !== 'mac') {
                updatePCUI('mac');
                scrollToGuide('pc-guide');
            }
        });
    }

    const scrollToGuide = (sectionId) => {
        const guideSection = document.getElementById(sectionId);
        if (guideSection && window.innerWidth < 1024) {
            guideSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // --- Detailed Help Toggle Logic (Support for multiple toggles) ---
    const helpToggles = document.querySelectorAll('.help-toggle-btn');

    helpToggles.forEach(btn => {
        const targetId = btn.getAttribute('data-target');
        const helpContent = document.getElementById(targetId);

        if (btn && helpContent) {
            btn.addEventListener('click', () => {
                const isActive = btn.classList.toggle('active');
                helpContent.classList.toggle('active');
                btn.setAttribute('aria-expanded', isActive);
                if (isActive) {
                    setTimeout(() => {
                        const rect = helpContent.getBoundingClientRect();
                        if (rect.bottom > window.innerHeight) {
                            helpContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }
                    }, 300);
                }
            });
        }
    });

    // --- Help Sub-tabs Switching logic (Video vs Manual) ---
    const subTabs = document.querySelectorAll('.help-tab-btn');
    
    subTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const container = tab.closest('.help-content-wrapper');
            const targetView = tab.getAttribute('data-view');
            
            container.querySelectorAll('.help-tab-btn').forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');
            
            container.querySelectorAll('.help-view').forEach(view => view.classList.remove('active'));
            const viewToShow = container.querySelector(`.help-view[data-view-id="${targetView}"]`);
            if (viewToShow) viewToShow.classList.add('active');
            
            createIcons({ icons: ICON_SET });
        });
    });

    // --- Smart Adaptive Guide Logic ---
    const pcGuideSection = document.getElementById('pc-guide');
    const mobileGuideSection = document.getElementById('mobile-guide');
    const smartHeaders = document.querySelectorAll('.guide-smart-header');

    if (pcGuideSection && mobileGuideSection) {
        const isMobileDevice = isIOS || isAndroid;

        if (isMobileDevice) {
            pcGuideSection.classList.add('is-collapsed');
            setTimeout(() => {
                mobileGuideSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 500);
        } else {
            mobileGuideSection.classList.add('is-collapsed');
        }

        smartHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.getAttribute('data-target');
                const section = document.getElementById(targetId);
                
                if (section && section.classList.contains('is-collapsed')) {
                    section.classList.remove('is-collapsed');
                    
                    setTimeout(() => {
                        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                    
                    createIcons({ icons: ICON_SET });
                }
            });
        });
    }

    // --- Image Zoom (Lightbox) Logic ---
    const lightbox = document.getElementById('imageLightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('img') : null;
    const lightboxClose = lightbox ? lightbox.querySelector('.lightbox-close') : null;
    const manualImages = document.querySelectorAll('.v-step-image img');

    if (lightbox && lightboxImg && manualImages.length > 0) {
        manualImages.forEach(img => {
            img.parentElement.addEventListener('click', () => {
                lightboxImg.src = img.src;
                lightboxImg.alt = img.alt;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            setTimeout(() => { lightboxImg.src = ''; }, 300);
        };

        lightbox.addEventListener('click', (e) => {
            if (e.target !== lightboxImg) {
                closeLightbox();
            }
        });

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    createIcons({ icons: ICON_SET });
});
