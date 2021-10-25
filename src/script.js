import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { PixelShader } from 'three/examples/jsm/shaders/PixelShader.js';

// DEBUG
const debugObject = {
  clearColor: '#CEF',
};

// CANVAS & SCENE
const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

// LIGHTS
const ambientLight = new THREE.AmbientLight('#DDF', 1.1);
const directionalLight = new THREE.DirectionalLight('#FFAAAA', 1.1);
directionalLight.position.set(10, 15, -12.5);
directionalLight.castShadow = true;
scene.add(ambientLight, directionalLight);

directionalLight.shadow.camera.top = 12;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.bottom = -8;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.near = 12;
directionalLight.shadow.camera.far = 30;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;

// const directionalLightCameraHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera,
// );
// scene.add(directionalLightCameraHelper);

/* PLAY BUTTON */

const button = document.querySelector('.play');
button.addEventListener('click', () => {
  playSoundtrack();
  document.body.classList.add('visible');
});

/* MODELS */

let logo = null;

let chassis = null;
let chassisNoShadow = null;
let frontWheels = null;
let backWheels = null;

let abeFishman = null;
let commanderChaos = null;
let darkSuckaberg = null;
let fingleDan = null;
let joeJonte = null;
let johnnyDanger = null;

let cone1 = null;
let cone2 = null;
let cone3 = null;

let trafficLights = null;
let redLightMaterial = null;

const loadingBar = document.querySelector('.loading-bar');
const loadingManager = new THREE.LoadingManager(
  () => {
    window.setTimeout(() => {
      document.body.classList.add('loaded');
      loadSoundButtons();
      window.requestAnimationFrame(() => {
        loadingBar.style.transform = `translate(-50%, -50%) scale(1, ${
          sizes.height / loadingBar.offsetHeight
        })`;
      });
    }, 500);
  },
  (itemUrl, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal;
    loadingBar.style.transform = `translate(-50%, -50%) scaleX(${progress})`;
  },
);
const gltfLoader = new GLTFLoader(loadingManager);

gltfLoader.load('model-baked.glb', (gltf) => {
  scene.add(gltf.scene);
  logo = gltf.scene.children.find((child) => child.name === 'logo');
  chassis = gltf.scene.children.find((child) => child.name === 'chassis');
  chassisNoShadow = gltf.scene.children.find(
    (child) => child.name === 'chassis-no-shadow',
  );
  frontWheels = gltf.scene.children.find(
    (child) => child.name === 'wheels-front',
  );
  backWheels = gltf.scene.children.find(
    (child) => child.name === 'wheels-back',
  );

  abeFishman = gltf.scene.children.find(
    (child) => child.name === 'abe-fishman',
  );
  commanderChaos = gltf.scene.children.find(
    (child) => child.name === 'commander-chaos',
  );
  darkSuckaberg = gltf.scene.children.find(
    (child) => child.name === 'dark-suckaberg',
  );
  fingleDan = gltf.scene.children.find((child) => child.name === 'fingle-dan');
  joeJonte = gltf.scene.children.find((child) => child.name === 'joe-jonte');
  johnnyDanger = gltf.scene.children.find(
    (child) => child.name === 'johnny-danger',
  );

  cone1 = gltf.scene.children.find((child) => child.name === 'cone-1');
  cone2 = gltf.scene.children.find((child) => child.name === 'cone-2');
  cone3 = gltf.scene.children.find((child) => child.name === 'cone-3');
  trafficLights = gltf.scene.children.find(
    (child) => child.name === 'traffic-lights',
  );

  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.castShadow = true;
      child.receiveShadow = true;

      if (child.material.map) {
        child.material.map.minFilter = THREE.NearestFilter;
        child.customDepthMaterial = new THREE.MeshDistanceMaterial({
          map: child.material.map,
          alphaTest: 0.75,
        });
      }
      if (child.material.name === 'red-light') {
        redLightMaterial = child.material;
      }
    }
  });
  chassisNoShadow.receiveShadow = false;
});

/* TOOLTIPS */

