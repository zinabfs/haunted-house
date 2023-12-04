import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";

/**
 * Base
 */
const gui = new GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader();

/**
 * Tower
 */
const towerGroup = new THREE.Group();
scene.add(towerGroup);

// Floor
const grassTexture = textureLoader.load("/textures/grass/color.jpg");
grassTexture.wrapS = THREE.RepeatWrapping;
grassTexture.wrapT = THREE.RepeatWrapping;
grassTexture.repeat.set(10, 10);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({ map: grassTexture }),
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = 0;
floor.receiveShadow = true;
towerGroup.add(floor);

const bricksTexture = textureLoader.load("/textures/bricks/old.jpg");
bricksTexture.wrapS = THREE.RepeatWrapping;
bricksTexture.wrapT = THREE.RepeatWrapping;
bricksTexture.repeat.set(4, 4);

// Tower walls
const towerWalls = new THREE.Mesh(
  new THREE.CylinderGeometry(2, 2, 10, 32),
  new THREE.MeshStandardMaterial({ map: bricksTexture }),
);
towerWalls.position.y = 5;
towerWalls.castShadow = true;
towerGroup.add(towerWalls);

// Tower roof
const towerRoof = new THREE.Mesh(
  new THREE.ConeGeometry(2.5, 2, 32),
  new THREE.MeshStandardMaterial({ color: "#885432" }),
);
towerRoof.position.y = 11;
towerGroup.add(towerRoof);

const doorTexture = textureLoader.load("/textures/door/door.jpg");
doorTexture.wrapS = THREE.RepeatWrapping;
doorTexture.wrapT = THREE.RepeatWrapping;
doorTexture.repeat.set(1, 1);

// Door
const beforeDoor = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2),
  new THREE.MeshStandardMaterial({ color: "#6c757d" }),
);
beforeDoor.position.set(0, 1, 1.5);
towerGroup.add(beforeDoor);

const door = new THREE.Mesh(
  new THREE.PlaneGeometry(1.5, 2),
  new THREE.MeshStandardMaterial({ map: doorTexture }),
);
door.position.set(0, 0.8, 2.001);
door.castShadow = true;
towerGroup.add(door);

/**
 * Tombstones
 */
const tombstonesGroup = new THREE.Group();
scene.add(tombstonesGroup);

const createTombstone = () => {
  const tombstone = new THREE.Mesh(
    new THREE.BoxGeometry(1, 2, 0.2),
    new THREE.MeshStandardMaterial({ color: "#a0a19f" }),
  );

  const scale = 0.5 + Math.random();
  tombstone.scale.set(scale, scale, scale);

  tombstone.rotation.y = Math.random() * Math.PI * 2;
  tombstone.rotation.z = Math.random() * Math.PI * 0.01;

  return tombstone;
};

const checkCollision = (proposedPosition, tombstones) => {
  for (const tombstone of tombstones) {
    const distance = proposedPosition.distanceTo(tombstone.position);
    if (distance < tombstone.scale.x + 1) {
      return true;
    }
  }
  return false;
};

const placeTombstonesRandomly = () => {
  const numTombstones = 100;

  for (let i = 0; i < numTombstones; i++) {
    let position;
    let attempts = 0;

    do {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 15;

      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      position = new THREE.Vector3(x, 0, z);

      attempts++;
      if (attempts > 100) {
        console.warn("Unable to find a suitable position for tombstone");
        break;
      }
    } while (checkCollision(position, tombstonesGroup.children));

    const tombstone = createTombstone();
    tombstone.position.copy(position);
    tombstone.castShadow = true;
    tombstonesGroup.add(tombstone);
  }
};

placeTombstonesRandomly();

/**
 * Bushes
 */
const bushesGroup = new THREE.Group();
scene.add(bushesGroup);

const createBush = () => {
  return new THREE.Mesh(
    new THREE.SphereGeometry(0.7, 8, 8),
    new THREE.MeshStandardMaterial({ color: "#5c995c" }),
  );
};

const placeBushesRandomly = () => {
  const numBushes = 20;

  for (let i = 0; i < numBushes; i++) {
    const angle = Math.random() * Math.PI * 3;
    const radius = 2 * Math.random() * 8;

    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;

    const bush = createBush();
    bush.position.set(x, 0.5, z);
    bush.castShadow = true;
    bushesGroup.add(bush);
  }
};

placeBushesRandomly();

/**
 * Ghosts
 */
const ghostsGroup = new THREE.Group();
scene.add(ghostsGroup);

const createGhost = () => {
  const ghostLight = new THREE.PointLight("#ffffff", 2, 5);
  const angle = Math.random() * Math.PI * 2;
  const radius = 10 + Math.random() * 5;

  ghostLight.position.set(
    Math.cos(angle) * radius,
    1 + Math.random() * 5,
    Math.sin(angle) * radius,
  );

  const ghostMaterial = new THREE.MeshBasicMaterial({
    color: "#ffffff",
    transparent: true,
    opacity: 0.5,
  });

  const ghostVisual = new THREE.Mesh(
    new THREE.SphereGeometry(0.8, 16, 16),
    ghostMaterial,
  );

  ghostLight.add(ghostVisual);
  ghostLight.castShadow = true;
  ghostsGroup.add(ghostLight);

  ghostLight.userData = {
    initialPosition: ghostLight.position.clone(),
    speed: 0.005 + Math.random() * 3,
  };
};

const createRandomGhosts = (numGhosts) => {
  for (let i = 0; i < numGhosts; i++) {
    createGhost();
  }
};

createRandomGhosts(10);

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight("#b9d5ff", 0.2);
scene.add(ambientLight);

const moonLight = new THREE.DirectionalLight("#b9d5ff", 0.5);
moonLight.position.set(4, 5, -2);
moonLight.castShadow = true;
scene.add(moonLight);

const warmPointLight = new THREE.PointLight("#ffcc00", 2, 10);
warmPointLight.position.set(0, 3, 3);
warmPointLight.castShadow = true;
towerGroup.add(warmPointLight);

/**
 * Fog
 */
const fogColor = new THREE.Color("#082f2b");
const near = 10;
const far = 50;
scene.fog = new THREE.Fog(fogColor, near, far);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.x = 8;
camera.position.y = 8;
camera.position.z = 15;
scene.add(camera);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(fogColor);

/**
 * Shadows
 */
const enableShadows = () => {
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
};

enableShadows();

/**
 * Animate
 */
const clock = new THREE.Clock();
const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  ghostsGroup.children.forEach((ghost) => {
    const { initialPosition, speed } = ghost.userData;

    ghost.position.x = initialPosition.x + Math.sin(elapsedTime * speed);
    ghost.position.z = initialPosition.z + Math.cos(elapsedTime * speed);
  });

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
