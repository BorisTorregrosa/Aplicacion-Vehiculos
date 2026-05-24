console.log("APP FUNCIONANDO");

// conexión websocket
const socket = new WebSocket("wss://aplicacion-vehiculos.onrender.com");

// =====================
// MODOS
// =====================
let modo = "navegacion";
let submodoPaint = "swatches";

// =====================
// NAVEGACION
// =====================
let panelActivo = 1;
let categoriaActiva = 0;

// =====================
// JOYSTICK
// =====================
let joystickBloqueado = false;

// =====================
// MODELO 3D
// =====================
const modelo = document.getElementById("car");

let rotacion = 0;
let inclinacion = 75;
window.distancia = 8;

// =====================
// PANELES
// =====================
const panels = [

    document.querySelector(".categorias-vehiculos"),
    document.querySelector(".cuadro-model"),
    document.querySelector(".panel")

];

function actualizarPanelFocus(){

    panels.forEach(panel => {

        panel.classList.remove("focusPanel");

    });

    panels[panelActivo]
    ?.classList.add("focusPanel");

}

function actualizarPaintFocus(){

    const swatchesBox = document.querySelector(".swatches");
    const finishBox = document.querySelector(".finish-row");

    swatchesBox?.classList.remove("focusPaint");
    finishBox?.classList.remove("focusPaint");

    if(submodoPaint == "swatches"){

        swatchesBox?.classList.add("focusPaint");

    }

    else if(submodoPaint == "finish"){

        finishBox?.classList.add("focusPaint");

    }

}

// =====================
// HUD DE MODO
// =====================
const hudModo = document.createElement("div");
hudModo.id = "hud-modo";
hudModo.style.cssText = `
    position: fixed;
    bottom: 28px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(10,10,12,0.92);
    border: 1px solid rgba(230,57,70,0.4);
    border-radius: 2px;
    padding: 8px 24px;
    font-family: 'Share Tech Mono', monospace;
    font-size: 12px;
    letter-spacing: 0.3em;
    color: #E63946;
    z-index: 100;
    text-transform: uppercase;
    backdrop-filter: blur(12px);
    box-shadow: 0 0 20px rgba(230,57,70,0.2);
    transition: all 0.3s;
`;
document.body.appendChild(hudModo);

function actualizarHUD() {
    const modos = {
        "navegacion": "◀ ▶  SELECCIONAR PANEL",
        "modelo":     "JOYSTICK — ROTAR  |  AC/AJ — ZOOM  |  Y — VOLVER",
        "categorias": "▲ ▼  CATEGORIA  |  A — SELECCIONAR  |  Y — VOLVER",
        "paint":      "◀ ▶  COLOR  |  A — APLICAR  |  Y — VOLVER",
    };
    hudModo.textContent = modos[modo] || modo.toUpperCase();
}



socket.onopen = () => {
    console.log("CONECTADO");
    actualizarHUD();
};