const tooltips = {
  abeFishman: {
    position: new THREE.Vector3(2.3, 3.8, -1),
    element: document.querySelector('.tooltip-abe'),
  },
  commanderChaos: {
    position: new THREE.Vector3(-5.3, 9, 0.5),
    element: document.querySelector('.tooltip-commander'),
  },
  darkSuckaberg: {
    position: new THREE.Vector3(5.7, 3.3, -2.7),
    element: document.querySelector('.tooltip-dark'),
  },
  joeJonte: {
    position: new THREE.Vector3(2.3, 3.8, 1.8),
    element: document.querySelector('.tooltip-joe'),
  },
  johnnyDanger: {
    position: new THREE.Vector3(6.6, 4.5, 3.5),
    element: document.querySelector('.tooltip-johnny'),
  },
  fingleDan: {
    position: new THREE.Vector3(-4.7, 5, -2.2),
    element: document.querySelector('.tooltip-fingle'),
  },
};
const tooltipsArray = Object.values(tooltips);

const updateTooltips = () => {
  tooltipsArray.forEach((tooltip) => {
    const canvasPosition = tooltip.position.clone();
    canvasPosition.project(camera);

    const tooltipPosition = {
      x: (canvasPosition.x * sizes.width) / 2,
      y: -(canvasPosition.y * sizes.height) / 2,
    };

    tooltip.element.style.transform = `translateX(${tooltipPosition.x}px) translateY(${tooltipPosition.y}px)`;
  });
};

// SOUNDS

const abeSoundFiles = [
  'chloroformed.mp3',
  'i-ate-my-poo.mp3',
  'im-also-a-x-nophobe.mp3',
  'im-commin.mp3',
];
const commanderSoundFiles = ['fart-with-reverb.mp3'];
const darkSoundFiles = [
  'im-fingle-dan.mp3',
  'poop-factory.mp3',
  'sucka-suckaberg.mp3',
  'whats-goodie.mp3',
  'why-yo-tire-flat.mp3',
  'YAFIMEE.mp3',
];
const fingleSoundFiles = [
  'awooga-awooga.mp3',
  'help.mp3',
  'HEY-SONIC-LETS-GO.mp3',
  'im-gonna-c-m.mp3',
  'OH-F-CK.mp3',
  'slash-revive.mp3',
  'unban-me.mp3',
];
const joeSoundFiles = [
  'alright.mp3',
  'big-medic-isnt-real.mp3',
  'he-was-ugly.mp3',
  'well.mp3',
  'yeah-yeah.mp3',
];
const johnnySoundFiles = ['AAAAA-AAAAA.mp3', 'its-too-dang-late.mp3'];

const loadSoundButtons = () => {
  const abeSounds = [];
  abeSoundFiles.forEach((filename) => {
    const sound = new Audio(`/sounds/abe-fishman/${filename}`);
    abeSounds.push(sound);
  });
  const commanderSounds = [];
  commanderSoundFiles.forEach((filename) => {
    const sound = new Audio(`/sounds/commander-chaos/${filename}`);
    commanderSounds.push(sound);
  });
  const darkSounds = [];
  darkSoundFiles.forEach((filename) => {
    const sound = new Audio(`/sounds/dark-suckaberg/${filename}`);
    darkSounds.push(sound);
  });
  const fingleSounds = [];
  fingleSoundFiles.forEach((filename) => {
    const sound = new Audio(`/sounds/fingle-dan/${filename}`);
    fingleSounds.push(sound);
  });
  const joeSounds = [];
  joeSoundFiles.forEach((filename) => {
    const sound = new Audio(`/sounds/joe-jonte/${filename}`);
    joeSounds.push(sound);
  });
  const johnnySounds = [];
  johnnySoundFiles.forEach((filename) => {
    const sound = new Audio(`/sounds/johnny-danger/${filename}`);
    johnnySounds.push(sound);
  });

  let sound;
  const playRandomSound = (sounds) => {
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
    sound = sounds[Math.floor(Math.random() * sounds.length)];
    sound.volume = 0.25;
    sound.play();
  };

  tooltips.abeFishman.element.addEventListener('click', () => {
    playRandomSound(abeSounds);
  });
  tooltips.commanderChaos.element.addEventListener('click', () => {
    playRandomSound(commanderSounds);
  });
  tooltips.darkSuckaberg.element.addEventListener('click', () => {
    playRandomSound(darkSounds);
  });
  tooltips.fingleDan.element.addEventListener('click', () => {
    playRandomSound(fingleSounds);
  });
  tooltips.joeJonte.element.addEventListener('click', () => {
    playRandomSound(joeSounds);
  });
  tooltips.johnnyDanger.element.addEventListener('click', () => {
    playRandomSound(johnnySounds);
  });
};

