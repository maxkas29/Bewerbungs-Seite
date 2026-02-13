import * as THREE from 'three';

// 1. Scene Setup
const scene = new THREE.Scene();
// scene.background = new THREE.Color(0x000000); // Old black background
const textureLoader = new THREE.TextureLoader();
const bgTexture = textureLoader.load('assets/img/landscape.png');
bgTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = bgTexture;

// 2. Camera Setup (Isometric/Orthographic)
const aspect = window.innerWidth / window.innerHeight;
const d = 20; // Increased view area for larger platform
const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);

// Isometric view position
camera.position.set(20, 20, 20); // High up and to the corner
camera.lookAt(scene.position); // Look at center (0,0,0)

// 3. Renderer Setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace; // Ensure correct color output
renderer.shadowMap.enabled = true; // Enable shadows
document.body.appendChild(renderer.domElement);

// 4. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, .5);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, .5);
dirLight.position.set(0, 5, 0); // Light from top-rightish
dirLight.castShadow = true; // Enable shadow casting
dirLight.shadow.mapSize.width = 1024;
dirLight.shadow.mapSize.height = 1024;
dirLight.shadow.camera.left = -20;
dirLight.shadow.camera.right = 20;
dirLight.shadow.camera.top = 20;
dirLight.shadow.camera.bottom = -20;
scene.add(dirLight);

// 5. Objects
// Platform - Increased size
const platformSize = 40;
const platformGeometry = new THREE.PlaneGeometry(platformSize, platformSize);
const platformMaterial = new THREE.ShadowMaterial({ opacity: 0.5 }); // Transparent but receives shadows
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.rotation.x = -Math.PI / 2; // Flat on the ground
platform.receiveShadow = true;
scene.add(platform);

// Cube (Player) - Replaced with UFO
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

let cube; // Will be assigned when loaded
const hoverHeight = 4;
const cubeSize = 1; // Needed for green cubes and calculations

// Load UFO Model
const loadingManager = new THREE.LoadingManager();

loadingManager.onLoad = () => {
    // Hide Loader
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }

    // Show Intro Modal after a short delay
    setTimeout(() => {
        showModal("<h2>Willkommen!</h2><p>Steuere das UFO mit den <b>Pfeiltasten</b>.</p><p>Deine Aufgabe: <b>Sammle Informationen über Maximilian.</b></p><br><p>Viel Erfolg!</p>");
    }, 500);
};

// Pass manager to loaders
const mtlLoader = new MTLLoader(loadingManager);
mtlLoader.load('assets/obj/UFO.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.load('assets/obj/UFO.obj', (object) => {
        cube = object;
        cube.position.set(0, hoverHeight, 0); // Start at center

        cube.scale.set(0.01, 0.01, 0.01);
        cube.rotation.x = Math.PI / 2; // Rotate 90 degrees
        cube.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(cube);
    });
});

// Green Cubes with Data
const greenCubesData = [
    { x: 4, z: 6, info: "Welcome to the Green Cube zone! This area is safe." },
    { x: -8, z: -8, info: "Did you know? Three.js makes 3D on the web easy!" },
    { x: 8, z: -5, info: "Keep exploring to find more hidden messages." },
    { x: -5, z: 8, info: "You found the secret corner! Great job." },
    { x: 0, z: -10, info: "Center alignment is key to good design." }
];

const greenCubes = [];
const greenCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const greenCubeMaterial = new THREE.MeshLambertMaterial({ color: 0xaaff55 }); // Green

