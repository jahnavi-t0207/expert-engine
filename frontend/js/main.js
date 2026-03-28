import { initViewer } from "./viewer.js";

document.addEventListener("DOMContentLoaded", () => {

const viewer = document.getElementById("viewer");
const container = document.getElementById("engineContainer");

/* ---------- LOAD 3D VIEWER ONLY IF PRESENT ---------- */

if(viewer){
    initViewer();
}

/* ---------- LOAD ENGINE CARDS ONLY IF CONTAINER EXISTS ---------- */

if(container){

    fetch("http://localhost:5000/api/engines")
    .then(res => res.json())
    .then(data => {

        data.forEach(engine => {

            const card = document.createElement("div");
            card.classList.add("engine-card");

            card.innerHTML = `
                <h3>${engine.name}</h3>
                <p><b>Cylinders:</b> ${engine.cylinders}</p>
                <p><b>Power:</b> ${engine.power}</p>
                <p><b>Efficiency:</b> ${engine.efficiency}</p>
                <button onclick="openEngine('${engine.name}')">
                    Explore
                </button>
            `;

            container.appendChild(card);

        });

    })
    .catch(err=>{
        console.log("Backend not running:", err);
    });

}

/* ---------- OPEN VIEWER ---------- */

window.openEngine = function(name){

    if(name === "V8 Engine"){
        window.location.href = "v8.html";
    } else if (name === "Inline 4 Engine" || name === "Inline 4") {
        window.location.href = "inline4.html";
    } else if (name === "Inline 6 Engine" || name === "Inline 6") {
        window.location.href = "inline6.html";
    }

};

});