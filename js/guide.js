/**
 * DigiKaveri - Smart Guide Detection & Toggling
 * Handles automatic platform detection and manual switching for the mobile guide.
 */

document.addEventListener('DOMContentLoaded', () => {
    const androidCard = document.getElementById('android-card');
    const iosCard = document.getElementById('ios-card');
    const btnAndroid = document.getElementById('android-switch');
    const btnIos = document.getElementById('ios-switch');
    
    if (!androidCard || !iosCard || !btnAndroid || !btnIos) return;

    // Detect platform
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);
    const isAndroid = /android/.test(ua);

    let currentPlatform = 'android';

    const updateUI = (platform) => {
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
        
        // Refresh icons if lucide is available
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        currentPlatform = platform;
    };

    // Initial Detection
    if (isIOS) {
        updateUI('ios');
    } else if (isAndroid) {
        updateUI('android');
    } else {
        // Desktop or other: default to Android
        updateUI('android');
    }

    // Manual Click Handlers
    btnAndroid.addEventListener('click', () => {
        if (currentPlatform !== 'android') {
            updateUI('android');
            scrollToGuide();
        }
    });

    btnIos.addEventListener('click', () => {
        if (currentPlatform !== 'ios') {
            updateUI('ios');
            scrollToGuide();
        }
    });

    const scrollToGuide = () => {
        const guideSection = document.getElementById('mobile-guide');
        if (guideSection && window.innerWidth < 1024) {
            guideSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
});