greenCubesData.forEach((data, index) => {
    if (index === 0) {
        // Load Car Model for the first item
        const carTexture = textureLoader.load('assets/obj/13884_Diffuse.jpg');
        const carMaterial = new THREE.MeshLambertMaterial({ map: carTexture });

        const carLoader = new OBJLoader();
        carLoader.load('assets/obj/Car.obj', (object) => {
            const car = object;
            // Car model might be huge or tiny, need to adjust scale
            car.scale.set(0.4, 0.4, 0.4); // Trial and error scale

            // Initial position (Ground level)
            // Car pivot is usually at bottom center, but OBJ might vary.
            // Green cubes are at y = cubeSize/2 (0.5).
            car.position.set(data.x, 0, data.z); // Start at ground

            // Rotate to look natural?
            car.rotation.y = -Math.PI; // OBJ often comes rotated wrong

            // Setup UserData for interaction
            car.userData = {
                info: data.info,
                originalPos: new THREE.Vector3(data.x, 0, data.z), // Ground level for car
                isReturning: false,
                isCar: true // Flag to identify it's not a simple cube
            };

            // Enable Shadows for all meshes in the car
            car.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = carMaterial; // Apply texture
                }
            });

            scene.add(car);
            greenCubes.push(car);
        });
    } else if (index === 1) {
        // Load Cow Model for the second item
        // Assuming 'Blank image.jpg' is the texture, or just white
        const cowTexture = textureLoader.load('assets/obj/Blank image.jpg');
        const cowMaterial = new THREE.MeshLambertMaterial({ map: cowTexture }); // or color: 0xffffff

        const cowLoader = new OBJLoader();
        cowLoader.load('assets/obj/Mascot_Cow.obj', (object) => {
            const cow = object;
            cow.scale.set(0.2, 0.2, 0.2); // Start small, Cows are big

            // Initial position (Ground level)
            cow.position.set(data.x, 0, data.z);

            // Rotate? OBJ usually needs -PI/2 X
            cow.rotation.x = -Math.PI / 2;
            // Maybe slight Y rotation to look interesting
            cow.rotation.z = Math.PI / 2; // Local Z because of X-rotation

            // Setup UserData
            cow.userData = {
                info: data.info,
                originalPos: new THREE.Vector3(data.x, 0, data.z),
                isReturning: false,
                isCow: true
            };

            // Enable Shadows
            cow.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    child.material = cowMaterial;
                }
            });

            scene.add(cow);
            greenCubes.push(cow);
        });
    } else {
        // Standard Green Cubes
        const greenCube = new THREE.Mesh(greenCubeGeometry, greenCubeMaterial);
        greenCube.position.set(data.x, cubeSize / 2, data.z);
        // Store full original position and return state
        greenCube.userData = {
            info: data.info,
            originalPos: new THREE.Vector3(data.x, cubeSize / 2, data.z),
            isReturning: false
        };
        greenCube.castShadow = true;
        greenCube.receiveShadow = true;
        scene.add(greenCube);
        greenCubes.push(greenCube);
    }
});

// Helper to create a glow texture
function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    // Gradient from white center to blueish outer to transparent
    gradient.addColorStop(0, 'rgba(100, 150, 255, 1)'); // Less white, more blue center
    gradient.addColorStop(0.2, 'rgba(0, 80, 255, 1)'); // Strong Blue
    gradient.addColorStop(0.5, 'rgba(0, 40, 200, 0.5)'); // Darker Blue fade
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

// 6. Input Handling
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
};

let isModalOpen = false; // Initialize here
// 9. Interaction
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const closeBtn = document.getElementById("close-btn");
// Create Collect Button dynamically if it doesn't exist, or just clear/recreate modal content
let currentCubeToCollect = null;

const modalContent = document.getElementById("modal-content");
const modalPreviewContainer = document.getElementById("modal-preview");

// --- Preview Scene Setup ---
const previewScene = new THREE.Scene();
// No background set -> transparent
const previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
previewCamera.position.set(0, 2, 5);
previewCamera.lookAt(0, 0, 0);

const previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
previewRenderer.setSize(200, 200);
// Wait to append until needed or append once? Appending once is safer.
modalPreviewContainer.appendChild(previewRenderer.domElement);

// Preview Lighting
const previewAmbient = new THREE.AmbientLight(0xffffff, 1.0);
previewScene.add(previewAmbient);
const previewDirLight = new THREE.DirectionalLight(0xffffff, 1.0);
previewDirLight.position.set(2, 5, 2);
previewScene.add(previewDirLight);

let previewAnimationId = null;
let previewObject = null;

function animatePreview() {
    previewAnimationId = requestAnimationFrame(animatePreview);
    if (previewObject) {
        previewObject.rotation.y += 0.01;
    }
    previewRenderer.render(previewScene, previewCamera);
}
// ---------------------------

