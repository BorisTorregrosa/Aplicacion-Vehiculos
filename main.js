// ============================================================
// MATERIALES DE CARROCERÍA — agrega "model" para base_basic_pbr.glb
// ============================================================
const BODY_MATERIALS = [
    "x3_bd01", "x3_bd02", "x3_bd02.001",
    "x3_bd03", "x3_bd03.001",
    "x3_bd04", "x3_bd04.001", "x3_bd04.002",
    "x3_bd05", "x3_bd06",
    "x3_null_PRIMARY",
    "vehicle_paint1_SECONDARY", "vehicle_paint1_SECONDARY.001",
    "vehicle_paint1_INTERIOR_TRIM",
    // ── base_basic_pbr.glb ──
    "model",
    // ── Lamborghini Centenario (scene.gltf) ──
    "untitledLamborghini_CentenarioRoadsterAdPersonam_2017Paint_Material1",
    "untitledLamborghini_CentenarioRoadsterAdPersonam_2017Coloured_Material1",
    // ── BMW Z8 (scene.gltf) ──
    "Skin_Base",
    "material"
];

const PRESETS = [
    { hex: "#C0392B", name: "ROSSO" },
    { hex: "#1A1A2E", name: "NERO" },
    { hex: "#F5F5F0", name: "BIANCO" },
    { hex: "#1B4F72", name: "AZZURRO" },
    { hex: "#1E8449", name: "VERDE" },
    { hex: "#F39C12", name: "ORO" },
    { hex: "#717D7E", name: "GRIGIO" },
    { hex: "#6C3483", name: "VIOLA" },
    { hex: "#E8D5B7", name: "SABBIA" },
    { hex: "#0000FF", name: "BLU" },
];

let currentColor    = [0, 0, 1, 1];
let currentRoughness = 0.1;
let currentMetallic  = 1;
let swatchActivo = 9;

const viewer = document.querySelector("#car");

function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return [r, g, b, 1];
}

// ── Smooth transition ──
let animFrom = [0, 0, 1, 1];
let animTo   = [0, 0, 1, 1];
let animFromRoughness = 0.1, animToRoughness = 0.1;
let animFromMetallic  = 1,   animToMetallic  = 1;
let animStart = null;
let animFrame = null;
const ANIM_DURATION = 600;

function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }

function applyColorRaw(color, roughness, metallic) {
    viewer.model?.materials.forEach(mat => {
        if (BODY_MATERIALS.includes(mat.name)) {
            mat.pbrMetallicRoughness.setBaseColorFactor(color);
            mat.pbrMetallicRoughness.setMetallicFactor(metallic);
            mat.pbrMetallicRoughness.setRoughnessFactor(roughness);
        }
    });
}

function animateColor(toColor, toRoughness, toMetallic) {
    if (animFrame) cancelAnimationFrame(animFrame);
    animFrom = [...currentColor];
    animFromRoughness = currentRoughness;
    animFromMetallic  = currentMetallic;
    animTo = toColor;
    animToRoughness = toRoughness;
    animToMetallic  = toMetallic;
    animStart = null;

    function step(ts) {
        if (!animStart) animStart = ts;
        const raw = Math.min((ts - animStart) / ANIM_DURATION, 1);
        const t   = easeInOut(raw);
        const interp = [
            lerp(animFrom[0], animTo[0], t),
            lerp(animFrom[1], animTo[1], t),
            lerp(animFrom[2], animTo[2], t),
            1
        ];
        applyColorRaw(
            interp,
            lerp(animFromRoughness, animToRoughness, t),
            lerp(animFromMetallic,  animToMetallic,  t)
        );
        if (raw < 1) {
            animFrame = requestAnimationFrame(step);
        } else {
            currentColor     = [...animTo];
            currentRoughness = animToRoughness;
            currentMetallic  = animToMetallic;
            animFrame = null;
        }
    }
    animFrame = requestAnimationFrame(step);
}

function applyColor() {
    animateColor(currentColor, currentRoughness, currentMetallic);
}

function actualizarSwatchFocus() {
    document.querySelectorAll(".swatch").forEach(s => s.classList.remove("focusSwatch"));
    document.querySelectorAll(".swatch")[swatchActivo]?.classList.add("focusSwatch");
}

// ── Build swatches ──
const swatchContainer = document.getElementById("swatches");
PRESETS.forEach((preset, i) => {
    const btn = document.createElement("button");
    btn.className = "swatch" + (i === 9 ? " active" : "");
    btn.style.setProperty("--swatch-color", preset.hex);
    btn.title = preset.name;
    btn.setAttribute("data-hex", preset.hex);
    btn.setAttribute("aria-label", preset.name);

    const inner = document.createElement("span");
    inner.className = "swatch-inner";
    btn.appendChild(inner);

    const label = document.createElement("span");
    label.className = "swatch-name";
    label.textContent = preset.name;
    btn.appendChild(label);

    btn.addEventListener("click", () => {
        document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
        btn.classList.add("active");
        const target = hexToRgb(preset.hex);
        animateColor(target, currentRoughness, currentMetallic);
        currentColor = target;
    });

    swatchContainer.appendChild(btn);
});



// ── Wheel materials (se guardan para no sobreescribirlos) ──
const WHEEL_MATERIALS = [
    "wb-d", "wb-d.001",
    "wb_tire", "wb_tire.001",
    "wb_black00", "wb_black00.001", "wb_black00.002", "wb_black00.003", "wb_black00.004", "wb_black00.005",
    "black", "black.001", "black.002", "black.003",
    "vehicle_generic_smallspecmap_WHEEL", "vehicle_generic_smallspecmap_WHEEL.001",
    "Rotiform_logo_wb", "Rotiform_logo_wb.001",
    "kb43-2_WHEEL", "kb43-2_WHEEL.001",
    "gomma_base2", "gomma_base2.001"
];

const wheelSnapshot = new Map();

// ── Initial load ──
viewer.addEventListener("load", () => {
    // Guardar ruedas originales (solo aplica a modelos con ruedas separadas)
    wheelSnapshot.clear();
    viewer.model.materials.forEach(mat => {
        if (WHEEL_MATERIALS.includes(mat.name)) {
            const pbr = mat.pbrMetallicRoughness;
            wheelSnapshot.set(mat.name, {
                color:    [...pbr.baseColorFactor],
                metallic: pbr.metallicFactor,
                roughness: pbr.roughnessFactor,
            });
        }
    });

    // Aplicar color actual de carrocería
    applyColor();

    // Restaurar ruedas
    viewer.model.materials.forEach(mat => {
        if (WHEEL_MATERIALS.includes(mat.name)) {
            const snap = wheelSnapshot.get(mat.name);
            if (snap) {
                mat.pbrMetallicRoughness.setBaseColorFactor(snap.color);
                mat.pbrMetallicRoughness.setMetallicFactor(snap.metallic);
                mat.pbrMetallicRoughness.setRoughnessFactor(snap.roughness);
            }
        }
    });
});

// ── Cambio de categoría (click en botón de categoría) ──
document.querySelectorAll(".categoria-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const newSrc = btn.dataset.model;
        if (!newSrc) return;

        // Cambiar el modelo en el viewer
        viewer.src = newSrc;
        window.distancia = 8; 

        // Marcar activo visualmente
        document.querySelectorAll(".categoria-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // El evento "load" se dispara solo y aplica currentColor automáticamente
    });
});