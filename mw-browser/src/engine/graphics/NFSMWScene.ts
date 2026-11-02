/**
 * Need for Speed: Most Wanted (2005) - 3D Scene & Rendering Engine
 * Manages the Three.js 3D world, camera views, golden-hour autumn lighting,
 * vehicle models, and road streaming.
 */

import * as THREE from 'three';
import { CarModelBuilder, CarComponents, PoliceCarComponents } from './CarModelBuilder';
import { EnvironmentBuilder, RoadChunk } from './EnvironmentBuilder';
import { VehiclePhysics } from '../physics/VehiclePhysics';

export type CameraViewMode = 'chase-far' | 'chase-close' | 'hood' | 'cockpit';

export class NFSMWScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  private playerCar: CarComponents;
  private policeCar: PoliceCarComponents;
  private roadChunks: RoadChunk[] = [];
  private sunLight: THREE.DirectionalLight;
  private sunTarget: THREE.Object3D;

  private currentView: CameraViewMode = 'chase-far';

  // Tire smoke particles
  private smokeParticles: THREE.Points;
  private smokePositions: Float32Array;
  private smokeCount = 180;

  private isRunning: boolean = true;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Renderer setup with high-contrast tone mapping for the 2005 Most Wanted look
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
    });

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || (window.innerHeight - 110) || 720;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;

    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.position = 'absolute';
    this.renderer.domElement.style.top = '0';
    this.renderer.domElement.style.left = '0';
    container.appendChild(this.renderer.domElement);

    // 2. Scene setup with autumn golden-hour fog
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xb87333); // Autumn copper/amber sky
    this.scene.fog = new THREE.FogExp2(0xb87333, 0.0055);

    // 3. Camera setup
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 600);

    // 4. Low-angle Autumn Golden-Hour Sun & Lighting (Signature Most Wanted visual treatment)
    const ambientLight = new THREE.AmbientLight(0xffbe76, 1.2);
    this.scene.add(ambientLight);

    this.sunLight = new THREE.DirectionalLight(0xff9f1a, 2.6);
    this.sunLight.position.set(-40, 45, -30);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 0.5;
    this.sunLight.shadow.camera.far = 250;
    this.sunLight.shadow.camera.left = -30;
    this.sunLight.shadow.camera.right = 30;
    this.sunLight.shadow.camera.top = 30;
    this.sunLight.shadow.camera.bottom = -30;

    this.sunTarget = new THREE.Object3D();
    this.scene.add(this.sunTarget);
    this.sunLight.target = this.sunTarget;
    this.scene.add(this.sunLight);

    // Front/Side Fill Light for car reflections and contours
    const fillLight = new THREE.DirectionalLight(0xffecd2, 1.4);
    fillLight.position.set(40, 25, 30);
    this.scene.add(fillLight);

    // Sky dome / horizon gradient
    const hemiLight = new THREE.HemisphereLight(0xffbe76, 0x4a2e18, 0.75);
    this.scene.add(hemiLight);

    // 5. Build Vehicles
    this.playerCar = CarModelBuilder.buildBMWM3GTR();
    this.scene.add(this.playerCar.root);

    this.policeCar = CarModelBuilder.buildPoliceCruiser();
    this.scene.add(this.policeCar.root);

    // 6. Build Road Chunks
    for (let i = 0; i < EnvironmentBuilder.CHUNK_COUNT; i++) {
      const chunk = EnvironmentBuilder.buildRoadChunk(i);
      chunk.group.position.z = chunk.zOffset;
      this.scene.add(chunk.group);
      this.roadChunks.push(chunk);
    }

    // 7. Tire Smoke Particle System
    this.smokePositions = new Float32Array(this.smokeCount * 3);
    for (let i = 0; i < this.smokeCount * 3; i++) {
      this.smokePositions[i] = 9999; // initially offscreen
    }
    const smokeGeo = new THREE.BufferGeometry();
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(this.smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 1.8,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    this.scene.add(this.smokeParticles);

    // Handle resize
    window.addEventListener('resize', this.handleResize);
  }

  private handleResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth || window.innerWidth || 1280;
    const h = this.container.clientHeight || (window.innerHeight - 110) || 720;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public setCameraView(view: CameraViewMode) {
    this.currentView = view;
  }

  public update(physics: VehiclePhysics, isBraking: boolean) {
    if (!this.isRunning) return;

    // Follow player car with sun light
    this.sunLight.position.set(physics.posX - 40, 45, physics.posZ - 20);
    this.sunTarget.position.set(physics.posX, 1, physics.posZ);

    // 1. Update Player BMW M3 GTR 3D Model
    this.playerCar.root.position.x = physics.posX;
    this.playerCar.root.position.z = physics.posZ;
    this.playerCar.root.rotation.y = physics.heading;
    this.playerCar.root.rotation.x = physics.pitch;
    this.playerCar.root.rotation.z = physics.roll;

    // Front Wheel Steering Angle
    this.playerCar.wheelFL.rotation.y = physics.steerAngle;
    this.playerCar.wheelFR.rotation.y = physics.steerAngle;

    // Wheel Spin Rotation (proportional to distance traveled)
    const wheelSpin = (physics.posZ / 0.35) % (Math.PI * 2);
    this.playerCar.wheelFL.rotation.x = wheelSpin;
    this.playerCar.wheelFR.rotation.x = wheelSpin;
    this.playerCar.wheelRL.rotation.x = wheelSpin;
    this.playerCar.wheelRR.rotation.x = wheelSpin;

    // Brake Lights Illumination
    const brakeColor = isBraking ? 0xff1111 : 0x770000;
    const brakeIntensity = isBraking ? 2.5 : 0.4;
    this.playerCar.brakeLights.forEach((mesh) => {
      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.color.setHex(brakeColor);
      mat.emissive.setHex(brakeColor);
      mat.emissiveIntensity = brakeIntensity;
    });

    // Nitrous Exhaust Flames & Glow
    if (physics.isNosActive) {
      const pulse = 0.85 + Math.random() * 0.35;
      this.playerCar.exhaustFlameL.scale.set(pulse, pulse, pulse * 1.5);
      this.playerCar.exhaustFlameR.scale.set(pulse, pulse, pulse * 1.5);
      (this.playerCar.exhaustFlameL.material as THREE.MeshBasicMaterial).opacity = 0.95;
      (this.playerCar.exhaustFlameR.material as THREE.MeshBasicMaterial).opacity = 0.95;
      this.playerCar.exhaustLightL.intensity = 3.5 * pulse;
      this.playerCar.exhaustLightR.intensity = 3.5 * pulse;
    } else {
      (this.playerCar.exhaustFlameL.material as THREE.MeshBasicMaterial).opacity = 0.0;
      (this.playerCar.exhaustFlameR.material as THREE.MeshBasicMaterial).opacity = 0.0;
      this.playerCar.exhaustLightL.intensity = 0.0;
      this.playerCar.exhaustLightR.intensity = 0.0;
    }

    // 2. Update Rockport Police Cruiser 3D Model
    this.policeCar.root.position.x = physics.policeX;
    this.policeCar.root.position.z = physics.posZ + physics.policeZ;

    // Police Strobe Flash (Alternating high-intensity red and blue)
    const strobeState = Math.floor(physics.policeStrobePhase) % 2 === 0;
    this.policeCar.redStrobeLight.intensity = strobeState ? 4.5 : 0.0;
    this.policeCar.blueStrobeLight.intensity = !strobeState ? 4.5 : 0.0;
    (this.policeCar.redLens.material as THREE.MeshBasicMaterial).color.setHex(strobeState ? 0xff1133 : 0x330005);
    (this.policeCar.blueLens.material as THREE.MeshBasicMaterial).color.setHex(!strobeState ? 0x0088ff : 0x001133);

    // Police wheels spin
    this.policeCar.wheelFL.rotation.x = wheelSpin;
    this.policeCar.wheelFR.rotation.x = wheelSpin;
    this.policeCar.wheelRL.rotation.x = wheelSpin;
    this.policeCar.wheelRR.rotation.x = wheelSpin;

    // 3. Stream Road Chunks as player moves forward
    const totalRoadSpan = EnvironmentBuilder.CHUNK_COUNT * EnvironmentBuilder.CHUNK_LENGTH;
    for (const chunk of this.roadChunks) {
      if (chunk.group.position.z < physics.posZ - EnvironmentBuilder.CHUNK_LENGTH * 1.5) {
        chunk.group.position.z += totalRoadSpan;
      }
    }

    // 4. Update Camera View
    this.updateCamera(physics);

    // 5. Render Scene
    this.renderer.render(this.scene, this.camera);
  }

  private updateCamera(physics: VehiclePhysics) {
    const carPos = this.playerCar.root.position;

    // Dynamic FOV surge at high speeds
    const speedRatio = Math.min(1.0, physics.speedMph / 220);
    const targetFov = (physics.isNosActive ? 78 : 65 + speedRatio * 12);
    this.camera.fov += (targetFov - this.camera.fov) * 0.1;
    this.camera.updateProjectionMatrix();

    // Camera shake at extreme speeds (160+ MPH)
    const shake = physics.speedMph > 160 ? (Math.random() - 0.5) * 0.04 * (physics.speedMph / 200) : 0;

    switch (this.currentView) {
      case 'chase-far': {
        // Classic dynamic NFSMW chase cam with spring lag
        const targetCamX = carPos.x * 0.75 + shake;
        const targetCamY = carPos.y + 2.5 + (physics.speedMph > 100 ? 0.2 : 0);
        const targetCamZ = carPos.z - 7.5;

        this.camera.position.x += (targetCamX - this.camera.position.x) * 0.15;
        this.camera.position.y += (targetCamY - this.camera.position.y) * 0.15;
        this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.22;

        this.camera.lookAt(carPos.x, carPos.y + 1.1, carPos.z + 10);
        break;
      }
      case 'chase-close': {
        // Tight, low angle just behind the carbon rear wing
        const targetCamX = carPos.x * 0.85 + shake;
        const targetCamY = carPos.y + 1.7;
        const targetCamZ = carPos.z - 4.6;

        this.camera.position.x += (targetCamX - this.camera.position.x) * 0.2;
        this.camera.position.y += (targetCamY - this.camera.position.y) * 0.2;
        this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.25;

        this.camera.lookAt(carPos.x, carPos.y + 0.9, carPos.z + 8);
        break;
      }
      case 'hood': {
        // Mounted right on the vented hood
        this.camera.position.set(carPos.x + shake, carPos.y + 0.82, carPos.z + 0.9);
        this.camera.lookAt(carPos.x, carPos.y + 0.8, carPos.z + 30);
        break;
      }
      case 'cockpit': {
        // Behind the steering wheel looking through tinted glass
        this.camera.position.set(carPos.x - 0.35 + shake, carPos.y + 0.92, carPos.z - 0.15);
        this.camera.lookAt(carPos.x - 0.35, carPos.y + 0.9, carPos.z + 20);
        break;
      }
    }
  }

  public destroy() {
    this.isRunning = false;
    window.removeEventListener('resize', this.handleResize);
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
