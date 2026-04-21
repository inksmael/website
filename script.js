document.addEventListener('DOMContentLoaded', function () {
    const button = document.querySelector('.menu-toggle--shared');

    if (!button) {
        return;
    }

    const navId = button.getAttribute('aria-controls');
    const nav = navId ? document.getElementById(navId) : null;
    const mobileMedia = window.matchMedia('(max-width: 600px)');

    if (!nav) {
        return;
    }

    function setMenuState(isOpen) {
        nav.hidden = !isOpen;
        button.setAttribute('aria-expanded', String(isOpen));
        button.setAttribute('aria-label', isOpen ? 'Cerrar menu' : 'Abrir menu');
    }

    function syncMenuState() {
        if (mobileMedia.matches) {
            setMenuState(button.getAttribute('aria-expanded') === 'true');
        } else {
            nav.hidden = false;
            button.setAttribute('aria-expanded', 'false');
            button.setAttribute('aria-label', 'Abrir menu');
        }
    }

    button.addEventListener('click', function () {
        if (!mobileMedia.matches) {
            return;
        }

        const isOpen = button.getAttribute('aria-expanded') !== 'true';
        setMenuState(isOpen);
    });

    syncMenuState();
    mobileMedia.addEventListener('change', syncMenuState);
});

document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll("img.lazy");

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove("lazy");
                    obs.unobserve(img);
                }
            });
        }, {
            rootMargin: "0px",
            threshold: 0
        });

        lazyImages.forEach(img => observer.observe(img));
    } else {
        // Fallback for very old browsers: load all images immediately
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove("lazy");
        });
    }
});