function showModal(text, cubeObject = null) {
    if (isModalOpen) return;
    isModalOpen = true;
    modal.style.display = "block";
    modalText.innerHTML = text; // Use innerHTML to allow buttons
    currentCubeToCollect = cubeObject;

    // Handle 3D Preview
    if (cubeObject) {
        modalPreviewContainer.style.display = 'block';

        // Clear previous object
        if (previewObject) {
            previewScene.remove(previewObject);
            previewObject = null;
        }

        // Clone the object for preview
        previewObject = cubeObject.clone();

        // Reset transform
        previewObject.position.set(0, 0, 0);
        previewObject.rotation.set(0, 0, 0);

        // Adjust scale if needed (normalize size)
        // Since we have different sizes (Cube=1, Car=0.4, Cow=0.2), 
        // getting the bounding box and scaling to fit view might be better,
        // but simple manual tweaks or just using existing scale might work if camera is far enough.
        // Let's use existing scale but maybe boost it if it's too small in preview.
        // Or just let it be. The camera is at z=5.
        // The objects are roughly size ~1 to ~3 world units.

        // Ensure materials are independent if needed (cloning mesh usually shares geometry/material)
        // Material sharing is fine for preview.

        previewScene.add(previewObject);

        // Start Animation
        animatePreview();

    } else {
        modalPreviewContainer.style.display = 'none';
    }

    // Clear existing buttons
    const existingBtn = document.getElementById("action-btn");
    if (existingBtn) existingBtn.remove();

    const actionBtn = document.createElement("button");
    actionBtn.id = "action-btn";
    actionBtn.style.marginTop = "20px";
    actionBtn.style.padding = "10px 20px";
    actionBtn.style.fontSize = "16px";
    actionBtn.style.cursor = "pointer";
    actionBtn.style.backgroundColor = "#4CAF50";
    actionBtn.style.color = "white";
    actionBtn.style.border = "none";
    actionBtn.style.borderRadius = "5px";

    if (cubeObject) {
        actionBtn.innerText = "Einsammeln";
        actionBtn.onclick = () => {
            collectCube();
        };
    } else {
        actionBtn.innerText = "Starten";
        actionBtn.onclick = () => {
            closeModal();
        };
    }

    modalContent.appendChild(actionBtn);
}

// Show Intro Modal logic moved to LoadingManager
// window.onload = ... removed

function closeModal() {
    isModalOpen = false;
    modal.style.display = "none";

    // Stop Preview
    if (previewAnimationId) {
        cancelAnimationFrame(previewAnimationId);
        previewAnimationId = null;
    }
    if (previewObject) {
        previewScene.remove(previewObject);
        previewObject = null;
    }

    currentCubeToCollect = null;
    // Remove the action button when closing nicely
    const existingBtn = document.getElementById("action-btn");
    if (existingBtn) existingBtn.remove();
    // Focus back on window to capture keys
    window.focus();
}

function collectCube() {
    if (currentCubeToCollect) {
        // 1. Remove from Scene
        scene.remove(currentCubeToCollect);

        // 2. Remove from Array
        const index = greenCubes.indexOf(currentCubeToCollect);
        if (index > -1) {
            greenCubes.splice(index, 1);
        }

        // 3. Add Info to Sidebar
        const list = document.getElementById("collected-items");
        const li = document.createElement("li");
        li.style.marginBottom = "10px";
        li.style.background = "rgba(255,255,255,0.1)";
        li.style.padding = "5px";
        li.style.borderRadius = "3px";
        li.innerText = currentCubeToCollect.userData.info;
        list.appendChild(li);

        // 4. Close Modal
        closeModal();
    }
}

if (closeBtn) {
    closeBtn.onclick = closeModal;
}
window.onclick = function (event) {
    if (event.target == modal) {
        closeModal();
    }
}

