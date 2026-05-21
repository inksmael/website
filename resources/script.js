const SOURDOUGH_BASE_RECIPE = {
    totalFlour: 500,
    strongFlour: 400,
    wholeFlour: 100,
    starter: 200,
    water: 375,
    salt: 10
};

document.addEventListener("DOMContentLoaded", () => {
    initLazyImages();
    initSourdoughRecipe();
});

function initLazyImages() {
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
}

function initSourdoughRecipe() {
    const sourdoughControls = document.getElementById("weightControls");

    if (!sourdoughControls) {
        return;
    }

    const elements = {
        strongFlour: document.getElementById("strongFlour"),
        wholeFlour: document.getElementById("wholeFlour"),
        starter: document.getElementById("starter"),
        water: document.getElementById("water"),
        salt: document.getElementById("salt"),
        buttons: sourdoughControls.querySelectorAll("[data-flour]")
    };

    const requiredElements = [
        elements.strongFlour,
        elements.wholeFlour,
        elements.starter,
        elements.water,
        elements.salt
    ];

    if (requiredElements.some(element => !element)) {
        return;
    }

    elements.buttons.forEach(button => {
        button.addEventListener("click", () => {
            updateSourdoughRecipe(elements, Number(button.dataset.flour));
        });
    });

    updateSourdoughRecipe(elements, SOURDOUGH_BASE_RECIPE.totalFlour);
}

function updateSourdoughRecipe(elements, totalFlour) {
    const scale = totalFlour / SOURDOUGH_BASE_RECIPE.totalFlour;

    elements.strongFlour.textContent = formatGrams(SOURDOUGH_BASE_RECIPE.strongFlour * scale);
    elements.wholeFlour.textContent = formatGrams(SOURDOUGH_BASE_RECIPE.wholeFlour * scale);
    elements.starter.textContent = formatGrams(SOURDOUGH_BASE_RECIPE.starter * scale);
    elements.water.textContent = formatGrams(SOURDOUGH_BASE_RECIPE.water * scale);
    elements.salt.textContent = formatGrams(SOURDOUGH_BASE_RECIPE.salt * scale);

    elements.buttons.forEach(button => {
        const isActive = Number(button.dataset.flour) === totalFlour;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", String(isActive));
    });
}

function formatGrams(value) {
    return `${Math.round(value)} g`;
}
