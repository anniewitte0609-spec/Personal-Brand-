
const temaknapp = document.querySelector("#tema");
temaknapp.hidden = false;

function bytTema() {
    document.body.classList.toggle("morkt");
    if (document.body.classList.contains("morkt")) {
        temaknapp.textContent = "Byt till ljust läge";
    } else {
        temaknapp.textContent = "Byt till mörkt läge";
    }
}

temaknapp.addEventListener("click", bytTema);

const tillToppen = document.querySelector(".till-toppen");

if (tillToppen) {
    tillToppen.addEventListener("click", function (event) {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    });
}

// Summary hanterar mus och tangentbord. Även den öppna kortytan kan stängas.
document.querySelectorAll('#utbildning .kurs').forEach((course) => {
    course.addEventListener('click', (event) => {
        if (event.target.closest('summary, a, button, input, textarea, select')) return;
        if (window.getSelection().toString().trim()) return;
        course.open = !course.open;
        course.querySelector('summary').focus({ preventScroll: true });
    });
});

// Progressiv mobilmeny: länkarna är synliga även om JavaScript saknas.
(() => {
    const header = document.querySelector('.sidhuvud');
    const nav = header?.querySelector('nav');
    if (!nav) return;
    const mobile = window.matchMedia('(max-width: 600px)');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'menyknapp';
    toggle.innerHTML = '<span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>';
    nav.id = nav.id || 'huvudnavigation';
    toggle.setAttribute('aria-controls', nav.id);
    header.insertBefore(toggle, nav);
    let open = false;

    function setOpen(value, returnFocus = false) {
        open = mobile.matches && value;
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Stäng menyn' : 'Öppna menyn');
        nav.hidden = mobile.matches && !open;
        header.classList.toggle('meny-oppen', open);
        if (returnFocus) toggle.focus();
    }
    function syncLayout() {
        const focused = document.activeElement;
        const focusWillHide = mobile.matches ? nav.contains(focused) : focused === toggle;
        header.classList.toggle('mobilmeny-aktiv', mobile.matches);
        toggle.hidden = !mobile.matches;
        setOpen(false);
        if (focusWillHide) (mobile.matches ? toggle : nav.querySelector('a')).focus();
    }
    toggle.addEventListener('click', () => setOpen(!open));
    header.addEventListener('keydown', (event) => {
        if (open && event.key === 'Escape') {
            event.preventDefault();
            setOpen(false, true);
        }
    });
    nav.addEventListener('click', (event) => {
        const link = event.target.closest('a');
        if (!link || !mobile.matches) return;
        setOpen(false);
        const href = link.getAttribute('href');
        const target = href?.startsWith('#') ? document.getElementById(href.slice(1)) : null;
        if (target) {
            const hadTabindex = target.hasAttribute('tabindex');
            if (!hadTabindex) target.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
            if (!hadTabindex) target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
    });
    document.addEventListener('pointerdown', (event) => {
        if (open && !header.contains(event.target)) setOpen(false, nav.contains(document.activeElement));
    });
    header.addEventListener('focusout', () => {
        setTimeout(() => {
            if (open && !header.contains(document.activeElement)) setOpen(false);
        }, 0);
    });
    mobile.addEventListener('change', syncLayout);
    syncLayout();
})();