window.addEventListener('keydown', (event) => {
    if (isModalOpen) return; // Disable movement when modal is open
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

// 7. Particle System for UFO Trail
const particleCount = 100;
const particlesGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleOpacities = new Float32Array(particleCount);
const particleSizes = new Float32Array(particleCount);

// Initialize attributes
for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = 0;
    particlePositions[i * 3 + 1] = -5000; // Hide initially way below
    particleOpacities[i] = 1.0; // Start visible for testing consistency
    particleSizes[i] = 1.0;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particlesGeometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1));
particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

// Use a standard material first to ensure visibility
// Use a standard material first to ensure visibility
const particleMaterial = new THREE.PointsMaterial({
    color: 0x00aabb, // Darker/Deeper Blue (was 0x00ffff)
    map: createGlowTexture(),
    size: 3.5, // Slightly larger to compensate for darkness
    transparent: true,
    opacity: 1, // Higher opacity for visibility
    depthWrite: false, // Important for glow overlap to look nice
    blending: THREE.AdditiveBlending // Glow effect
});

// Use the blue glow material
const particles = new THREE.Points(particlesGeometry, particleMaterial);
particles.frustumCulled = false; // Disable culling to ensure it's always rendered
scene.add(particles);

// Particle Data (CPU side)
const particlesData = [];
for (let i = 0; i < particleCount; i++) {
    particlesData.push({
        velocity: new THREE.Vector3(),
        life: 0,
        maxLife: 1.0,
        offsetX: 0,
        offsetZ: 0,
        type: 'idle'
    });
}
let particleIndex = 0;