const playSoundtrack = () => {
  const soundtrack = new Audio(`/sounds/soundtrack.mp3`);
  soundtrack.volume = 0.03;
  soundtrack.loop = true;
  soundtrack.play();
};

/* SIZES */

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  effectComposer.setSize(sizes.width, sizes.height);
  effectComposer.render();

  setCameraDistance();
});

/* CAMERA */

let cameraDistance = 20;
const setCameraDistance = () => {
  const deviceCoeficient = Math.max(2, 2560 / sizes.width);
  const modifier = Math.min(16, deviceCoeficient * deviceCoeficient);
  cameraDistance = 16 + modifier;
};
setCameraDistance();

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100,
);
camera.position.set(10, 10, -15);
scene.add(camera);

/* RENDERER */

const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// renderer.outputEncoding = THREE.sRGBEncoding;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setClearColor(debugObject.clearColor);

// POST-PROCESSING

const renderTarget = new THREE.WebGLRenderTarget(800, 600, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat,
  encoding: THREE.sRGBEncoding,
});
const effectComposer = new EffectComposer(renderer, renderTarget);
effectComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
effectComposer.setSize(sizes.width, sizes.height);
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);
const pixelPass = new ShaderPass(PixelShader);
pixelPass.uniforms['resolution'].value = new THREE.Vector2(
  window.innerWidth,
  window.innerHeight,
);
pixelPass.uniforms['resolution'].value.multiplyScalar(window.devicePixelRatio);
pixelPass.uniforms['pixelSize'].value = 0.0001;
effectComposer.addPass(pixelPass);

/* ANIMATE */

const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  if (chassis && frontWheels && backWheels) {
    const frequency = 30;
    const amplitude = 0.008;

    // Camera
    const x = Math.sin(elapsedTime * 0.5) * 0.1 + 2.5;
    camera.position.x = Math.sin(x) * cameraDistance;
    camera.position.z = Math.cos(x) * cameraDistance;
    camera.lookAt(0, 2, 0);

    // Logo
    logo.lookAt(camera.position);
    logo.rotation.y += Math.PI;

    // Wheels
    frontWheels.position.y += Math.cos(elapsedTime * frequency) * amplitude;
    backWheels.position.y += Math.cos(elapsedTime * frequency) * amplitude;
    frontWheels.rotation.x = -elapsedTime * 2;
    backWheels.rotation.x = -elapsedTime * 2;

    // Car & Passengers
    abeFishman.position.y +=
      Math.sin(elapsedTime * frequency + frequency) * amplitude;
    commanderChaos.position.y +=
      Math.sin(elapsedTime * frequency + frequency) * amplitude;
    fingleDan.position.y +=
      Math.sin(elapsedTime * frequency + frequency) * amplitude;
    joeJonte.position.y +=
      Math.sin(elapsedTime * frequency + frequency) * amplitude;
    chassis.position.y += Math.sin(elapsedTime * frequency) * amplitude;
    chassisNoShadow.position.y += Math.sin(elapsedTime * frequency) * amplitude;

    // Outside People
    johnnyDanger.position.y = Math.sin(elapsedTime * 8.25) * 0.15 + 4.05;
    const loopInterval = elapsedTime % 5;
    if (loopInterval > 4) {
      darkSuckaberg.position.x +=
        Math.sin(elapsedTime * frequency * 2) * amplitude * 2;
      darkSuckaberg.position.z +=
        Math.sin(elapsedTime * frequency * 2) * amplitude * 2;
    }

    // Cones
    cone1.rotation.y = -elapsedTime * 1.25;
    cone2.rotation.y = elapsedTime * 1.5;
    cone3.rotation.y = -elapsedTime * 1.75;

    // Traffic Lights
    trafficLights.position.y += (Math.sin(elapsedTime * 1.2) * amplitude) / 2;
    redLightMaterial.emissiveIntensity = Math.sin(elapsedTime * 1.2) + 1;
  }

  // Render
  // renderer.render(scene, camera)
  effectComposer.render();
  updateTooltips();
  window.requestAnimationFrame(tick);
};

tick();
