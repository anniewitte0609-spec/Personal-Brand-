
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
        window.scrollTo({ top: 0, behavior: "smooth" });
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
