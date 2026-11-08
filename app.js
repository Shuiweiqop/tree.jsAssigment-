import * as THREE from 'three';
import { getNetWorthColor } from './src/colors.js';
import {
    CSS3DRenderer,
    CSS3DObject
} from 'three/addons/renderers/CSS3DRenderer.js';
import { transformData } from './src/data.js';
import {
    TrackballControls
} from 'three/addons/controls/TrackballControls.js';

import { getBounds } from './src/bounds.js';
import { computeLayoutPosition } from './src/layouts.js';
import { computeFitDistance } from './src/camera.js';

// ========================================
// 1. Configuration
// ========================================

const CLIENT_ID = "852055862940-h1ruc3360v2fhvj4klp3no63q01kn0dm.apps.googleusercontent.com";
const SPREADSHEET_ID = "1Ds-09_Ih9CxbckQMxHMHBKU-Oz3N0aCk3Fa9jF7QuLE";
const RANGE = "'Kasatria Data'!A1:F201";

// ========================================
// 2. Global Variables
// ========================================

let accessToken = null;
let tokenClient = null;
let lastBounds = null;
const tileObjects = [];

// Current layout transition
let activeTransition = null;

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    1,
    10000
);

camera.position.z = 4000;

// ========================================
// 3. Initialize Renderer
// ========================================

const container = document.getElementById('scene-container');

const renderer = new CSS3DRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// ========================================
// 4. Initialize Controls
// ========================================

const controls = new TrackballControls(camera, renderer.domElement);

controls.rotateSpeed = 3.0;
controls.zoomSpeed = 1.2;
controls.panSpeed = 0.8;

// ========================================
// 5. Google Sheets Connection
// ========================================

window.addEventListener('load', () => {
    const connectButton = document.getElementById('connectButton');

    if (!window.google) {
        updateStatus("Google Identity Services failed to load.", true);
        return;
    }

    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',

        callback: async (response) => {
            connectButton.disabled = false;
            if (response.error) {
                console.error("Authorization Error:", response);
                updateStatus(
                    response.error === 'access_denied'
                        ? "Access was not granted. Please try again."
                        : "Google sign-in failed. Please try again.",
                    true
                );
                return;
            }

            accessToken = response.access_token;
            updateStatus("Signed in. Loading data...");

            const loaded = await fetchSheetData();

            if (loaded) {
                document.body.classList.remove('signed-out');
            }
        },

        // fires when the popup is closed or blocked, where callback never runs
        error_callback: (error) => {
            console.error("Popup error:", error);
            connectButton.disabled = false;
            updateStatus("The sign-in window was closed or blocked. Please try again.", true);
        }
    });

    connectButton.addEventListener('click', () => {
        connectButton.disabled = true;
        updateStatus("");
        tokenClient.requestAccessToken();
    });
});

// ========================================
// 6. Fetch Sheet Data
// ========================================

async function fetchSheetData() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(RANGE)}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rows = data.values;

        if (!rows || rows.length === 0) {
            updateStatus("No data found in spreadsheet.", true);
            return false;
        }

        const records = transformData(rows);
        createTiles(records);
        updateStatus(`Loaded ${records.length} records.`);
        return true;

    } catch (error) {
        console.error("Error fetching sheet data:", error);
        updateStatus("Failed to load Google Sheets data.", true);
        return false;
    }
}

// ========================================
// 7. Transform Data (Handled in src/data.js)
// ========================================
// See src/data.js for data transformation logic.

// ========================================
// 8. Create HTML Tile
// ========================================

function createTile(data) {
    const element = document.createElement('div');
    element.className = 'tile';

    // 1. Top row: Country on the left, Age on the right (no "Country:" / "Age:" prefixes)
    const top = document.createElement('div');
    top.className = 'tile-top';

    const country = document.createElement('span');
    country.textContent = data.country;

    const age = document.createElement('span');
    age.textContent = String(data.age); // Display age number directly

    top.append(country, age);

    // 2. Middle photo: Support lazy loading and fallback for broken images
    const photo = document.createElement('img');
    photo.src = data.photo;
    photo.alt = data.name;
    photo.className = 'tile-photo';
    photo.loading = 'lazy';
    photo.onerror = () => {
        // Hide the broken image icon and keep the placeholder space if the image URL is broken
        photo.style.visibility = 'hidden';
    };

    // 3. Name
    const name = document.createElement('h3');
    name.textContent = data.name;

    // 4. Interest (remove "Interest:" prefix, show content only)
    const interest = document.createElement('p');
    interest.textContent = data.interest;

    // 5. Set border color and glow based on Net Worth, do not display the number text directly
    const color = getNetWorthColor(data.netWorth);
    element.style.borderColor = color;
    element.style.background = `${color}22`;
    element.style.boxShadow = `0 0 12px ${color}88`;

    // Show exact Net Worth amount on mouse hover
    element.title = `Net Worth: $${data.netWorth.toLocaleString()}`;

    // Assemble card elements in order: Top (Country + Age) -> Photo -> Name -> Interest
    element.append(top, photo, name, interest);

    return new CSS3DObject(element);
}

