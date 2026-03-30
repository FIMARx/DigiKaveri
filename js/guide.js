/**
 * DigiKaveri - Smart Guide Detection & Toggling
 * Handles automatic platform detection and manual switching for both PC and mobile guides.
 */

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
            if (typeof lucide !== 'undefined') lucide.createIcons();
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
            if (typeof lucide !== 'undefined') lucide.createIcons();
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
            
            // 1. Update buttons in this container
            container.querySelectorAll('.help-tab-btn').forEach(btn => btn.classList.remove('active'));
            tab.classList.add('active');
            
            // 2. Update views in this container
            container.querySelectorAll('.help-view').forEach(view => view.classList.remove('active'));
            const viewToShow = container.querySelector(`.help-view[data-view-id="${targetView}"]`);
            if (viewToShow) viewToShow.classList.add('active');
            
            if (typeof lucide !== 'undefined') lucide.createIcons();
        });
    });
});
