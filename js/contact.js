// js/contact.js

function setupForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); 
        
        const btn = form.querySelector('.btn-submit');
        const originalText = btn.innerHTML;
        
        // Prevent double submission
        btn.disabled = true; 
        
        btn.innerHTML = 'Lähetetään... <i data-lucide="loader-2" class="spin"></i>';
        btn.style.background = '#2563EB'; 
        if(typeof lucide !== 'undefined') lucide.createIcons();

        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            });

            const result = await response.json();

            if (response.status === 200) {
                btn.innerHTML = 'Viesti lähetetty! <i data-lucide="check"></i>';
                btn.style.background = '#10B981'; 
                if(typeof lucide !== 'undefined') lucide.createIcons();
                form.reset();
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false; // Restore button
                    if(typeof lucide !== 'undefined') lucide.createIcons();
                }, 4000);
            } else {
                console.error(result);
                btn.innerHTML = 'Virhe! Yritä uudelleen.';
                btn.style.background = '#EF4444'; 
                btn.disabled = false; // Restore button on error
            }
        } catch (error) {
            console.error(error);
            btn.innerHTML = 'Yhteysvirhe!';
            btn.style.background = '#EF4444';
            btn.disabled = false; // Restore button on error
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupForm('contactForm');     // Connects to the Hero section form
    setupForm('detailedForm');    // Connects to the bottom Contact section form
});