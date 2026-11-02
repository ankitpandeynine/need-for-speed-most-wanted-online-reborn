/**
 * Need for Speed: Most Wanted (2005) - 3D Car Model Builder
 * Constructs high-fidelity 3D vehicles:
 * 1. BMW M3 GTR E46 (The Hero Car with widebody aero, side exhausts, GT wing, BBS rims, dual racing stripes)
 * 2. Rockport Police Interceptor (Sgt. Cross style pursuit cruiser with emergency lightbars and bullbar)
 */

import * as THREE from 'three';

export interface CarComponents {
  root: THREE.Group;
  bodyMesh: THREE.Mesh;
  wheelFL: THREE.Group;
  wheelFR: THREE.Group;
  wheelRL: THREE.Group;
  wheelRR: THREE.Group;
  brakeLights: THREE.Mesh[];
  headlights: THREE.Mesh[];
  exhaustFlameL: THREE.Mesh;
  exhaustFlameR: THREE.Mesh;
  exhaustLightL: THREE.PointLight;
  exhaustLightR: THREE.PointLight;
}

export interface PoliceCarComponents {
  root: THREE.Group;
  bodyMesh: THREE.Mesh;
  wheelFL: THREE.Group;
  wheelFR: THREE.Group;
  wheelRL: THREE.Group;
  wheelRR: THREE.Group;
  redStrobeLight: THREE.PointLight;
  blueStrobeLight: THREE.PointLight;
  redLens: THREE.Mesh;
  blueLens: THREE.Mesh;
}

