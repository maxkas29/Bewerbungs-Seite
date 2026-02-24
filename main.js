import * as THREE from 'three';
const scene = new THREE.Scene();
const loadingManager = new THREE.LoadingManager();
loadingManager.onProgress = function (url, itemsLoaded, itemsTotal) {
    const progressBar = document.getElementById('progress-bar');
    const loadingText = document.getElementById('loading-text');
    if (progressBar) {
        const percent = (itemsLoaded / itemsTotal) * 100;
        progressBar.style.width = percent + '%';
    }
    if (loadingText) {
        loadingText.innerText = `Lade ${itemsLoaded} von ${itemsTotal} Elementen...`;
    }
};
loadingManager.onLoad = () => {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
    setTimeout(() => {
        showModal("<h2>Bitte kommen team<span style='color: #fff; background-color: #ff0000'>4</span><b>media</b>!</h2> <p>Wir haben eine Person für euch gefunden die gutes Potenzial hat im Unternhemen mit einzusteigen. Nur sind uns einige Informationen verloren gegangen. </p> <p><b>Mission:</b> Sammle Informationen über Maximilian.</p><p>Steuere das UFO mit den <b>Pfeiltasten</b>.</p>");
    }, 500);
};
const textureLoader = new THREE.TextureLoader(loadingManager);
const bgTexture = textureLoader.load('assets/img/landscape.png');
bgTexture.colorSpace = THREE.SRGBColorSpace;
scene.background = bgTexture;
const targetAspect = 16 / 9;
const margin = 0.9;
let availableWidth = window.innerWidth * margin;
let availableHeight = window.innerHeight * margin;
const windowAspect = availableWidth / availableHeight;
let renderWidth = availableWidth;
let renderHeight = availableHeight;
if (windowAspect > targetAspect) {
    renderWidth = renderHeight * targetAspect;
} else {
    renderHeight = renderWidth / targetAspect;
}
const d = 20;
const camera = new THREE.OrthographicCamera(-d * targetAspect, d * targetAspect, d, -d, 1, 1000);
camera.position.set(20, 20, 20);
camera.lookAt(scene.position);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(renderWidth, renderHeight);
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '50%';
renderer.domElement.style.left = '50%';
renderer.domElement.style.transform = 'translate(-50%, -50%)';
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(15, 25, 10);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -25;
dirLight.shadow.camera.right = 25;
dirLight.shadow.camera.top = 25;
dirLight.shadow.camera.bottom = -25;
scene.add(dirLight);
const platformSize = 40;
const platformGeometry = new THREE.PlaneGeometry(platformSize, platformSize);
const platformMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
const platform = new THREE.Mesh(platformGeometry, platformMaterial);
platform.rotation.x = -Math.PI / 2;
platform.receiveShadow = true;
scene.add(platform);
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
let cube;
const hoverHeight = 4;
const cubeSize = 0.95;
const mtlLoader = new MTLLoader(loadingManager);
mtlLoader.load('assets/obj/UFO.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader(loadingManager);
    objLoader.setMaterials(materials);
    objLoader.load('assets/obj/UFO.obj', (object) => {
        cube = object;
        cube.position.set(0, 40, 0); // Spawnt oben unsichtbar
        cube.scale.set(0.0095, 0.0095, 0.0095);
        cube.rotation.x = Math.PI / 2;
        cube.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        scene.add(cube);
    });
});
const collectData = [
    {
        x: 4,
        z: 6,
        category: "Bildung",
        title: "Fachabitur & Ausbildung",
        text: "Fachabitur in Verbindung mit der Ausbildung zum Informationstechnischen Assistenten.",
        info: "Bildung: Fachabitur in der Fachrichtung Informatik"
    },
    {
        x: -8,
        z: -8,
        category: "Soft Skills",
        title: "Teamfähigkeit",
        text: "Überzeugender Kommunikator, der gerne im Team agiert. Bringt praktische Erfahrung in der agilen Projektarbeit und der Anleitung kleiner Teams mit.",
        info: "Soft Skills: Teamfähigkeit"
    },
    {
        x: 15,
        z: 15,
        category: "Ausbildung",
        title: "Ausbildung zum Fachinformatiker für Anwendungsentwicklung",
        text: "Erfolgreiche Ausbildung zum Fachinformatiker für Anwendungsentwicklung bei der Bauformat Küchen GmbH & Co. KG. Abschlussarbeit: Entwicklung einer Webanwendung für eine Arbeitsplatzbuchung mit AngularJS und ExpressJS.",
        info: "Fähigkeiten: Full-Stack-Entwickler"
    },
    {
        x: -6,
        z: 8,
        category: "Projekte",
        title: "Werkstudententätigkeit",
        text: "Erstellung einer Webanwendung für ein Catering-Unternehmen, um deren Bestellprozess zu optimieren. Sowie die Entwicklung einer KI gestützten und Automatisierten SocialMedia Präsenz.",
        info: "Werkstudententätigkeit: Eigenständige Betreuung eines Projektes- Automatisierung und KI"
    }
];
const greenCubes = [];
const greenCubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
const greenCubeMaterial = new THREE.MeshLambertMaterial({ color: 0xaaff55 });
collectData.forEach((data, index) => {
    if (index === 0) {
        const gltfLoader = new GLTFLoader(loadingManager);
        gltfLoader.load('assets/obj/lexus_lfa.glb', (gltf) => {
            const car = gltf.scene;
            const box = new THREE.Box3().setFromObject(car);
            const size = box.getSize(new THREE.Vector3()).length();
            const desiredSize = 2.8;
            const scaleFactor = desiredSize / size;
            if (isFinite(scaleFactor) && scaleFactor > 0) {
                car.scale.set(scaleFactor, scaleFactor, scaleFactor);
            } else {
                car.scale.set(0.38, 0.38, 0.38);
            }
            const bottomY = box.min.y * scaleFactor;
            car.position.set(data.x, -bottomY, data.z);
            car.rotation.y = -Math.PI;
            car.userData = {
                info: data.info,
                originalPos: new THREE.Vector3(data.x, -bottomY, data.z),
                isReturning: false,
                isCar: true
            };
            car.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        if (child.material.color) {
                            child.material.color.lerp(new THREE.Color(0xffffff), 0.5);
                        }
                        if (child.material.metalness !== undefined) child.material.metalness = 0.5;
                        if (child.material.roughness !== undefined) child.material.roughness = Math.max(0.5, child.material.roughness);
                    }
                }
            });
            scene.add(car);
            greenCubes.push(car);
        });
    } else if (index === 1) {
        const cowTexture = textureLoader.load('assets/obj/Blank image.jpg');
        const cowMaterial = new THREE.MeshLambertMaterial({ map: cowTexture });
        const cowLoader = new OBJLoader(loadingManager);
        cowLoader.load('assets/obj/Mascot_Cow.obj', (object) => {
            const cow = object;
            cow.scale.set(0.19, 0.19, 0.19);
            cow.position.set(data.x, 0, data.z);
            cow.rotation.x = -Math.PI / 2;
            cow.rotation.z = Math.PI / 2;
            cow.userData = {
                info: data.info,
                originalPos: new THREE.Vector3(data.x, 0, data.z),
                isReturning: false,
                isCow: true
            };
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
    } else if (index === 2) {
        const gltfLoader = new GLTFLoader(loadingManager);
        gltfLoader.load('assets/obj/LKW.glb', (gltf) => {
            const lkw = gltf.scene;
            lkw.scale.set(1.9, 1.9, 1.9);
            lkw.position.set(data.x, 0, data.z);
            lkw.userData = {
                info: data.info,
                originalPos: new THREE.Vector3(data.x, 0, data.z),
                isReturning: false,
                isLkw: true
            };
            lkw.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        if (child.material.color) {
                            child.material.color.lerp(new THREE.Color(0xffffff), 0.5);
                        }
                    }
                }
            });
            scene.add(lkw);
            greenCubes.push(lkw);
        });
    } else if (index === 3) {
        const robotMtlLoader = new MTLLoader(loadingManager);
        robotMtlLoader.load('assets/obj/11696_robot_v1_L3.mtl', (materials) => {
            materials.preload();
            const robotLoader = new OBJLoader(loadingManager);
            robotLoader.setMaterials(materials);
            robotLoader.load('assets/obj/11696_robot_v1_L3.obj', (object) => {
                const robot = object;
                robot.scale.set(0.057, 0.057, 0.057);
                robot.position.set(data.x, 0, data.z);
                robot.userData = {
                    info: data.info,
                    originalPos: new THREE.Vector3(data.x, 0, data.z),
                    isReturning: false,
                    isRobot: true
                };
                robot.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });
                robot.rotation.x = -Math.PI / 2;
                scene.add(robot);
                greenCubes.push(robot);
            });
        });
    } else {
        const greenCube = new THREE.Mesh(greenCubeGeometry, greenCubeMaterial);
        greenCube.position.set(data.x, cubeSize / 2, data.z);
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
function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(100, 150, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(0, 80, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(0, 40, 200, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
};
let isModalOpen = false;
let isAnimatingStart = false; // Flag für die Drop-Down Start-Animation
let hasGameStarted = false; // Verhindert Physik- und Laser-Updates in den ersten Millisekunden vor dem Modal
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal-text");
const closeBtn = document.getElementById("close-btn");
let currentCubeToCollect = null;
const modalContent = document.getElementById("modal-content");
const modalPreviewContainer = document.getElementById("modal-preview");
const previewScene = new THREE.Scene();
const previewCamera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
previewCamera.position.set(0, 2, 5);
previewCamera.lookAt(0, 0, 0);
const previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
previewRenderer.setSize(200, 200);
modalPreviewContainer.appendChild(previewRenderer.domElement);
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
function showModal(text, cubeObject = null) {
    if (isModalOpen) return;
    isModalOpen = true;
    modal.style.display = "block";
    modalText.innerHTML = text;
    currentCubeToCollect = cubeObject;
    const profileCard = document.getElementById('profile-card');
    if (profileCard) {
        if (cubeObject) {
            profileCard.style.display = 'none';
        } else {
            profileCard.style.display = 'flex';
        }
    }
    if (cubeObject) {
        modalPreviewContainer.style.display = 'block';
        if (previewObject) {
            previewScene.remove(previewObject);
            previewObject = null;
        }
        previewObject = new THREE.Group();
        const clonedMesh = cubeObject.clone();
        clonedMesh.position.set(0, 0, 0);
        clonedMesh.rotation.copy(cubeObject.rotation);
        previewObject.add(clonedMesh);
        previewScene.add(previewObject);
        animatePreview();
    } else {
        modalPreviewContainer.style.display = 'none';
    }
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
function closeModal() {
    isModalOpen = false;
    modal.style.display = "none";
    if (previewAnimationId) {
        cancelAnimationFrame(previewAnimationId);
        previewAnimationId = null;
    }
    if (previewObject) {
        previewScene.remove(previewObject);
        previewObject = null;
    }

    // Wenn es sich um das Start-Modal handelt (kein currentCubeToCollect), triggern wir die Animation
    if (!currentCubeToCollect && cube && !hasGameStarted) {
        hasGameStarted = true;
        cube.position.y = 40; // UFO weit nach oben setzen
        isAnimatingStart = true;

        // Verstecke alle versehentlich erzeugten Laserpartikel
        if (typeof particleCount !== 'undefined') {
            for (let i = 0; i < particleCount; i++) {
                particlePositions[i * 3 + 1] = -5000;
                particleOpacities[i] = 0;
                if (particlesData[i]) particlesData[i].life = 0;
            }
            if (particlesGeometry.attributes.position) particlesGeometry.attributes.position.needsUpdate = true;
            if (particlesGeometry.attributes.opacity) particlesGeometry.attributes.opacity.needsUpdate = true;
        }
    }

    currentCubeToCollect = null;
    const existingBtn = document.getElementById("action-btn");
    if (existingBtn) existingBtn.remove();
    window.focus();
}
function collectCube() {
    if (currentCubeToCollect) {
        scene.remove(currentCubeToCollect);
        const index = greenCubes.indexOf(currentCubeToCollect);
        if (index > -1) {
            greenCubes.splice(index, 1);
        }
        const counterEl = document.getElementById("collection-counter");
        if (counterEl) {
            const total = collectData.length;
            const collected = total - greenCubes.length;
            counterEl.innerText = `${collected} / ${total}`;
        }
        const list = document.getElementById("collected-items");
        const li = document.createElement("li");
        li.innerText = currentCubeToCollect.userData.info;
        list.appendChild(li);
        closeModal();
        if (greenCubes.length === 0) {
            showFinalModal();
        }
    }
}
function showFinalModal() {
    const finalModal = document.getElementById('final-modal');
    const summaryTextContainer = document.getElementById('final-summary-text');
    let summaryHtml = "";
    collectData.forEach(item => {
        summaryHtml += `
            <div style="margin-bottom: 20px; border-bottom: 1px solid rgba(0,255,255,0.1); padding-bottom: 15px;">
                <h3 style="color: #00ffff; margin-bottom: 5px;">${item.category}: ${item.title}</h3>
                <p>${item.text}</p>
            </div>
        `;
    });
    summaryTextContainer.innerHTML = summaryHtml;
    finalModal.style.display = 'flex';
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
    if (isModalOpen) return;
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});
window.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});
const particleCount = 100;
const particlesGeometry = new THREE.BufferGeometry();
const particlePositions = new Float32Array(particleCount * 3);
const particleOpacities = new Float32Array(particleCount);
const particleSizes = new Float32Array(particleCount);
for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = 0;
    particlePositions[i * 3 + 1] = -5000;
    particleOpacities[i] = 1.0;
    particleSizes[i] = 1.0;
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
particlesGeometry.setAttribute('opacity', new THREE.BufferAttribute(particleOpacities, 1));
particlesGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
const particleMaterial = new THREE.PointsMaterial({
    color: 0x00aabb,
    map: createGlowTexture(),
    size: 3.5,
    transparent: true,
    opacity: 1,
    depthWrite: false,
    blending: THREE.AdditiveBlending
});
const particles = new THREE.Points(particlesGeometry, particleMaterial);
particles.frustumCulled = false;
scene.add(particles);
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
function animate() {
    requestAnimationFrame(animate);

    if (!hasGameStarted) {
        // Verhindere Laser- und Physik-Updates, bevor der Nutzer gestartet hat
        renderer.render(scene, camera);
        return;
    }

    if (isAnimatingStart && cube) {
        // Einflug-Animation: Sanftes Absinken zur hoverHeight
        cube.position.y -= (cube.position.y - hoverHeight) * 0.05; // Ease-Out Effekt
        cube.rotation.z -= 0.05; // Schneller spin beim reinfliegen

        // Sobald es nah genug an der Zielhöhe ist, Animation beenden
        if (Math.abs(cube.position.y - hoverHeight) < 0.05) {
            cube.position.y = hoverHeight;
            isAnimatingStart = false;
        }
    } else if (!isModalOpen && cube) {
        const acceleration = 0.015;
        const friction = 0.92;
        const maxSpeed = 0.4;
        if (!cube.userData.velocity) {
            cube.userData.velocity = new THREE.Vector3(0, 0, 0);
        }
        const velocity = cube.userData.velocity;
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
        velocity.multiplyScalar(friction);
        if (velocity.length() > maxSpeed) {
            velocity.setLength(maxSpeed);
        }
        cube.position.add(velocity);
        if (velocity.length() < 0.001) {
            velocity.set(0, 0, 0);
        }
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
        cube.rotation.z -= 0.005;
        const time = Date.now() * 0.001;
        const baseUfoHeight = hoverHeight;
        const hoverOffset = Math.sin(time * 2) * 0.2;
        cube.position.y = baseUfoHeight + hoverOffset;
        const attractionRange = 4.0;
        const magneticSpeedXZ = 0.02;
        const magneticSpeedY = 0.03;
        const returnSpeed = 0.15;
        const tetherLimit = 6.0;
        const gravity = 0.1;
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
            if (greenCube.userData.isReturning) {
                greenCube.position.lerp(originalPos, returnSpeed);
                if (greenCube.position.distanceTo(originalPos) < 0.1) {
                    greenCube.position.copy(originalPos);
                    greenCube.userData.isReturning = false;
                }
                continue;
            }
            const distToOrigin = greenCube.position.distanceTo(originalPos);
            if (distToOrigin > tetherLimit) {
                greenCube.userData.isReturning = true;
                continue;
            }
            if (greenCube === closestCube) {
                greenCube.position.x += (cube.position.x - greenCube.position.x) * magneticSpeedXZ;
                greenCube.position.z += (cube.position.z - greenCube.position.z) * magneticSpeedXZ;
                const targetY = cube.position.y - cubeSize;
                greenCube.position.y += (targetY - greenCube.position.y) * magneticSpeedY;
                const dist3D = cube.position.distanceTo(greenCube.position);
                if (dist3D < 1.05) {
                    showModal(greenCube.userData.info, greenCube);
                    const dx = cube.position.x - greenCube.position.x;
                    const dz = cube.position.z - greenCube.position.z;
                    const length = Math.sqrt(dx * dx + dz * dz);
                    if (length > 0) {
                        cube.position.x += (dx / length) * 0.5;
                        cube.position.z += (dz / length) * 0.5;
                        velocity.set(0, 0, 0);
                    }
                }
            } else {
                if (greenCube.position.y > originalPos.y) {
                    greenCube.position.y -= gravity;
                    if (greenCube.position.y < originalPos.y) {
                        greenCube.position.y = originalPos.y;
                    }
                }
            }
        }

        if (!isAnimatingStart) {
            const beamSpeed = 0.08;
            const spawnCount = 2;
            for (let k = 0; k < spawnCount; k++) {
                const i = particleIndex;
                const data = particlesData[i];
                let startX, startY, startZ;
                if (closestCube && closestCube.position.distanceTo(cube.position) < attractionRange) {
                    const width = 1.0;
                    startX = closestCube.position.x + (Math.random() - 0.5) * width;
                    startY = closestCube.position.y + 0.5;
                    startZ = closestCube.position.z + (Math.random() - 0.5) * width;
                    data.type = 'attract';
                } else {
                    const groundY = 0;
                    const beamWidth = 0.8;
                    const offX = (Math.random() - 0.5) * beamWidth;
                    const offZ = (Math.random() - 0.5) * beamWidth;
                    data.offsetX = offX;
                    data.offsetZ = offZ;
                    data.type = 'idle';
                    startX = cube.position.x + offX;
                    startY = groundY;
                    startZ = cube.position.z + offZ;
                }
                particlePositions[i * 3] = startX;
                particlePositions[i * 3 + 1] = startY;
                particlePositions[i * 3 + 2] = startZ;
                if (data.type === 'attract') {
                    const targetX = cube.position.x;
                    const targetY = cube.position.y - 0.5;
                    const targetZ = cube.position.z;
                    const dx = targetX - startX;
                    const dy = targetY - startY;
                    const dz = targetZ - startZ;
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
                    data.velocity.set(0, beamSpeed, 0);
                }
                data.life = 1.0;
                data.maxLife = 1.0;
                particleOpacities[i] = 1.0;
                particleSizes[i] = 0.4;
                particleIndex = (particleIndex + 1) % particleCount;
            }
            for (let i = 0; i < particleCount; i++) {
                const data = particlesData[i];
                if (data.life > 0) {
                    if (data.type === 'idle') {
                        particlePositions[i * 3] = cube.position.x + data.offsetX;
                        particlePositions[i * 3 + 2] = cube.position.z + data.offsetZ;
                        particlePositions[i * 3 + 1] += data.velocity.y;
                        if (particlePositions[i * 3 + 1] > cube.position.y - 0.5) {
                            data.life = 0;
                        }
                    } else {
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
                            const speed = 0.08;
                            data.velocity.set(
                                (dx / dist) * speed,
                                (dy / dist) * speed,
                                (dz / dist) * speed
                            );
                        }
                        particlePositions[i * 3] += data.velocity.x;
                        particlePositions[i * 3 + 1] += data.velocity.y;
                        particlePositions[i * 3 + 2] += data.velocity.z;
                        if (particlePositions[i * 3 + 1] > cube.position.y - 0.2) {
                            data.life = 0;
                        }
                    }
                    particleOpacities[i] = data.life;
                    particleSizes[i] = 0.4;
                    if (data.life <= 0) {
                        particlePositions[i * 3 + 1] = -5000;
                        particleOpacities[i] = 0;
                    }
                }
            }
            particlesGeometry.attributes.position.needsUpdate = true;
            particlesGeometry.attributes.opacity.needsUpdate = true;
            particlesGeometry.attributes.size.needsUpdate = true;
        }
    }
    renderer.render(scene, camera);
} // End of animate function

window.addEventListener('resize', () => {
    const targetAspect = 16 / 9;
    const margin = 0.9;
    let availableWidth = window.innerWidth * margin;
    let availableHeight = window.innerHeight * margin;
    const windowAspect = availableWidth / availableHeight;
    let renderWidth = availableWidth;
    let renderHeight = availableHeight;
    if (windowAspect > targetAspect) {
        renderWidth = renderHeight * targetAspect;
    } else {
        renderHeight = renderWidth / targetAspect;
    }
    camera.left = -d * targetAspect;
    camera.right = d * targetAspect;
    camera.top = d;
    camera.bottom = -d;
    camera.updateProjectionMatrix();
    renderer.setSize(renderWidth, renderHeight);
});

animate();

const initialCounterEl = document.getElementById("collection-counter");
if (initialCounterEl && typeof collectData !== 'undefined') {
    initialCounterEl.innerText = `0 / ${collectData.length}`;
}