// 8. Animation Loop
function animate() {
    requestAnimationFrame(animate);

    if (!isModalOpen && cube) {
        // Physics variables
        const acceleration = 0.015; // How fast it speeds up
        const friction = 0.92;      // How fast it slows down (0.9 = 10% loss per frame)
        const maxSpeed = 0.4;       // Maximum speed limit

        // Initialize velocity if not already present
        if (!cube.userData.velocity) {
            cube.userData.velocity = new THREE.Vector3(0, 0, 0);
        }
        const velocity = cube.userData.velocity;

        // Apply acceleration based on input
        if (keys.ArrowUp) {
            velocity.z -= acceleration;
        }
        if (keys.ArrowDown) {
            velocity.z += acceleration;
        }
        if (keys.ArrowLeft) {
            velocity.x -= acceleration;
        }
        if (keys.ArrowRight) {
            velocity.x += acceleration;
        }

        // Apply Friction (damping)
        velocity.multiplyScalar(friction);

        // Limit Speed
        if (velocity.length() > maxSpeed) {
            velocity.setLength(maxSpeed);
        }

        // Apply Velocity to Position
        cube.position.add(velocity);

        // Stop completely if very slow (optimization)
        if (velocity.length() < 0.001) {
            velocity.set(0, 0, 0);
        }

        // Boundary check with velocity reset
        const limit = platformSize / 2 - cubeSize / 2;

        if (cube.position.x < -limit) {
            cube.position.x = -limit;
            velocity.x = 0;
        } else if (cube.position.x > limit) {
            cube.position.x = limit;
            velocity.x = 0;
        }

        if (cube.position.z < -limit) {
            cube.position.z = -limit;
            velocity.z = 0;
        } else if (cube.position.z > limit) {
            cube.position.z = limit;
            velocity.z = 0;
        }

        // Rotate the UFO (Spin)
        // Since rotation.x is PI/2, the local Z axis points "up" in world space (or down)
        // Rotating z makes it spin like a top.
        cube.rotation.z -= 0.005;

        // Hover Effect (Bobbing up and down)
        const time = Date.now() * 0.001; // Current time in seconds
        // Adjust hoverHeight based on sine wave
        // We need to maintain the base height (hoverHeight) and add the wave
        // However, cube.position.y is also affected by other logic? 
        // Currently Y is only set at init to hoverHeight. 
        // Let's modify the Y position directly, but we need to respect the base height.
        // Or better, just add the offset to the base height every frame if we aren't moving vertically otherwise.

        // Wait, the green cubes return to "cubeSize / 2". The UFO starts at "hoverHeight".
        // Let's just create a base Y for the UFO.
        const baseUfoHeight = hoverHeight;
        const hoverOffset = Math.sin(time * 2) * 0.2; // Speed 2, Amplitude 0.2
        cube.position.y = baseUfoHeight + hoverOffset;

        // Magnetic and Gravity Logic
        // Attraction Logic
        const attractionRange = 4.0; // Restore missing variable
        const magneticSpeedXZ = 0.02; // Slower attraction (was 0.05)
        const magneticSpeedY = 0.03;  // Slower lift (was 0.08)
        const returnSpeed = 0.15; // Fast return
        const tetherLimit = 6.0; // Max distance from origin before snapping back
        const gravity = 0.1;

        // Find the closest non-returning cube within range
        let closestCube = null;
        let minDistance = attractionRange;

        for (const greenCube of greenCubes) {
            if (greenCube.userData.isReturning) continue;

            const distXZ = Math.hypot(cube.position.x - greenCube.position.x, cube.position.z - greenCube.position.z);
            if (distXZ < minDistance) {
                minDistance = distXZ;
                closestCube = greenCube;
            }
        }

        for (const greenCube of greenCubes) {
            const originalPos = greenCube.userData.originalPos;

            // Check if returning to origin
            if (greenCube.userData.isReturning) {
                // Move towards original position
                greenCube.position.lerp(originalPos, returnSpeed);

                // If close enough, stop returning
                if (greenCube.position.distanceTo(originalPos) < 0.1) {
                    greenCube.position.copy(originalPos);
                    greenCube.userData.isReturning = false;
                }
                continue; // Skip other logic while returning
            }

            // Normal Attraction Logic
            // Only attract if it is the closest cube found
            const distToOrigin = greenCube.position.distanceTo(originalPos);

            // Trigger return if too far from origin
            if (distToOrigin > tetherLimit) {
                greenCube.userData.isReturning = true;
                continue;
            }

            if (greenCube === closestCube) {
                // Attraction: Move green cube towards red cube position
                greenCube.position.x += (cube.position.x - greenCube.position.x) * magneticSpeedXZ;
                greenCube.position.z += (cube.position.z - greenCube.position.z) * magneticSpeedXZ;

                // Vertical attraction: float up towards red cube (hang slightly below)
                const targetY = cube.position.y - cubeSize;
                greenCube.position.y += (targetY - greenCube.position.y) * magneticSpeedY;

                // Collision Check (3D Distance) - Needs to be very close (touching)
                const dist3D = cube.position.distanceTo(greenCube.position);

                // Only trigger if touching (distance < size of cubes combined approx)
                if (dist3D < 1.05) {
                    showModal(greenCube.userData.info, greenCube);

                    // Push player back slightly to avoid getting stuck inside
                    const dx = cube.position.x - greenCube.position.x;
                    const dz = cube.position.z - greenCube.position.z;
                    const length = Math.sqrt(dx * dx + dz * dz);
                    if (length > 0) {
                        cube.position.x += (dx / length) * 0.5;
                        cube.position.z += (dz / length) * 0.5;
                        // Also stop momentum
                        velocity.set(0, 0, 0);
                    }
                    // No break needed as we iterate all, but logical since only one can touch (closest)
                }
            } else {
                // Gravity: Fall back to ground if not the active target or out of range
                if (greenCube.position.y > originalPos.y) {
                    greenCube.position.y -= gravity;
                    if (greenCube.position.y < originalPos.y) {
                        greenCube.position.y = originalPos.y;
                    }
                }
            }
        }

        // Packet Emission - Tractor Beam
        const beamSpeed = 0.08; // Slower upward speed (was 0.2)
        const spawnCount = 2; // Continuous emission

        for (let k = 0; k < spawnCount; k++) {
            const i = particleIndex;
            const data = particlesData[i];

            // Determine Start Position
            let startX, startY, startZ;

            if (closestCube && closestCube.position.distanceTo(cube.position) < attractionRange) {
                // Attracting: Spawn at/around the Green Cube
                const width = 1.0; // Cube size
                startX = closestCube.position.x + (Math.random() - 0.5) * width;
                startY = closestCube.position.y + 0.5; // Top of the green cube
                startZ = closestCube.position.z + (Math.random() - 0.5) * width;
                data.type = 'attract';
            } else {
                // Idle: Spawn on ground below UFO
                // We want them to spawn relative to the UFO's current position, but "attached" to it conceptually
                const groundY = 0;
                const beamWidth = 0.8;

                // Random offsets relative to center
                const offX = (Math.random() - 0.5) * beamWidth;
                const offZ = (Math.random() - 0.5) * beamWidth;

                data.offsetX = offX;
                data.offsetZ = offZ;
                data.type = 'idle';

                // Spawn position is UFO + Offset, but at Ground Y
                startX = cube.position.x + offX;
                startY = groundY;
                startZ = cube.position.z + offZ;
            }

            particlePositions[i * 3] = startX;
            particlePositions[i * 3 + 1] = startY;
            particlePositions[i * 3 + 2] = startZ;

            // Calculate Velocity
            if (data.type === 'attract') {
                // Target is slightly below UFO center
                const targetX = cube.position.x;
                const targetY = cube.position.y - 0.5;
                const targetZ = cube.position.z;

                const dx = targetX - startX;
                const dy = targetY - startY;
                const dz = targetZ - startZ;

                // Normalize and scale
                const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
                if (len > 0) {
                    data.velocity.set(
                        (dx / len) * beamSpeed,
                        (dy / len) * beamSpeed,
                        (dz / len) * beamSpeed
                    );
                } else {
                    data.velocity.set(0, beamSpeed, 0);
                }
            } else {
                // Idle: Just move UP
                data.velocity.set(0, beamSpeed, 0);
            }

            data.life = 1.0;
            data.maxLife = 1.0;

            particleOpacities[i] = 1.0;
            particleSizes[i] = 0.4; // Base size

            particleIndex = (particleIndex + 1) % particleCount;
        }

        // Update Particles
        for (let i = 0; i < particleCount; i++) {
            const data = particlesData[i];

            if (data.life > 0) {
                if (data.type === 'idle') {
                    // Locked to UFO X/Z, move UP in Y
                    // This creates the "attached beam" effect
                    particlePositions[i * 3] = cube.position.x + data.offsetX;
                    particlePositions[i * 3 + 2] = cube.position.z + data.offsetZ;

                    // Move Y up
                    particlePositions[i * 3 + 1] += data.velocity.y;

                    // Kill if hits UFO
                    if (particlePositions[i * 3 + 1] > cube.position.y - 0.5) {
                        data.life = 0;
                    }
                } else {
                    // Attract Mode: Homing behavior
                    const pX = particlePositions[i * 3];
                    const pY = particlePositions[i * 3 + 1];
                    const pZ = particlePositions[i * 3 + 2];

                    const targetX = cube.position.x;
                    const targetY = cube.position.y - 0.5;
                    const targetZ = cube.position.z;

                    const dx = targetX - pX;
                    const dy = targetY - pY;
                    const dz = targetZ - pZ;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist > 0) {
                        // Homing behavior: Update velocity to point to new UFO position
                        const speed = 0.08;
                        data.velocity.set(
                            (dx / dist) * speed,
                            (dy / dist) * speed,
                            (dz / dist) * speed
                        );
                    }

                    // Move position
                    particlePositions[i * 3] += data.velocity.x;
                    particlePositions[i * 3 + 1] += data.velocity.y;
                    particlePositions[i * 3 + 2] += data.velocity.z;

                    // Distance check
                    if (particlePositions[i * 3 + 1] > cube.position.y - 0.2) {
                        data.life = 0; // Absorbed into UFO
                    }
                }

                // Update Attributes
                particleOpacities[i] = data.life;
                particleSizes[i] = 0.4;

                if (data.life <= 0) {
                    particlePositions[i * 3 + 1] = -5000; // Hide
                    particleOpacities[i] = 0;
                }
            }
        }

        particlesGeometry.attributes.position.needsUpdate = true;
        particlesGeometry.attributes.opacity.needsUpdate = true;
        particlesGeometry.attributes.size.needsUpdate = true;
    }

    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -d * aspect;
    camera.right = d * aspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
