import * as THREE from "https://esm.sh/three";
import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";

export function initViewer() {

const viewer = document.getElementById("viewer");

/* ---------- SCENE ---------- */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0f1a);

/* ---------- CAMERA ---------- */

const camera = new THREE.PerspectiveCamera(
75,
viewer.clientWidth / viewer.clientHeight,
0.1,
1000
);

/* ---------- RENDERER ---------- */

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(viewer.clientWidth, viewer.clientHeight);
viewer.appendChild(renderer.domElement);

/* ---------- CONTROLS ---------- */

const controls = new OrbitControls(camera, renderer.domElement);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let hoveredPart = null;

const partDescriptions = {
"Piston": "Moves up and down to generate power.",
"Crankshaft": "Converts linear motion to rotation.",
"Camshaft": "Controls valve timing.",
"Valve": "Controls air and exhaust flow."
};

/* ---------- LIGHT ---------- */

scene.add(new THREE.AmbientLight(0xffffff, 1));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

/* ---------- MODEL ---------- */

let engineModel;

const loader = new GLTFLoader();

loader.load("models/v8_engine.glb", (gltf) => {

engineModel = gltf.scene;

// center model
const box = new THREE.Box3().setFromObject(engineModel);
const center = box.getCenter(new THREE.Vector3());
engineModel.position.sub(center);

scene.add(engineModel);

// set camera properly
camera.position.set(0, 3, 10);
controls.target.set(0, 0, 0);

});

/* ---------- ANIMATION ---------- */

function animate() {

requestAnimationFrame(animate);

if (engineModel) {
engineModel.rotation.y += 0.002;
}

controls.update();
renderer.render(scene, camera);

}

animate();

/* ---------- RESIZE ---------- */

window.addEventListener("resize", () => {

camera.aspect = viewer.clientWidth / viewer.clientHeight;
camera.updateProjectionMatrix();

renderer.setSize(viewer.clientWidth, viewer.clientHeight);

});

window.addEventListener("mousemove", onMouseMove);

function onMouseMove(event){

const rect = renderer.domElement.getBoundingClientRect();

mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

raycaster.setFromCamera(mouse, camera);

const intersects = raycaster.intersectObjects(scene.children, true);

if(intersects.length > 0){

const object = intersects[0].object;

/* remove old highlight */
if(hoveredPart && hoveredPart.material && hoveredPart.material.emissive){
hoveredPart.material.emissive.set(0x000000);
}

/* apply new highlight */
if(object.material && object.material.emissive){
object.material.emissive.set(0xff6600);
object.material.emissiveIntensity = 1.5;
}

hoveredPart = object;

updateInfo(object.name);

}else{

/* remove highlight when nothing hovered */
if(hoveredPart && hoveredPart.material && hoveredPart.material.emissive){
hoveredPart.material.emissive.set(0x000000);
}

hoveredPart = null;

updateInfo("None");
}

}

function updateInfo(name){

const info = document.getElementById("infoText");

if(!info) return;

if(partDescriptions[name]){
info.innerText = name + ": " + partDescriptions[name];
}else if(name !== "None"){
info.innerText = name + ": No data available";
}else{
info.innerText = "Hover over engine parts";
}

}

}

// import * as THREE from "https://esm.sh/three";
// import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";
// import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";

// export function initViewer(){

// const viewer = document.getElementById("viewer");
// if(!viewer) return;

// /* ---------- SCENE ---------- */

// const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x0b0f1a);

// /* ---------- CAMERA ---------- */

// const camera = new THREE.PerspectiveCamera(
// 75,
// viewer.clientWidth / viewer.clientHeight,
// 0.1,
// 1000
// );

// camera.position.set(0,2,8);

// /* ---------- RENDERER ---------- */

// const renderer = new THREE.WebGLRenderer({antialias:true});

// renderer.setSize(viewer.clientWidth, viewer.clientHeight);
// renderer.setPixelRatio(window.devicePixelRatio);

// viewer.appendChild(renderer.domElement);

// /* ---------- CONTROLS ---------- */

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;

// /* ---------- LIGHTING ---------- */

// const light1 = new THREE.DirectionalLight(0xffffff,1);
// light1.position.set(5,10,7);
// scene.add(light1);

// scene.add(new THREE.AmbientLight(0xffffff,0.6));
// scene.add(new THREE.HemisphereLight(0xffffff,0x444444,1));

// /* ---------- MODEL ---------- */

// let engineModel;

// const loader = new GLTFLoader();

// loader.load("models/v8_engine.glb",(gltf)=>{

// engineModel = gltf.scene;

// engineModel.scale.set(4,4,4);

// // CENTER + AUTO CAMERA
// const box = new THREE.Box3().setFromObject(engineModel);
// const size = box.getSize(new THREE.Vector3()).length();
// const center = box.getCenter(new THREE.Vector3());

// engineModel.position.sub(center);

// scene.add(engineModel);

// // better camera positioning
// camera.position.set(center.x + size/2, center.y + size/4, center.z + size/2);
// controls.target.copy(center);
// controls.update();

// });

// /* ---------- ANIMATION ---------- */

// function animate(){

// requestAnimationFrame(animate);

// if(engineModel){
// engineModel.rotation.y += 0.003;
// }

// controls.update();

// renderer.render(scene,camera);

// }

// animate();

// /* ---------- RESIZE ---------- */

// window.addEventListener("resize",()=>{

// camera.aspect = viewer.clientWidth / viewer.clientHeight;
// camera.updateProjectionMatrix();

// renderer.setSize(viewer.clientWidth, viewer.clientHeight);

// });

// }