// ========================================
// 9. Camera Fit & Transition Functions
// ========================================

function fitCameraTo(bounds) {
    // Save bounds for use when resizing the window
    lastBounds = bounds;

    // Call the extracted pure math calculation function to get the base distance
    const distance = computeFitDistance(bounds, camera.fov, camera.aspect);

    // Add buffer space and set camera position
    const buffer = 1.1;
    const finalDistance = distance * buffer;

    camera.position.set(0, 0, finalDistance);
    camera.up.set(0, 1, 0);

    controls.target.set(0, 0, 0);
    controls.update();
}

function startTransition(targets) {
    activeTransition = {
        startTime: performance.now(),
        duration: 1200,
        objects: tileObjects.map((object, index) => ({
            object,
            startPosition: object.position.clone(),
            targetPosition: targets[index].position,
            startQuaternion: object.quaternion.clone(),
            targetQuaternion: targets[index].quaternion,
            startScale: object.scale.x,
            targetScale: targets[index].scale
        }))
    };
}

function updateTransition() {
    if (!activeTransition) return;

    const transition = activeTransition;
    const elapsed = performance.now() - transition.startTime;
    const progress = Math.min(elapsed / transition.duration, 1);

    // Smooth easing
    const eased = progress * progress * (3 - 2 * progress);

    transition.objects.forEach(item => {
        const object = item.object;

        // Position
        object.position.lerpVectors(
            item.startPosition,
            item.targetPosition,
            eased
        );

        // Rotation
        object.quaternion.slerpQuaternions(
            item.startQuaternion,
            item.targetQuaternion,
            eased
        );

        // Scale
        const scale =
            item.startScale +
            (item.targetScale - item.startScale) * eased;

        object.scale.setScalar(scale);
    });

    if (progress >= 1) {
        activeTransition = null;
    }
}

// ========================================
// 10. Create 200 Tiles & Layout Transform
// ========================================

function createTiles(records) {
    // Remove old tiles first so reconnecting does not duplicate them
    tileObjects.forEach(object => scene.remove(object));
    tileObjects.length = 0;

    records.forEach(data => {
        const object = createTile(data);
        tileObjects.push(object);
        scene.add(object);
    });

    transformLayout('table');
}

function transformLayout(layout) {
    const targets = [];
    const total = tileObjects.length;
    
    if (total === 0) return; 
    
    const dummy = new THREE.Object3D();

    for (let i = 0; i < total; i++) {
        const { x, y, z, faceOutward } = computeLayoutPosition(layout, i, total);
        const position = new THREE.Vector3(x, y, z);

        dummy.position.copy(position);
        if (faceOutward) dummy.lookAt(position.clone().multiplyScalar(2));
        else dummy.quaternion.identity();

        targets.push({ position, quaternion: dummy.quaternion.clone(), scale: 1 });
    }

    startTransition(targets);

    // Calculate bounds and pass to fitCameraTo
    fitCameraTo(getBounds(targets, 170, 250));
}

// ========================================
// 11. Layout Button Events
// ========================================

document.getElementById('tableButton').addEventListener('click', () => {
    transformLayout('table');
});

document.getElementById('sphereButton').addEventListener('click', () => {
    transformLayout('sphere');
});

document.getElementById('helixButton').addEventListener('click', () => {
    transformLayout('helix');
});

document.getElementById('gridButton').addEventListener('click', () => {
    transformLayout('grid');
});

// ========================================
// 12. Update Status & Animation Loop
// ========================================

function updateStatus(message, isError = false) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;

    // Add 'error' class to make it red if it's an error message; otherwise remove it
    if (isError) {
        statusEl.classList.add('error');
    } else {
        statusEl.classList.remove('error');
    }
}

function animate() {
    requestAnimationFrame(animate);
    updateTransition();
    controls.update();
    renderer.render(scene, camera);
}

animate();

// ========================================
// 13. Window Resize
// ========================================

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);

    if (lastBounds) {
        fitCameraTo(lastBounds);
    }
});