socket.onmessage = (event) => {

    console.log(event.data);

    const data = JSON.parse(event.data);

    // =========================
    // BOTONES
    // =========================
    if(data.button){

        console.log("Botón:", data.button);

        joystickBloqueado = true;

        setTimeout(() => {

            joystickBloqueado = false;

        }, 250);

        // BOTON A
        if(data.button == "A"){

            // entrar panel
            if(modo == "navegacion"){

                if(panelActivo == 0){

                    modo = "categorias";

                }

                else if(panelActivo == 1){

                    modo = "modelo";

                }

                else if(panelActivo == 2){

                    modo = "paint";

                }

                console.log("Modo:", modo);
                actualizarHUD();

            }

            // aplicar color
            else if(
                modo == "paint"
                &&
                submodoPaint == "swatches"
            ){

                document
                .querySelectorAll(".swatch")
                [swatchActivo]
                ?.click();

            }

            // seleccionar categoria
            else if(modo == "categorias"){

                document
                .querySelectorAll(".categoria-btn")
                [categoriaActiva]
                ?.click();

            }

        }

        // BOTON Y = volver
        if(data.button == "Y"){

            modo = "navegacion";
            submodoPaint = "swatches";
            console.log("Volviendo");
            actualizarHUD();
            actualizarPanelFocus();

        }

        if(data.button == "AC" && modo == "modelo") {
                window.distancia -= 0.5;
                if(window.distancia < 2) window.distancia = 2;
                modelo.setAttribute("camera-orbit", `${rotacion}deg ${inclinacion}deg ${window.distancia}m`);
                console.log("AC presionado, distancia:", window.distancia);
            }

            if(data.button == "AJ" && modo == "modelo") {
                window.distancia += 0.5;
                if(window.distancia > 20) window.distancia = 20;
                modelo.setAttribute("camera-orbit", `${rotacion}deg ${inclinacion}deg ${window.distancia}m`);
                console.log("AJ presionado, distancia:", window.distancia);
            }

        return;

    }

    if(joystickBloqueado){

        return;

    }

    console.log("modo:", modo, "submodo:", submodoPaint);

    // =========================
    // NAVEGACION GENERAL
    // =========================
    if(modo == "navegacion"){

        if(data.x >= 4095){

            panelActivo++;

            joystickBloqueado = true;

            setTimeout(() => {

                joystickBloqueado = false;

            }, 200);

        }

        if(data.x <= 0){

            panelActivo--;

            joystickBloqueado = true;

            setTimeout(() => {

                joystickBloqueado = false;

            }, 200);

        }

        if(panelActivo < 0){

            panelActivo = 0;

        }

        if(panelActivo > panels.length - 1){

            panelActivo = panels.length - 1;

        }

        actualizarPanelFocus();

        return;

    }

    // =========================
    // CATEGORIAS
    // =========================
    if(modo == "categorias"){

        const categorias =
        document.querySelectorAll(".categoria-btn");

        if(data.y > 2400){

            categoriaActiva++;

            joystickBloqueado = true;

            setTimeout(() => {

                joystickBloqueado = false;

            }, 200);

        }

        if(data.y < 1600){

            categoriaActiva--;

            joystickBloqueado = true;

            setTimeout(() => {

                joystickBloqueado = false;

            }, 200);

        }

        if(categoriaActiva < 0){

            categoriaActiva = 0;

        }

        if(categoriaActiva > categorias.length - 1){

            categoriaActiva = categorias.length - 1;

        }

        categorias.forEach(c => {

            c.classList.remove("focusCategoria");

        });

        categorias[categoriaActiva]
        ?.classList.add("focusCategoria");

        return;

    }

    // =========================
    // MODELO
    // =========================
    if(modo == "modelo"){

        if(!(data.x > 1600 && data.x < 2200)){

            if(data.x > 2200){

                rotacion += 2;

            }

            if(data.x < 1600){

                rotacion -= 2;

            }

        }

        if(!(data.y > 1600 && data.y < 2200)){

            if(data.y > 2200){

                inclinacion -= 1;

            }

            if(data.y < 1600){

                inclinacion += 1;

            }

        }

        if(inclinacion < 20){

            inclinacion = 20;

        }

        if(inclinacion > 120){

            inclinacion = 120;

        }



        modelo.setAttribute("camera-orbit", `${rotacion}deg ${inclinacion}deg ${window.distancia}m`);

        return;

    }

    // =========================
    // PAINT
    // =========================
    if(modo == "paint"){


        // ===================
        // SWATCHES
        // ===================
        const swatches =
        document.querySelectorAll(".swatch");

        if(submodoPaint == "swatches"){

            if(data.x > 2400){

                swatchActivo++;

                joystickBloqueado = true;

                setTimeout(() => {

                    joystickBloqueado = false;

                }, 200);

            }

            if(data.x < 1600){

                swatchActivo--;

                joystickBloqueado = true;

                setTimeout(() => {

                    joystickBloqueado = false;

                }, 200);

            }

            if(swatchActivo < 0){

                swatchActivo = 0;

            }

            if(swatchActivo > swatches.length - 1){

                swatchActivo = swatches.length - 1;

            }

            actualizarSwatchFocus();

        }

        return;

    }

};
