(() => {
    const form = document.querySelector('#kontaktformular');
    if (!form) return;
    const button = form.querySelector('button[type="submit"]');
    const status = form.querySelector('#formular-status');
    const originalButton = button.innerHTML;
    const endpoint = 'https://api.hsforms.com/submissions/v3/integration/submit/149565937/03ff3041-6f5e-4e1e-bebf-009c20f19135';
    let sending = false;
    button.disabled = false;

    form.addEventListener('input', (event) => {
        if (event.target.matches('input, textarea')) event.target.setCustomValidity('');
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (sending) return;
        const names = ['firstname', 'lastname', 'email', 'message'];
        for (const name of names) {
            const input = form.elements.namedItem(name);
            input.value = input.value.trim();
            input.setCustomValidity(input.value ? '' : 'Fyll i det här fältet.');
        }
        if (!form.reportValidity()) return;
        const fields = names.map(name => ({
            objectTypeId: '0-1', name, value: form.elements.namedItem(name).value
        }));
        sending = true;
        button.disabled = true;
        button.textContent = 'Skickar…';
        form.setAttribute('aria-busy', 'true');
        status.textContent = 'Ditt meddelande skickas…';
        status.dataset.state = 'pending';
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fields,
                    context: { pageUri: location.origin + location.pathname, pageName: document.title }
                }),
                signal: controller.signal
            });
            if (!response.ok) {
                const error = new Error('Submission rejected');
                error.status = response.status;
                throw error;
            }
            form.reset();
            status.dataset.state = 'success';
            status.textContent = 'Tack för ditt meddelande! Jag återkommer till dig via e-post.';
        } catch (error) {
            status.dataset.state = 'error';
            status.textContent = error.status === 429
                ? 'Det är många försök just nu. Vänta en stund och försök igen. Din text finns kvar.'
                : error.status
                    ? 'Meddelandet kunde inte skickas. Försök igen om en stund. Din text finns kvar.'
                    : 'Vi kunde inte bekräfta att meddelandet kom fram. Kontrollera din anslutning innan du försöker igen. Din text finns kvar.';
        } finally {
            clearTimeout(timeout);
            sending = false;
            button.disabled = false;
            button.innerHTML = originalButton;
            form.removeAttribute('aria-busy');
            status.focus({ preventScroll: true });
        }
    });
})();