export class CarModelBuilder {
  /**
   * Builds the iconic Need for Speed: Most Wanted BMW M3 GTR (E46).
   */
  public static buildBMWM3GTR(): CarComponents {
    const root = new THREE.Group();
    root.name = 'BMWM3GTR';

    // Materials
    // Metallic Silver-White clearcoat paint
    const carPaintMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xdae2eb,
      metalness: 0.85,
      roughness: 0.22,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      reflectivity: 0.9,
    });

    // Dark Blue M3 GTR Racing Stripes
    const stripeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x123c84,
      metalness: 0.7,
      roughness: 0.28,
      clearcoat: 1.0,
    });

    // Carbon Fiber / Dull Plastic aero material
    const carbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x16181b,
      roughness: 0.45,
      metalness: 0.35,
    });

    // Tinted Glass
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111c28,
      metalness: 0.2,
      roughness: 0.05,
      transmission: 0.65,
      transparent: true,
      opacity: 0.88,
    });

    // Chrome / Polished Metal
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xeeeeee,
      metalness: 0.95,
      roughness: 0.1,
    });

    // 1. MAIN CHASSIS LOWER BODY
    const lowerBodyGeo = new THREE.BoxGeometry(1.92, 0.45, 4.3);
    const bodyMesh = new THREE.Mesh(lowerBodyGeo, carPaintMaterial);
    bodyMesh.position.y = 0.52;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    root.add(bodyMesh);

    // 2. CABIN / GREENHOUSE (Tapered coupe roof)
    const cabinGeo = new THREE.BoxGeometry(1.48, 0.42, 2.1);
    const cabinMesh = new THREE.Mesh(cabinGeo, carPaintMaterial);
    cabinMesh.position.set(0, 0.88, -0.2);
    cabinMesh.castShadow = true;
    root.add(cabinMesh);

    // Windshield (Front rake)
    const windshieldGeo = new THREE.PlaneGeometry(1.42, 0.62);
    const windshieldMesh = new THREE.Mesh(windshieldGeo, glassMaterial);
    windshieldMesh.position.set(0, 0.85, 0.95);
    windshieldMesh.rotation.x = -Math.PI / 3.4;
    root.add(windshieldMesh);

    // Rear Window (Fastback rake)
    const rearWinGeo = new THREE.PlaneGeometry(1.4, 0.68);
    const rearWinMesh = new THREE.Mesh(rearWinGeo, glassMaterial);
    rearWinMesh.position.set(0, 0.82, -1.35);
    rearWinMesh.rotation.x = Math.PI / 3.2;
    root.add(rearWinMesh);

    // Side Windows
    const sideWinGeo = new THREE.PlaneGeometry(1.8, 0.34);
    const leftWin = new THREE.Mesh(sideWinGeo, glassMaterial);
    leftWin.position.set(-0.75, 0.88, -0.2);
    leftWin.rotation.y = -Math.PI / 2;
    root.add(leftWin);

    const rightWin = new THREE.Mesh(sideWinGeo, glassMaterial);
    rightWin.position.set(0.75, 0.88, -0.2);
    rightWin.rotation.y = Math.PI / 2;
    root.add(rightWin);

    // 3. WIDEBODY FENDER FLARES (Front & Rear)
    const flareGeo = new THREE.BoxGeometry(2.08, 0.36, 0.82);
    const frontFlares = new THREE.Mesh(flareGeo, carPaintMaterial);
    frontFlares.position.set(0, 0.48, 1.25);
    root.add(frontFlares);

    const rearFlares = new THREE.Mesh(flareGeo, carPaintMaterial);
    rearFlares.position.set(0, 0.5, -1.25);
    root.add(rearFlares);

    // 4. ICONIC HOOD WITH BULGE AND DUAL HEAT EXTRACTOR GILLS
    const hoodBulgeGeo = new THREE.BoxGeometry(0.85, 0.08, 1.3);
    const hoodBulge = new THREE.Mesh(hoodBulgeGeo, carPaintMaterial);
    hoodBulge.position.set(0, 0.76, 1.25);
    root.add(hoodBulge);

    // Hood Gills (black vents)
    const gillGeo = new THREE.BoxGeometry(0.18, 0.03, 0.45);
    const leftGill = new THREE.Mesh(gillGeo, carbonMaterial);
    leftGill.position.set(-0.35, 0.77, 1.35);
    leftGill.rotation.y = 0.2;
    root.add(leftGill);

    const rightGill = new THREE.Mesh(gillGeo, carbonMaterial);
    rightGill.position.set(0.35, 0.77, 1.35);
    rightGill.rotation.y = -0.2;
    root.add(rightGill);

    // 5. BLUE RACING STRIPES (Center twin stripes + side chevron decals)
    const hoodStripeGeo = new THREE.PlaneGeometry(0.18, 1.45);
    const leftHoodStripe = new THREE.Mesh(hoodStripeGeo, stripeMaterial);
    leftHoodStripe.position.set(-0.16, 0.775, 1.28);
    leftHoodStripe.rotation.x = -Math.PI / 2;
    root.add(leftHoodStripe);

    const rightHoodStripe = new THREE.Mesh(hoodStripeGeo, stripeMaterial);
    rightHoodStripe.position.set(0.16, 0.775, 1.28);
    rightHoodStripe.rotation.x = -Math.PI / 2;
    root.add(rightHoodStripe);

    // Roof twin stripes
    const roofStripeGeo = new THREE.PlaneGeometry(0.18, 2.05);
    const leftRoofStripe = new THREE.Mesh(roofStripeGeo, stripeMaterial);
    leftRoofStripe.position.set(-0.16, 1.095, -0.2);
    leftRoofStripe.rotation.x = -Math.PI / 2;
    root.add(leftRoofStripe);

    const rightRoofStripe = new THREE.Mesh(roofStripeGeo, stripeMaterial);
    rightRoofStripe.position.set(0.16, 1.095, -0.2);
    rightRoofStripe.rotation.x = -Math.PI / 2;
    root.add(rightRoofStripe);

    // Rear Trunk twin stripes
    const trunkStripeGeo = new THREE.PlaneGeometry(0.18, 0.72);
    const leftTrunkStripe = new THREE.Mesh(trunkStripeGeo, stripeMaterial);
    leftTrunkStripe.position.set(-0.16, 0.755, -1.75);
    leftTrunkStripe.rotation.x = -Math.PI / 2;
    root.add(leftTrunkStripe);

    const rightTrunkStripe = new THREE.Mesh(trunkStripeGeo, stripeMaterial);
    rightTrunkStripe.position.set(0.16, 0.755, -1.75);
    rightTrunkStripe.rotation.x = -Math.PI / 2;
    root.add(rightTrunkStripe);

    // Rear License Plate with "ROCKPORT - MW 2005"
    const plateCanvas = document.createElement('canvas');
    plateCanvas.width = 256;
    plateCanvas.height = 128;
    const pctx = plateCanvas.getContext('2d');
    if (pctx) {
      pctx.fillStyle = '#0a0d14';
      pctx.fillRect(0, 0, 256, 128);
      pctx.strokeStyle = '#f59e0b';
      pctx.lineWidth = 6;
      pctx.strokeRect(4, 4, 248, 120);
      pctx.fillStyle = '#f59e0b';
      pctx.font = 'bold 20px sans-serif';
      pctx.textAlign = 'center';
      pctx.fillText('ROCKPORT', 128, 32);
      pctx.fillStyle = '#ffffff';
      pctx.font = 'bold 44px monospace';
      pctx.fillText('MW 2005', 128, 85);
      pctx.fillStyle = '#94a3b8';
      pctx.font = 'bold 16px sans-serif';
      pctx.fillText('BLACK EDITION', 128, 114);
    }
    const plateTex = new THREE.CanvasTexture(plateCanvas);
    const plateMat = new THREE.MeshStandardMaterial({ map: plateTex, roughness: 0.3 });
    const plateGeo = new THREE.PlaneGeometry(0.58, 0.28);
    const plateMesh = new THREE.Mesh(plateGeo, plateMat);
    plateMesh.position.set(0, 0.42, -2.16);
    plateMesh.rotation.y = Math.PI;
    root.add(plateMesh);

    // Quad Chrome Exhaust Tips in Rear Diffuser
    const rearTipGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.22, 16);
    rearTipGeo.rotateX(Math.PI / 2);

    [-0.48, -0.38, 0.38, 0.48].forEach((x) => {
      const tip = new THREE.Mesh(rearTipGeo, chromeMaterial);
      tip.position.set(x, 0.22, -2.2);
      root.add(tip);
    });

    // Side Chevron Graphics (Blue angle stripes)
    const sideStripeGeo = new THREE.PlaneGeometry(2.3, 0.22);
    const leftSideStripe = new THREE.Mesh(sideStripeGeo, stripeMaterial);
    leftSideStripe.position.set(-0.97, 0.52, 0.1);
    leftSideStripe.rotation.y = -Math.PI / 2;
    root.add(leftSideStripe);

    const rightSideStripe = new THREE.Mesh(sideStripeGeo, stripeMaterial);
    rightSideStripe.position.set(0.97, 0.52, 0.1);
    rightSideStripe.rotation.y = Math.PI / 2;
    root.add(rightSideStripe);

    // 6. FRONT BUMPER, SPLITTER, CANARDS & BMW KIDNEY GRILLES
    const frontSplitterGeo = new THREE.BoxGeometry(2.0, 0.05, 0.35);
    const frontSplitter = new THREE.Mesh(frontSplitterGeo, carbonMaterial);
    frontSplitter.position.set(0, 0.22, 2.22);
    root.add(frontSplitter);

    // Lower central radiator intake
    const intakeGeo = new THREE.BoxGeometry(1.2, 0.22, 0.1);
    const intakeMesh = new THREE.Mesh(intakeGeo, carbonMaterial);
    intakeMesh.position.set(0, 0.36, 2.18);
    root.add(intakeMesh);

    // Kidney Grilles (Left and Right)
    const kidneyGeo = new THREE.BoxGeometry(0.32, 0.16, 0.05);
    const leftKidney = new THREE.Mesh(kidneyGeo, chromeMaterial);
    leftKidney.position.set(-0.22, 0.62, 2.17);
    root.add(leftKidney);

    const rightKidney = new THREE.Mesh(kidneyGeo, chromeMaterial);
    rightKidney.position.set(0.22, 0.62, 2.17);
    root.add(rightKidney);

    // 7. HIGH-DOWNFORCE CARBON GT WING (SPOILER)
    const wingBladeGeo = new THREE.BoxGeometry(1.86, 0.04, 0.38);
    const wingBlade = new THREE.Mesh(wingBladeGeo, carbonMaterial);
    wingBlade.position.set(0, 1.14, -2.12);
    wingBlade.rotation.x = 0.08;
    root.add(wingBlade);

    // Wing Endplates
    const endplateGeo = new THREE.BoxGeometry(0.03, 0.22, 0.44);
    const leftEndplate = new THREE.Mesh(endplateGeo, carbonMaterial);
    leftEndplate.position.set(-0.93, 1.14, -2.12);
    root.add(leftEndplate);

    const rightEndplate = new THREE.Mesh(endplateGeo, carbonMaterial);
    rightEndplate.position.set(0.93, 1.14, -2.12);
    root.add(rightEndplate);

    // Wing Support Struts
    const strutGeo = new THREE.BoxGeometry(0.04, 0.38, 0.08);
    const leftStrut = new THREE.Mesh(strutGeo, chromeMaterial);
    leftStrut.position.set(-0.45, 0.94, -2.08);
    root.add(leftStrut);

    const rightStrut = new THREE.Mesh(strutGeo, chromeMaterial);
    rightStrut.position.set(0.45, 0.94, -2.08);
    root.add(rightStrut);

    // Rear Lower Diffuser
    const diffuserGeo = new THREE.BoxGeometry(1.7, 0.12, 0.35);
    const diffuser = new THREE.Mesh(diffuserGeo, carbonMaterial);
    diffuser.position.set(0, 0.24, -2.18);
    root.add(diffuser);

    // 8. SIDE-EXIT DUAL EXHAUST TIPS (Ahead of rear wheels!)
    const exhaustTipGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.18, 12);
    exhaustTipGeo.rotateZ(Math.PI / 2);

    const leftExhaust1 = new THREE.Mesh(exhaustTipGeo, chromeMaterial);
    leftExhaust1.position.set(-0.98, 0.25, -0.62);
    root.add(leftExhaust1);

    const leftExhaust2 = new THREE.Mesh(exhaustTipGeo, chromeMaterial);
    leftExhaust2.position.set(-0.98, 0.25, -0.72);
    root.add(leftExhaust2);

    const rightExhaust1 = new THREE.Mesh(exhaustTipGeo, chromeMaterial);
    rightExhaust1.position.set(0.98, 0.25, -0.62);
    root.add(rightExhaust1);

    const rightExhaust2 = new THREE.Mesh(exhaustTipGeo, chromeMaterial);
    rightExhaust2.position.set(0.98, 0.25, -0.72);
    root.add(rightExhaust2);

    // Nitrous Exhaust Flame Cones (Active when NOS is engaged)
    const flameGeo = new THREE.ConeGeometry(0.12, 0.65, 12);
    flameGeo.rotateZ(Math.PI / 2);

    const flameMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d9ff,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });

    const exhaustFlameL = new THREE.Mesh(flameGeo, flameMaterial);
    exhaustFlameL.position.set(-1.32, 0.25, -0.67);
    exhaustFlameL.rotation.y = -Math.PI / 2;
    root.add(exhaustFlameL);

    const exhaustFlameR = new THREE.Mesh(flameGeo, flameMaterial);
    exhaustFlameR.position.set(1.32, 0.25, -0.67);
    exhaustFlameR.rotation.y = Math.PI / 2;
    root.add(exhaustFlameR);

    // Dynamic blue point lights for NOS backfire glow
    const exhaustLightL = new THREE.PointLight(0x00d9ff, 0, 4);
    exhaustLightL.position.set(-1.2, 0.25, -0.67);
    root.add(exhaustLightL);

    const exhaustLightR = new THREE.PointLight(0x00d9ff, 0, 4);
    exhaustLightR.position.set(1.2, 0.25, -0.67);
    root.add(exhaustLightR);

    // 9. LIGHTS: Xenon Projector Headlights & Red LED Taillights
    const headlightGeo = new THREE.BoxGeometry(0.38, 0.15, 0.08);
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xebf4ff });
    const leftHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    leftHeadlight.position.set(-0.72, 0.6, 2.15);
    root.add(leftHeadlight);

    const rightHeadlight = new THREE.Mesh(headlightGeo, headlightMat);
    rightHeadlight.position.set(0.72, 0.6, 2.15);
    root.add(rightHeadlight);

    // Projector beams projecting forward onto the road
    const beamLightL = new THREE.SpotLight(0xfff3db, 2.5, 45, Math.PI / 6, 0.4);
    beamLightL.position.set(-0.72, 0.6, 2.2);
    const targetL = new THREE.Object3D();
    targetL.position.set(-0.72, 0.1, 30);
    root.add(beamLightL);
    root.add(targetL);
    beamLightL.target = targetL;

    const beamLightR = new THREE.SpotLight(0xfff3db, 2.5, 45, Math.PI / 6, 0.4);
    beamLightR.position.set(0.72, 0.6, 2.2);
    const targetR = new THREE.Object3D();
    targetR.position.set(0.72, 0.1, 30);
    root.add(beamLightR);
    root.add(targetR);
    beamLightR.target = targetR;

    // Taillights
    const taillightGeo = new THREE.BoxGeometry(0.42, 0.16, 0.08);
    const taillightMat = new THREE.MeshStandardMaterial({
      color: 0x990000,
      emissive: 0x660000,
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });
    const leftTail = new THREE.Mesh(taillightGeo, taillightMat);
    leftTail.position.set(-0.7, 0.62, -2.15);
    root.add(leftTail);

    const rightTail = new THREE.Mesh(taillightGeo, taillightMat);
    rightTail.position.set(0.7, 0.62, -2.15);
    root.add(rightTail);

    // 10. BBS MULTI-SPOKE RACING WHEELS (4 assemblies)
    const wheelFL = CarModelBuilder.createWheelAssembly(true);
    wheelFL.position.set(-0.95, 0.35, 1.25);
    root.add(wheelFL);

    const wheelFR = CarModelBuilder.createWheelAssembly(false);
    wheelFR.position.set(0.95, 0.35, 1.25);
    root.add(wheelFR);

    const wheelRL = CarModelBuilder.createWheelAssembly(true);
    wheelRL.position.set(-0.95, 0.35, -1.25);
    root.add(wheelRL);

    const wheelRR = CarModelBuilder.createWheelAssembly(false);
    wheelRR.position.set(0.95, 0.35, -1.25);
    root.add(wheelRR);

    return {
      root,
      bodyMesh,
      wheelFL,
      wheelFR,
      wheelRL,
      wheelRR,
      brakeLights: [leftTail, rightTail],
      headlights: [leftHeadlight, rightHeadlight],
      exhaustFlameL,
      exhaustFlameR,
      exhaustLightL,
      exhaustLightR,
    };
  }

  /**
   * Builds the 3D Rockport Police Interceptor (Cruiser / Corvette style).
   */
  public static buildPoliceCruiser(): PoliceCarComponents {
    const root = new THREE.Group();
    root.name = 'PoliceCruiser';

    // Black & White Police Body Paint
    const policeBlackMat = new THREE.MeshPhysicalMaterial({
      color: 0x111113,
      metalness: 0.7,
      roughness: 0.25,
      clearcoat: 1.0,
    });

    const policeWhiteMat = new THREE.MeshPhysicalMaterial({
      color: 0xf5f5f5,
      metalness: 0.5,
      roughness: 0.3,
      clearcoat: 1.0,
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x111620,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.7,
      transparent: true,
      opacity: 0.85,
    });

    const bullbarMat = new THREE.MeshStandardMaterial({
      color: 0x0a0a0a,
      roughness: 0.6,
      metalness: 0.4,
    });

    // Lower Chassis (Black)
    const bodyGeo = new THREE.BoxGeometry(1.9, 0.48, 4.4);
    const bodyMesh = new THREE.Mesh(bodyGeo, policeBlackMat);
    bodyMesh.position.y = 0.52;
    bodyMesh.castShadow = true;
    root.add(bodyMesh);

    // White Center Doors
    const doorGeo = new THREE.BoxGeometry(1.92, 0.42, 1.8);
    const doorMesh = new THREE.Mesh(doorGeo, policeWhiteMat);
    doorMesh.position.set(0, 0.54, 0.0);
    root.add(doorMesh);

    // Roof (White)
    const cabinGeo = new THREE.BoxGeometry(1.48, 0.44, 2.1);
    const cabinMesh = new THREE.Mesh(cabinGeo, policeWhiteMat);
    cabinMesh.position.set(0, 0.9, -0.15);
    root.add(cabinMesh);

    // Windshield
    const windshieldGeo = new THREE.PlaneGeometry(1.42, 0.6);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, 0.86, 0.95);
    windshield.rotation.x = -Math.PI / 3.4;
    root.add(windshield);

    // Heavy Duty Bullbar / Pushbar on Front
    const bullbarGeo = new THREE.BoxGeometry(1.6, 0.45, 0.12);
    const bullbar = new THREE.Mesh(bullbarGeo, bullbarMat);
    bullbar.position.set(0, 0.44, 2.3);
    root.add(bullbar);

    // Emergency Roof Lightbar
    const lightbarBaseGeo = new THREE.BoxGeometry(0.9, 0.06, 0.22);
    const lightbarBase = new THREE.Mesh(lightbarBaseGeo, bullbarMat);
    lightbarBase.position.set(0, 1.15, -0.15);
    root.add(lightbarBase);

    // Red Strobe Lens
    const redLensMat = new THREE.MeshBasicMaterial({ color: 0xff0022 });
    const redLensGeo = new THREE.BoxGeometry(0.38, 0.1, 0.18);
    const redLens = new THREE.Mesh(redLensGeo, redLensMat);
    redLens.position.set(-0.25, 1.2, -0.15);
    root.add(redLens);

    // Blue Strobe Lens
    const blueLensMat = new THREE.MeshBasicMaterial({ color: 0x0066ff });
    const blueLensGeo = new THREE.BoxGeometry(0.38, 0.1, 0.18);
    const blueLens = new THREE.Mesh(blueLensGeo, blueLensMat);
    blueLens.position.set(0.25, 1.2, -0.15);
    root.add(blueLens);

    // Red and Blue Dynamic Strobe Lights
    const redStrobeLight = new THREE.PointLight(0xff0022, 3.5, 30);
    redStrobeLight.position.set(-0.35, 1.35, -0.15);
    root.add(redStrobeLight);

    const blueStrobeLight = new THREE.PointLight(0x0066ff, 3.5, 30);
    blueStrobeLight.position.set(0.35, 1.35, -0.15);
    root.add(blueStrobeLight);

    // Police Wheels
    const wheelFL = CarModelBuilder.createWheelAssembly(true);
    wheelFL.position.set(-0.95, 0.35, 1.25);
    root.add(wheelFL);

    const wheelFR = CarModelBuilder.createWheelAssembly(false);
    wheelFR.position.set(0.95, 0.35, 1.25);
    root.add(wheelFR);

    const wheelRL = CarModelBuilder.createWheelAssembly(true);
    wheelRL.position.set(-0.95, 0.35, -1.25);
    root.add(wheelRL);

    const wheelRR = CarModelBuilder.createWheelAssembly(false);
    wheelRR.position.set(0.95, 0.35, -1.25);
    root.add(wheelRR);

    return {
      root,
      bodyMesh,
      wheelFL,
      wheelFR,
      wheelRL,
      wheelRR,
      redStrobeLight,
      blueStrobeLight,
      redLens,
      blueLens,
    };
  }

  /**
   * Helper: Builds a 3D BBS RE-style racing wheel with tire, rim, spokes, brake rotor, and caliper.
   */
  private static createWheelAssembly(isLeft: boolean): THREE.Group {
    const wheelGroup = new THREE.Group();

    // Tire (Rubber with tread)
    const tireGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.28, 24);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.85,
      metalness: 0.1,
    });
    const tireMesh = new THREE.Mesh(tireGeo, tireMat);
    tireMesh.castShadow = true;
    wheelGroup.add(tireMesh);

    // Rim Outer Lip (Polished silver)
    const rimLipGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.29, 24);
    rimLipGeo.rotateZ(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xd8dde4,
      metalness: 0.9,
      roughness: 0.18,
    });
    const rimLipMesh = new THREE.Mesh(rimLipGeo, rimMat);
    wheelGroup.add(rimLipMesh);

    // Multi-spoke BBS Center
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const spokeGeo = new THREE.BoxGeometry(0.04, 0.24, 0.05);
      const spoke = new THREE.Mesh(spokeGeo, rimMat);
      spoke.position.set(isLeft ? -0.1 : 0.1, 0, 0);
      spoke.rotation.x = angle;
      wheelGroup.add(spoke);
    }

    // Ventilated Brake Rotor (Steel disc)
    const rotorGeo = new THREE.CylinderGeometry(0.21, 0.21, 0.03, 18);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0x8a929e,
      metalness: 0.8,
      roughness: 0.3,
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.x = isLeft ? 0.04 : -0.04;
    wheelGroup.add(rotor);

    // Brembo Red Brake Caliper
    const caliperGeo = new THREE.BoxGeometry(0.08, 0.11, 0.12);
    const caliperMat = new THREE.MeshStandardMaterial({
      color: 0xd91212,
      metalness: 0.5,
      roughness: 0.2,
    });
    const caliper = new THREE.Mesh(caliperGeo, caliperMat);
    caliper.position.set(isLeft ? 0.04 : -0.04, 0.14, 0.08);
    wheelGroup.add(caliper);

    return wheelGroup;
  }
}
