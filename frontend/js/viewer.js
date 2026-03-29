import * as THREE from "https://esm.sh/three";
import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";

/* ---------- PART DATABASE ---------- */
const PART_DATA = {
  "Intake Manifold": {
    name: "Intake Manifold",
    desc: "The 'Lungs' of the engine. Distributes air evenly to every cylinder to begin the combustion cycle.",
    meshKeywords: ["intake", "manifold", "plenum", "induction", "throttle"]
  },
  "Fuel Rail + Injectors": {
    name: "Fuel Rail & Injectors",
    desc: "Supplies high-pressure fuel directly into the intake stream. Precision timing ensures maximum fuel atomization.",
    meshKeywords: ["fuel", "rail", "injector", "nozzle", "injection"]
  },
  "Cylinder Head": {
    name: "Cylinder Head",
    desc: "Houses the vital valvetrain assembly. Capping the cylinders, it withstands extreme pressure and heat.",
    meshKeywords: ["head", "rocker", "valve_cover", "cam_box"]
  },
  "Camshaft": {
    name: "Camshaft",
    desc: "The 'Conductor' of the engine. Rotates lobes that precisely open and close the intake and exhaust valves.",
    meshKeywords: ["cam", "camshaft", "shaft_cam", "lobe"]
  },
  "Valves": {
    name: "Engine Valves",
    desc: "Gatekeepers of the combustion chamber. They open in milliseconds to allow air in and exhaust out.",
    meshKeywords: ["valve", "stem", "spring", "poppet"]
  },
  "Spark Plugs": {
    name: "Spark Plugs",
    desc: "Creates the critical electrical arc that ignites the compressed air-fuel mixture.",
    meshKeywords: ["spark", "plug", "ignition", "wire_spark"]
  },
  "Cylinder Block": {
    name: "Cylinder Block",
    desc: "The structural foundation. The core block that contains the cylinder bores and water jackets.",
    meshKeywords: ["block", "main_body", "crankcase", "engine_block", "casting"]
  },
  "Pistons": {
    name: "High-Compression Pistons",
    desc: "Forces vertical motion via combustion explosions. They transfer thousand-pound loads to the crankshaft.",
    meshKeywords: ["piston", "rod", "conrod", "wrist_pin"]
  },
  "Crankshaft": {
    name: "Crankshaft",
    desc: "Converts linear up-down movement into rotational energy. The 'Output' force of your entire powertrain.",
    meshKeywords: ["crank", "crankshaft", "main_shaft", "counterweight"]
  },
  "Timing Belt / Timing Chain": {
    name: "Timing System",
    desc: "Synchronizes the rotation of the crankshaft and camshaft. Essential for mechanical timing and harmonics.",
    meshKeywords: ["timing", "belt", "chain", "pulley", "sprocket"]
  },
  "Exhaust Manifold": {
    name: "Exhaust Manifold",
    desc: "Collects spent combustion gases from multiple cylinders and funnels them into the exhaust system.",
    meshKeywords: ["exhaust", "header", "manifold_ex", "collector"]
  },
  "Oil Pan": {
    name: "Oil Pan / Sump",
    desc: "The reservoir for engine lubricant. Ensures the oil pump stays primed under high lateral G-forces.",
    meshKeywords: ["oil", "pan", "sump", "reservoir"]
  }
};

