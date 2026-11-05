/**
 * Calculadora del panadero - Vanilla JavaScript ES2020+
 * Mount: <div id="calculadora-panadero"></div> + CSS + this script (defer).
 * All flour and water in the starter count toward the recipe totals.
 */
(() => {
    "use strict";

    const root = document.getElementById("calculadora-panadero");

    if (!root) {
        return;
    }

    const state = {
        tab: "recipe",
        flour: "1000",
        hydration: 70,
        salt: "2",
        yeast: "1",
        yeastType: "fresh",
        starter: "0",
        starterHydration: "100",
        flourTemp: "22",
        roomTemp: "22",
        targetTemp: "24",
        friction: "0",
        flourA: "Trigo panificable",
        flourB: "Harina integral",
        blend: 70
    };

    const panels = [
        { id: "recipe", label: "Receta y porcentajes" },
        { id: "starter", label: "Calculadora de masa madre" },
        { id: "temperature", label: "Temperatura del agua" },
        { id: "yeast", label: "Conversor de levaduras" },
        { id: "flours", label: "Mezcla de harinas" }
    ];

    const fmt = value => Number.isFinite(value)
        ? value.toLocaleString("es-ES", { maximumFractionDigits: 2 }) : "—";

    const esc = value => String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
    })[c]);

    const number = value => value.trim() === "" ? NaN : Number(value);

    const field = (key, label, options = {}) => `
        <div class="pb-field"><label for="pb-${key}">${esc(label)}</label>
        <input id="pb-${key}" data-field="${key}" type="${options.type || "number"}"
            ${options.type === "text" ? "" : "step=\"any\" inputmode=\"decimal\""}
            value="${esc(state[key])}"></div>`;

    const table = (headings, rows) => `<table><thead><tr>${headings.map(x => `<th scope="col">${esc(x)}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;

    const errorMarkup = valid => valid ? "" : "<p class=\"pb-error\" role=\"alert\">Revisa los valores: la harina debe ser mayor que cero, los porcentajes no negativos y la masa madre no puede aportar más harina o agua que la receta.</p>";

    function calculate() {
        const f = number(state.flour);
        const s = number(state.salt);
        const y = number(state.yeast);
        const st = number(state.starter);
        const sh = number(state.starterHydration);
        const sf = st / (1 + sh / 100);
        const sw = st - sf;
        const water = f * state.hydration / 100;
        const saltG = f * s / 100;
        const yeastG = f * y / 100;
        const remainingFlour = f - sf;
        const remainingWater = water - sw;
        const valid = [f, s, y, st, sh].every(Number.isFinite) &&
            f > 0 && s >= 0 && y >= 0 && st >= 0 && sh >= 0 &&
            remainingFlour >= -1e-9 && remainingWater >= -1e-9;

        return {
            f,
            s,
            y,
            st,
            sh,
            sf,
            sw,
            water,
            saltG,
            yeastG,
            remainingFlour,
            remainingWater,
            total: f + water + saltG + yeastG,
            valid
        };
    }

    function renderRecipe(c) {
        return `<h2>Receta y porcentajes</h2>
            ${table(["Ingrediente", "Porcentaje", "Cantidad"], [
                ["Harina", "100 %", c.valid ? `${fmt(c.f)} g` : "—"],
                ["Agua", `${fmt(state.hydration)} %`, c.valid ? `${fmt(c.water)} g` : "—"],
                ["Sal", `${fmt(c.s)} %`, c.valid ? `${fmt(c.saltG)} g` : "—"],
                ["Levadura", `${fmt(c.y)} %`, c.valid ? `${fmt(c.yeastG)} g` : "—"]
            ])}
            <p class="pb-total">Peso total: ${c.valid ? `${fmt(c.total)} g` : "—"}</p>
            ${c.st > 0 && c.valid ? `<h3>Ingredientes para el amasado final</h3>
            ${table(["Ingrediente", "Cantidad"], [
                ["Harina por añadir", `${fmt(c.remainingFlour)} g`],
                ["Agua por añadir", `${fmt(c.remainingWater)} g`],
                ["Sal", `${fmt(c.saltG)} g`],
                ["Levadura", `${fmt(c.yeastG)} g`],
                ["Masa madre", `${fmt(c.st)} g`]
            ])}` : ""}
            <div class="pb-actions"><button class="pb-primary" data-action="copy" ${c.valid ? "" : "disabled"}>Copiar receta</button></div>`;
    }

    function renderStarter(c) {
        return `<h2>Calculadora de masa madre</h2>
            <div class="pb-fields">${field("starter", "Masa madre (g)")}${field("starterHydration", "Hidratación de la masa madre (%)")}</div>
            <div class="pb-radio pb-section" role="group" aria-label="Hidrataciones habituales">
                ${[50, 80, 100, 125].map(n => `<button data-starter-hyd="${n}" aria-pressed="${c.sh === n}">${n} %</button>`).join("")}
            </div>
            ${table(["Concepto", "Cantidad"], [
                ["Harina aportada por la masa madre", c.valid ? `${fmt(c.sf)} g` : "—"],
                ["Agua aportada por la masa madre", c.valid ? `${fmt(c.sw)} g` : "—"],
                ["Harina pendiente de añadir", c.valid ? `${fmt(c.remainingFlour)} g` : "—"],
                ["Agua pendiente de añadir", c.valid ? `${fmt(c.remainingWater)} g` : "—"]
            ])}
            <p class="pb-muted">La masa madre se incluye dentro de la harina y el agua totales. No se suma dos veces.</p>`;
    }

    function renderTemperature() {
        const values = ["flourTemp", "roomTemp", "targetTemp", "friction"].map(key => number(state[key]));
        const valid = values.every(Number.isFinite);
        const result = 3 * values[2] - values[0] - values[1] - values[3];

        return `<h2>Temperatura del agua</h2>
            <div class="pb-fields">
                ${field("flourTemp", "Temperatura de la harina (°C)")}
                ${field("roomTemp", "Temperatura del obrador (°C)")}
                ${field("targetTemp", "Temperatura final deseada (°C)")}
                ${field("friction", "Factor de fricción (°C)")}
            </div>
            ${valid ? "" : "<p class=\"pb-error\" role=\"alert\">Introduce un valor numérico en todas las temperaturas.</p>"}
            <div class="pb-soft pb-section"><span class="pb-muted">Temperatura del agua calculada</span>
                <p class="pb-total" aria-live="polite">${valid ? `${fmt(result)} °C` : "—"}</p></div>
            <p class="pb-muted">Factor de fricción predeterminado: 0 °C. Fórmula orientativa: 3 × temperatura final deseada − temperatura de la harina − temperatura del obrador − factor de fricción. Calibrar con el equipo real; los prefermentos también afectan la temperatura final.</p>`;
    }

    function renderYeast(c) {
        const fresh = state.yeastType === "fresh" ? c.yeastG : c.yeastG * 3;
        const instant = fresh / 3;

        return `<h2>Conversor de levaduras</h2>
            <p class="pb-muted">Equivalencias aproximadas para la cantidad de levadura de la receta.</p>
            ${table(["Tipo de levadura", "Cantidad"], [
                ["Fresca", c.valid ? `${fmt(fresh)} g` : "—"],
                ["Seca instantánea", c.valid ? `${fmt(instant)} g` : "—"],
                ["Seca activa", c.valid ? `${fmt(instant * 1.25)} g` : "—"]
            ])}
            <p class="pb-muted">Equivalencia: 3 g de fresca ≈ 1 g de instantánea ≈ 1,25 g de seca activa.</p>`;
    }

    function renderFlours(c) {
        return `<h2>Mezcla de harinas</h2>
            <div class="pb-fields">${field("flourA", "Primera harina", { type: "text" })}${field("flourB", "Segunda harina", { type: "text" })}</div>
            <div class="pb-section"><label for="pb-blend">Proporción de la primera harina</label>
                <div class="pb-range-line"><input id="pb-blend" data-field="blend" type="range" min="0" max="100" step="1" value="${state.blend}">
                    <output for="pb-blend">${state.blend} %</output></div></div>
            ${table(["Harina", "Porcentaje", "Cantidad"], [
                [state.flourA || "Harina 1", `${state.blend} %`, c.valid ? `${fmt(c.f * state.blend / 100)} g` : "—"],
                [state.flourB || "Harina 2", `${100 - state.blend} %`, c.valid ? `${fmt(c.f * (100 - state.blend) / 100)} g` : "—"]
            ])}
            <p class="pb-muted">La mezcla distribuye la harina total, incluida la harina aportada por la masa madre. Ajusta la hidratación según la absorción de cada harina.</p>`;
    }

    function renderPanel(c) {
        switch (state.tab) {
            case "starter":
                return renderStarter(c);
            case "temperature":
                return renderTemperature();
            case "yeast":
                return renderYeast(c);
            case "flours":
                return renderFlours(c);
            default:
                return renderRecipe(c);
        }
    }

    function render(focusKey) {
        const c = calculate();
        const focus = focusKey ? { start: null, end: null } : null;
        const current = focusKey ? root.querySelector(`[data-field="${focusKey}"]`) : null;

        if (current && typeof current.selectionStart === "number" && current.type !== "number") {
            focus.start = current.selectionStart;
            focus.end = current.selectionEnd;
        }

        root.innerHTML = `<div class="pb-panel">
            <section class="pb-soft pb-section" aria-label="Datos generales de la receta">
                <h2>Datos de la receta</h2>
                <div class="pb-fields">
                    ${field("flour", "Harina total (g)")}
                    <div class="pb-field">
                        <label id="pb-hydration-label" for="pb-hydration">Hidratación</label>
                        <div class="pb-hydration-control">
                            <input id="pb-hydration" data-field="hydration" type="range" min="40" max="110" step="1" value="${state.hydration}" aria-describedby="pb-hydration-unit">
                            <div class="pb-percentage">
                                <input id="pb-hydration-value" data-field="hydrationValue" type="number" min="40" max="110" step="1" required value="${state.hydration}" aria-labelledby="pb-hydration-label" aria-describedby="pb-hydration-unit">
                                <span id="pb-hydration-unit">%</span>
                            </div>
                        </div>
                    </div>
                    ${field("salt", "Sal (%)")}${field("yeast", "Levadura (%)")}
                </div>
                <div class="pb-section"><span class="pb-label">Tipo de levadura</span>
                    <div class="pb-radio" role="group" aria-label="Tipo de levadura">
                        <button data-yeast-type="fresh" aria-pressed="${state.yeastType === "fresh"}">Fresca</button>
                        <button data-yeast-type="instant" aria-pressed="${state.yeastType === "instant"}">Seca instantánea</button>
                    </div></div>
            </section>
            ${errorMarkup(c.valid)}
            <div class="pb-metrics">
                <div class="pb-metric"><span class="pb-muted">Agua total</span><strong>${c.valid ? `${fmt(c.water)} g` : "—"}</strong></div>
                <div class="pb-metric"><span class="pb-muted">Peso de la masa</span><strong>${c.valid ? `${fmt(c.total)} g` : "—"}</strong></div>
            </div>
            <section class="pb-section"><label for="pb-select">Calculadora</label>
                <select id="pb-select" data-field="tab">${panels.map(p => `<option value="${p.id}" ${state.tab === p.id ? "selected" : ""}>${esc(p.label)}</option>`).join("")}</select></section>
            <section class="pb-section" aria-label="Resultado de la calculadora">${renderPanel(c)}</section>
        </div>`;

        if (current) {
            const next = root.querySelector(`[data-field="${focusKey}"]`);
            next?.focus({ preventScroll: true });

            if (focus && focus.start !== null && next?.setSelectionRange) {
                try {
                    next.setSelectionRange(focus.start, focus.end);
                } catch (_) {
                    /* number input */
                }
            }
        }
    }

    root.addEventListener("input", event => {
        const input = event.target;

        if (!["hydration", "blend"].includes(input.dataset.field)) {
            return;
        }

        // Preview the slider value without committing it to the recipe.
        if (input.dataset.field === "hydration") {
            root.querySelector("#pb-hydration-value").value = input.value;
            return;
        }

        const output = root.querySelector(`output[for="${input.id}"]`);

        if (output) {
            output.textContent = `${input.value} %`;
        }
    });

    root.addEventListener("change", event => {
        const input = event.target;
        const key = input.dataset.field === "hydrationValue" ? "hydration" : input.dataset.field;

        if (!key) {
            return;
        }

        if (input.dataset.field === "hydrationValue" && !input.reportValidity()) {
            return;
        }

        state[key] = key === "hydration" || key === "blend" ? Number(input.value) : input.value;

        // Text and number inputs commit on blur; do not return focus to them.
        render(key === "tab" || input.type === "range" ? key : null);
    });

    root.addEventListener("click", async event => {
        const yeastButton = event.target.closest("[data-yeast-type]");

        if (yeastButton) {
            const type = yeastButton.dataset.yeastType;

            if (type !== state.yeastType) {
                const old = number(state.yeast);

                if (Number.isFinite(old) && old >= 0) {
                    state.yeast = String(old * (type === "instant" ? 1 / 3 : 3));
                }

                state.yeastType = type;
                render();
                root.querySelector(`[data-yeast-type="${type}"]`)?.focus({ preventScroll: true });
            }

            return;
        }

        const starterButton = event.target.closest("[data-starter-hyd]");

        if (starterButton) {
            state.starterHydration = starterButton.dataset.starterHyd;
            render();
            root.querySelector(`[data-starter-hyd="${state.starterHydration}"]`)?.focus({ preventScroll: true });
            return;
        }

        if (event.target.closest("[data-action=\"copy\"]")) {
            const c = calculate();

            if (!c.valid) {
                return;
            }

            const text = [
                "RECETA DEL PANADERO",
                `Harina total: ${fmt(c.f)} g (100 %)`,
                `Agua total: ${fmt(c.water)} g (${fmt(state.hydration)} %)`,
                `Sal: ${fmt(c.saltG)} g (${fmt(c.s)} %)`,
                `Levadura ${state.yeastType === "fresh" ? "fresca" : "seca instantánea"}: ${fmt(c.yeastG)} g (${fmt(c.y)} %)`,
                `Masa madre: ${fmt(c.st)} g (${fmt(c.sh)} % hidratación)`,
                `Harina por añadir: ${fmt(c.remainingFlour)} g`,
                `Agua por añadir: ${fmt(c.remainingWater)} g`,
                `Peso total de masa: ${fmt(c.total)} g`
            ].join("\n");

            try {
                await navigator.clipboard.writeText(text);
                const btn = root.querySelector("[data-action=\"copy\"]");

                if (btn) {
                    btn.textContent = "Copiado";
                }
            } catch (_) {
                // Clipboard API requires HTTPS or localhost and clipboard permissions.
                window.prompt("Copia la receta:", text);
            }
        }
    });

    render();
})();
