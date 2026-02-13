function setupForm(formId) {
    const form = document.getElementById(formId);
    
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Stop page reload
        
        const btn = form.querySelector('.btn-submit');
        const originalText = btn.innerHTML;
        
        // 1. Show "Sending" State
        btn.innerHTML = 'Lähetetään... <i data-lucide="loader-2" class="spin"></i>';
        btn.style.background = '#2563EB'; // Blue
        if(typeof lucide !== 'undefined') lucide.createIcons();

        // 2. Prepare Data
        const formData = new FormData(form);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        try {
            // 3. Send to Web3Forms API
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
                // SUCCESS
                btn.innerHTML = 'Viesti lähetetty! <i data-lucide="check"></i>';
                btn.style.background = '#10B981'; // Green
                if(typeof lucide !== 'undefined') lucide.createIcons();
                
                // Reset form
                form.reset();
                
                // Reset button after 4 seconds
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    if(typeof lucide !== 'undefined') lucide.createIcons();
                }, 4000);
            } else {
                // ERROR from API
                console.error(result);
                btn.innerHTML = 'Virhe! Yritä uudelleen.';
                btn.style.background = '#EF4444'; // Red
            }

        } catch (error) {
            // NETWORK ERROR
            console.error(error);
            btn.innerHTML = 'Yhteysvirhe!';
            btn.style.background = '#EF4444';
        }
    });
}

// Initialize both forms
setupForm('contactForm');
setupForm('detailedForm');