export function initViewer() {
  const viewer = document.getElementById("viewer");
  if (!viewer) return;

  const hud = document.getElementById("part-hud");
  const hudName = document.getElementById("hud-part-name");
  const hudDesc = document.getElementById("hud-part-desc");

  /* ---------- LOADING SPINNER ---------- */
  const spinner = document.createElement("div");
  spinner.id = "viewer-spinner";
  spinner.innerHTML = `
    <div class="spinner-inner"><div class="spinner-ring"></div><div class="spinner-text">LOADING...</div></div>
  `;
  spinner.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:20;background:#06080f;";
  viewer.appendChild(spinner);

  /* ---------- SCENE & CAMERA ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);

  /* ---------- RENDERER ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  viewer.appendChild(renderer.domElement);

  /* ---------- CONTROLS ---------- */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 0.8;

  /* ---------- GRID FLOOR (Visual Anchor) ---------- */
  const grid = new THREE.GridHelper(100, 50, 0x38bdf8, 0x1e293b);
  grid.position.y = -5;
  grid.material.opacity = 0.2;
  grid.material.transparent = true;
  scene.add(grid);

  /* ---------- LIGHTING ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const mainLight = new THREE.DirectionalLight(0xffffff, 2);
  mainLight.position.set(10, 20, 10);
  scene.add(mainLight);
  const backLight = new THREE.DirectionalLight(0x38bdf8, 1);
  backLight.position.set(-10, -5, -10);
  scene.add(backLight);

  /* ---------- INTERACTION HELPERS ---------- */
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let engineModel;
  let activeTarget = "None";
  let isRevving = false;
  let isUserInteracting = false;
  let currentSpinSpeed = 0.002;
  let highlightedMesh = null;
  let originalMaterial = null;

  controls.addEventListener('start', () => { isUserInteracting = true; });
  controls.addEventListener('end', () => { 
    // Wait a bit before resuming auto-spin
    setTimeout(() => { isUserInteracting = false; }, 1000); 
  });

  /* ---------- MODEL LOADING ---------- */
  const loader = new GLTFLoader();
  const modelPath = viewer.dataset.model || "models/v8_engine.glb";

  loader.load(modelPath, (gltf) => {
    engineModel = gltf.scene;
    engineModel.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0x888888),
          metalness: 0.9,
          roughness: 0.15,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(engineModel);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    engineModel.position.sub(center);
    scene.add(engineModel);

    const maxDim = Math.max(size.x, size.y, size.z);
    camera.position.set(maxDim * 1.5, maxDim * 1, maxDim * 1.5);
    camera.lookAt(0, 0, 0);

    if (spinner) spinner.remove();
  });

  /* ---------- INTERACTION FUNCTIONS ---------- */
  function getPartDataByMeshName(mesh) {
    if (!mesh) return null;
    
    // Check the mesh name, and its parent names (for sub-assembled parts)
    const namesToTest = [
      mesh.name.toLowerCase(),
      mesh.parent ? mesh.parent.name.toLowerCase() : "",
      mesh.parent && mesh.parent.parent ? mesh.parent.parent.name.toLowerCase() : ""
    ];

    for (const key in PART_DATA) {
      if (PART_DATA[key].meshKeywords.some(kw => namesToTest.some(name => name.includes(kw)))) {
        return PART_DATA[key];
      }
    }
    return null;
  }

  function highlightMesh(mesh) {
    if (highlightedMesh === mesh) return;
    if (highlightedMesh && originalMaterial) highlightedMesh.material = originalMaterial;
    if (mesh) {
      highlightedMesh = mesh;
      originalMaterial = mesh.material.clone();
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x38bdf8),
        emissive: new THREE.Color(0x38bdf8),
        emissiveIntensity: 0.6,
        metalness: 1, roughness: 0.1
      });
    } else {
      highlightedMesh = null;
    }
  }

  function showHUD(data) {
    if (!hud) return;
    if (data) {
      hudName.textContent = data.name;
      hudDesc.textContent = data.desc;
      hud.classList.remove("is-hidden");
    } else {
      hud.classList.add("is-hidden");
    }
  }

  function handleInteraction(event) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      console.log("DEBUG: You clicked on mesh named:", clickedMesh.name); // IDENTIFYING MESHES
      
      const data = getPartDataByMeshName(clickedMesh);
      if (data) {
        highlightMesh(clickedMesh);
        showHUD(data);
        const section = Array.from(document.querySelectorAll(".story-card"))
          .find(c => c.getAttribute("data-highlight") === data.name);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      highlightMesh(null);
      showHUD(null);
    }
  }

  renderer.domElement.addEventListener("pointerdown", handleInteraction);

  /* ---------- ANIMATION LOOP ---------- */
  function animate() {
    requestAnimationFrame(animate);
    if (engineModel && !isUserInteracting) {
      let targetSpeed = isRevving ? 0.08 : (activeTarget === "None" ? 0.001 : 0.005);
      currentSpinSpeed += (targetSpeed - currentSpinSpeed) * 0.05;
      engineModel.rotation.y += currentSpinSpeed;
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  /* ---------- SCROLL & RESIZE ---------- */
  const storyCards = document.querySelectorAll(".story-card");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        storyCards.forEach(c => c.classList.remove("active"));
        entry.target.classList.add("active");
        activeTarget = entry.target.getAttribute("data-highlight");
        if (engineModel && activeTarget !== "None") {
          engineModel.traverse(child => {
            if (child.isMesh) {
              const data = getPartDataByMeshName(child.name);
              if (data && data.name === activeTarget) highlightMesh(child);
            }
          });
        }
      }
    });
  }, { rootMargin: "-40% 0px -40% 0px" });
  storyCards.forEach(c => observer.observe(c));

  window.addEventListener("resize", () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  });
}