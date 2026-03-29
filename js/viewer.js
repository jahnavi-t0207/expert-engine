import * as THREE from "https://esm.sh/three";
import { GLTFLoader } from "https://esm.sh/three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three/examples/jsm/controls/OrbitControls.js";

export function initViewer() {
  const viewer = document.getElementById("viewer");
  if (!viewer) return;

  /* ---------- SCENE & CAMERA ---------- */
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    viewer.clientWidth / viewer.clientHeight,
    0.1,
    1000
  );

  /* ---------- RENDERER ---------- */
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  viewer.appendChild(renderer.domElement);

  /* ---------- CONTROLS ---------- */
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true; // Allow user to zoom in and out
  controls.enablePan = false;

  /* ---------- LIGHTING ---------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.8));
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(10, 20, 10);
  scene.add(light);
  
  const backLight = new THREE.DirectionalLight(0x38bdf8, 1);
  backLight.position.set(-10, -10, -10);
  scene.add(backLight);

  /* ---------- MODEL & MAPPING CACHE ---------- */
  let engineModel;
  let activeTarget = "None";

  const loader = new GLTFLoader();
  
  // Read model path from data attribute or fallback to V8
  const modelPath = viewer.dataset.model || "models/v8_engine.glb";

  loader.load(modelPath, (gltf) => {
    engineModel = gltf.scene;

    // 1. FILTER JUNK & APPLY MATERIALS
    engineModel.traverse((child) => {
      if (child.isMesh) {
        const name = child.name.toLowerCase();
        // Only hide VERY likely scaffolding (Spheres and Points)
        // Keep Planes/Circles as they are often engine covers or bases
        if (name.includes("sphere") || name.includes("point")) {
           child.visible = false;
        }

        // Apply sleek metallic material
        child.material = new THREE.MeshStandardMaterial({
          color: child.material.color || new THREE.Color(0x888888),
          metalness: 0.9,
          roughness: 0.15,
          envMapIntensity: 1
        });
      }
    });

    // 2. AUTO-ROTATE TO HORIZONTAL IF VERTICAL
    let box = new THREE.Box3().setFromObject(engineModel);
    let size = box.getSize(new THREE.Vector3());
    
    // Only rotate if height is significantly greater than length (vertical standing)
    if (size.y > size.x * 1.5 && size.y > size.z) {
      engineModel.rotation.z = Math.PI / 2;
      box = new THREE.Box3().setFromObject(engineModel);
      size = box.getSize(new THREE.Vector3());
    }

    // 3. CENTER THE MODEL
    const center = box.getCenter(new THREE.Vector3());
    engineModel.position.x += (engineModel.position.x - center.x);
    engineModel.position.y += (engineModel.position.y - center.y);
    engineModel.position.z += (engineModel.position.z - center.z);

    scene.add(engineModel);

    // 4. DYNAMIC CAMERA FRAMING
    // We want the model to fill roughly 70% of the screen
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
    
    // Add buffer and handle aspect ratio for wide engines
    cameraZ *= 1.8; 
    
    camera.position.set(cameraZ * 0.8, cameraZ * 0.5, cameraZ * 0.8);
    camera.lookAt(0, 0, 0);
    
    controls.target.set(0, 0, 0);
    controls.update();

    // 5. ENHANCED LIGHTING
    const mainLight = new THREE.PointLight(0xffffff, 10);
    camera.add(mainLight); // Light moves with camera
    scene.add(camera);
  });

  /* ---------- ANIMATION LOOP ---------- */
  function animate() {
    requestAnimationFrame(animate);

    if (engineModel) {
      // Very slow cinematic spin to view all angles
      engineModel.rotation.y += 0.002;
    }

    controls.update();
    renderer.render(scene, camera);
  }
  
  animate();

  /* ---------- RESIZE HANDLING ---------- */
  window.addEventListener("resize", () => {
    // Viewer is strictly tied to sticky left side DOM container
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  });


  /* ---------- INTERSECTION OBSERVER (Scroll Spy) ---------- */
  
  const storyCards = document.querySelectorAll(".story-card");
  
  // Set up observer to track when text cards hit the middle of the screen
  const observerOptions = {
    root: null, // viewport
    rootMargin: "-40% 0px -40% 0px", // Trigger active state strictly in the middle 20% of screen
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        
        // Remove active class from all
        storyCards.forEach(card => card.classList.remove("active"));
        
        // Add to the intersecting one
        entry.target.classList.add("active");
        
        // Update the 3D target! (This updates the animate loop above)
        activeTarget = entry.target.getAttribute("data-highlight");
      }
    });
  }, observerOptions);

  storyCards.forEach(card => observer.observe(card));

}