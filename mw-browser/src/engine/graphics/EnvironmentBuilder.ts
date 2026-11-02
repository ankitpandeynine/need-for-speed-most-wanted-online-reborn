/**
 * Need for Speed: Most Wanted (2005) - 3D Environment Builder
 * Constructs the signature Rockport Highway 99 corridor:
 * - High-resolution asphalt texture with tire skid marks and highway striping
 * - Galvanized steel guardrails and overhead route sign gantries
 * - Destructible roadside pursuit breakers (water barrels with hazard stripes)
 * - Concrete highway overpass bridges
 * - Sodium-vapor streetlights with warm amber illumination
 * - Autumn golden oak and maple trees lining the highway verges
 * - Industrial brick factories and distant Rockport skyline towers
 */

import * as THREE from 'three';

export interface RoadChunk {
  group: THREE.Group;
  zOffset: number;
}

export class EnvironmentBuilder {
  public static readonly CHUNK_LENGTH = 160; // Length of each road chunk
  public static readonly ROAD_WIDTH = 24; // 4 wide highway lanes + shoulders
  public static readonly CHUNK_COUNT = 6; // Active circulating chunks ahead and behind

  private static asphaltTexture: THREE.CanvasTexture | null = null;

  /**
   * Generates a high-resolution asphalt canvas texture with aggregate pebbles and tire skid marks.
   */
  public static getAsphaltTexture(): THREE.CanvasTexture {
    if (EnvironmentBuilder.asphaltTexture) return EnvironmentBuilder.asphaltTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Base dark charcoal asphalt
      ctx.fillStyle = '#1c1e22';
      ctx.fillRect(0, 0, 512, 512);

      // Aggregate grain noise
      const imgData = ctx.getImageData(0, 0, 512, 512);
      const data = imgData.data;
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 32;
        data[i] = Math.min(255, Math.max(0, data[i] + noise));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
      }
      ctx.putImageData(imgData, 0, 0);

      // Heavy curved tire rubber skid marks
      ctx.strokeStyle = 'rgba(8, 9, 12, 0.55)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.moveTo(110, 0);
      ctx.bezierCurveTo(140, 160, 95, 340, 125, 512);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(145, 0);
      ctx.bezierCurveTo(175, 160, 130, 340, 160, 512);
      ctx.stroke();

      // Right lane skid mark
      ctx.strokeStyle = 'rgba(8, 9, 12, 0.42)';
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(350, 40);
      ctx.bezierCurveTo(370, 190, 340, 360, 380, 512);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 16);
    EnvironmentBuilder.asphaltTexture = tex;
    return tex;
  }

  /**
   * Builds a reusable road segment with highway asphalt, markings, guardrails, trees, and streetlights.
   */
  public static buildRoadChunk(chunkIndex: number): RoadChunk {
    const group = new THREE.Group();
    group.name = `RoadChunk_${chunkIndex}`;

    // Materials
    const asphaltMaterial = new THREE.MeshStandardMaterial({
      map: EnvironmentBuilder.getAsphaltTexture(),
      roughness: 0.82,
      metalness: 0.18,
    });

    const grassMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a482b, // Autumn brownish-green grass
      roughness: 0.95,
      metalness: 0.05,
    });

    const roadMarkingYellow = new THREE.MeshBasicMaterial({ color: 0xe6a817 });
    const roadMarkingWhite = new THREE.MeshBasicMaterial({ color: 0xdedede });
    const guardrailMaterial = new THREE.MeshStandardMaterial({
      color: 0x8a9299,
      metalness: 0.85,
      roughness: 0.35,
    });

    // 1. Asphalt Road Surface with tire skid texture
    const roadGeo = new THREE.PlaneGeometry(EnvironmentBuilder.ROAD_WIDTH, EnvironmentBuilder.CHUNK_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMesh = new THREE.Mesh(roadGeo, asphaltMaterial);
    roadMesh.position.y = 0;
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // 2. Grassy / Dirt Embankments on Left and Right
    const embankmentGeo = new THREE.PlaneGeometry(60, EnvironmentBuilder.CHUNK_LENGTH);
    embankmentGeo.rotateX(-Math.PI / 2);

    const leftEmbankment = new THREE.Mesh(embankmentGeo, grassMaterial);
    leftEmbankment.position.set(-42, -0.05, 0);
    leftEmbankment.receiveShadow = true;
    group.add(leftEmbankment);

    const rightEmbankment = new THREE.Mesh(embankmentGeo, grassMaterial);
    rightEmbankment.position.set(42, -0.05, 0);
    rightEmbankment.receiveShadow = true;
    group.add(rightEmbankment);

    // 3. Lane Markings
    // Center double yellow line
    for (let z = -EnvironmentBuilder.CHUNK_LENGTH / 2 + 5; z < EnvironmentBuilder.CHUNK_LENGTH / 2; z += 12) {
      const yellowLineGeo = new THREE.PlaneGeometry(0.18, 6.5);
      yellowLineGeo.rotateX(-Math.PI / 2);

      const yl1 = new THREE.Mesh(yellowLineGeo, roadMarkingYellow);
      yl1.position.set(-0.25, 0.015, z);
      group.add(yl1);

      const yl2 = new THREE.Mesh(yellowLineGeo, roadMarkingYellow);
      yl2.position.set(0.25, 0.015, z);
      group.add(yl2);
    }

    // Lane dividing white dashed lines (at x = -5.5 and x = +5.5)
    for (let z = -EnvironmentBuilder.CHUNK_LENGTH / 2 + 3; z < EnvironmentBuilder.CHUNK_LENGTH / 2; z += 10) {
      const whiteLineGeo = new THREE.PlaneGeometry(0.2, 5.0);
      whiteLineGeo.rotateX(-Math.PI / 2);

      const wlLeft = new THREE.Mesh(whiteLineGeo, roadMarkingWhite);
      wlLeft.position.set(-5.5, 0.015, z);
      group.add(wlLeft);

      const wlRight = new THREE.Mesh(whiteLineGeo, roadMarkingWhite);
      wlRight.position.set(5.5, 0.015, z);
      group.add(wlRight);
    }

    // Outer solid shoulder lines (at x = -11.0 and x = +11.0)
    const solidLineGeo = new THREE.PlaneGeometry(0.25, EnvironmentBuilder.CHUNK_LENGTH);
    solidLineGeo.rotateX(-Math.PI / 2);

    const leftSolid = new THREE.Mesh(solidLineGeo, roadMarkingWhite);
    leftSolid.position.set(-11.0, 0.015, 0);
    group.add(leftSolid);

    const rightSolid = new THREE.Mesh(solidLineGeo, roadMarkingWhite);
    rightSolid.position.set(11.0, 0.015, 0);
    group.add(rightSolid);

    // 4. Galvanized Steel Guardrails with Support Posts
    const railGeo = new THREE.BoxGeometry(0.12, 0.42, EnvironmentBuilder.CHUNK_LENGTH);
    const leftRail = new THREE.Mesh(railGeo, guardrailMaterial);
    leftRail.position.set(-11.8, 0.45, 0);
    group.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, guardrailMaterial);
    rightRail.position.set(11.8, 0.45, 0);
    group.add(rightRail);

    // Support Posts every 8 units
    const postGeo = new THREE.BoxGeometry(0.14, 0.55, 0.14);
    for (let z = -EnvironmentBuilder.CHUNK_LENGTH / 2 + 4; z < EnvironmentBuilder.CHUNK_LENGTH / 2; z += 8) {
      const leftPost = new THREE.Mesh(postGeo, guardrailMaterial);
      leftPost.position.set(-11.8, 0.27, z);
      group.add(leftPost);

      const rightPost = new THREE.Mesh(postGeo, guardrailMaterial);
      rightPost.position.set(11.8, 0.27, z);
      group.add(rightPost);
    }

    // 5. Sodium Streetlights along the highway
    for (let z = -EnvironmentBuilder.CHUNK_LENGTH / 2 + 20; z < EnvironmentBuilder.CHUNK_LENGTH / 2; z += 40) {
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 9, 8);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x444b52, metalness: 0.8 });
      const leftPole = new THREE.Mesh(poleGeo, poleMat);
      leftPole.position.set(-13.5, 4.5, z);
      group.add(leftPole);

      // Curved light arm
      const armGeo = new THREE.BoxGeometry(3.5, 0.12, 0.12);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(-12.0, 8.8, z);
      group.add(arm);

      // Amber Sodium lamp head
      const lampHeadGeo = new THREE.BoxGeometry(0.7, 0.15, 0.4);
      const lampMat = new THREE.MeshBasicMaterial({ color: 0xffaa22 });
      const lamp = new THREE.Mesh(lampHeadGeo, lampMat);
      lamp.position.set(-10.4, 8.7, z);
      group.add(lamp);

      // Soft amber ground light pool
      const streetLight = new THREE.PointLight(0xffa526, 1.2, 28, 1.4);
      streetLight.position.set(-10.4, 8.2, z);
      group.add(streetLight);
    }

    // 6. Autumn Oak & Maple Trees (The signature Most Wanted golden autumn look)
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2716, roughness: 0.9 });
    const leafColors = [0xd1781b, 0xbf5311, 0xde9b21, 0xa84111, 0xb8881f];

    for (let i = 0; i < 14; i++) {
      const isLeft = i % 2 === 0;
      const xPos = isLeft ? -16 - Math.random() * 20 : 16 + Math.random() * 20;
      const zPos = -EnvironmentBuilder.CHUNK_LENGTH / 2 + i * 11 + Math.random() * 5;

      const treeGroup = new THREE.Group();
      treeGroup.position.set(xPos, 0, zPos);

      // Trunk
      const trunkH = 4.5 + Math.random() * 2.5;
      const trunkGeo = new THREE.CylinderGeometry(0.35, 0.55, trunkH, 7);
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = trunkH / 2;
      treeGroup.add(trunk);

      // Autumn Foliage Crown
      const foliageColor = leafColors[Math.floor(Math.random() * leafColors.length)];
      const foliageMat = new THREE.MeshStandardMaterial({
        color: foliageColor,
        roughness: 0.85,
        flatShading: true,
      });

      const foliageGeo = new THREE.DodecahedronGeometry(2.8 + Math.random() * 1.6, 1);
      const foliage = new THREE.Mesh(foliageGeo, foliageMat);
      foliage.position.y = trunkH + 1.8;
      treeGroup.add(foliage);

      group.add(treeGroup);
    }

    // 7. Highway Overhead Gantry Sign (Placed once every 2 chunks)
    if (chunkIndex % 2 === 0) {
      EnvironmentBuilder.addOverheadGantry(group);
    }

    // 8. Concrete Highway Overpass Bridge (Placed on odd chunks)
    if (chunkIndex % 2 === 1) {
      EnvironmentBuilder.addHighwayBridge(group);
    }

    // 9. Roadside Pursuit Breakers (Water Barrels with hazard stripes)
    EnvironmentBuilder.addPursuitBreakers(group, chunkIndex);

    // 10. Distant Industrial Warehouses / Skyline Silhouettes
    EnvironmentBuilder.addCityScenery(group, chunkIndex);

    return {
      group,
      zOffset: chunkIndex * EnvironmentBuilder.CHUNK_LENGTH,
    };
  }

  /**
   * Adds an authentic green overhead highway gantry sign across the 4 lanes.
   */
  private static addOverheadGantry(group: THREE.Group) {
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x3e454f, metalness: 0.85 });

    // Vertical Support Columns
    const colGeo = new THREE.BoxGeometry(0.6, 9.5, 0.6);
    const leftCol = new THREE.Mesh(colGeo, metalMat);
    leftCol.position.set(-13.0, 4.75, 20);
    group.add(leftCol);

    const rightCol = new THREE.Mesh(colGeo, metalMat);
    rightCol.position.set(13.0, 4.75, 20);
    group.add(rightCol);

    // Overhead Truss Crossbeam
    const beamGeo = new THREE.BoxGeometry(26.8, 0.9, 0.8);
    const beam = new THREE.Mesh(beamGeo, metalMat);
    beam.position.set(0, 8.8, 20);
    group.add(beam);

    // Green Directional Highway Signs with Canvas Textures
    const signTex1 = EnvironmentBuilder.createSignTexture(
      'NORTH 99',
      'ROCKPORT EXPRESSWAY',
      'ROSEWOOD  2 MI'
    );
    const signMat1 = new THREE.MeshStandardMaterial({ map: signTex1, roughness: 0.4 });
    const signGeo = new THREE.BoxGeometry(7.8, 2.8, 0.15);
    const sign1 = new THREE.Mesh(signGeo, signMat1);
    sign1.position.set(-4.5, 7.8, 20.4);
    group.add(sign1);

    const signTex2 = EnvironmentBuilder.createSignTexture(
      'EXIT 14A',
      'CAMDEN BEACH',
      'DOWNTOWN ROCKPORT'
    );
    const signMat2 = new THREE.MeshStandardMaterial({ map: signTex2, roughness: 0.4 });
    const sign2 = new THREE.Mesh(signGeo, signMat2);
    sign2.position.set(4.5, 7.8, 20.4);
    group.add(sign2);
  }

  /**
   * Adds a concrete highway overpass bridge spanning the 4 lanes.
   */
  private static addHighwayBridge(group: THREE.Group) {
    const concreteMat = new THREE.MeshStandardMaterial({
      color: 0x555d66,
      roughness: 0.9,
    });

    // Bridge Deck
    const deckGeo = new THREE.BoxGeometry(34, 1.8, 12);
    const bridgeDeck = new THREE.Mesh(deckGeo, concreteMat);
    bridgeDeck.position.set(0, 7.5, -30);
    bridgeDeck.castShadow = true;
    bridgeDeck.receiveShadow = true;
    group.add(bridgeDeck);

    // Bridge Support Pillars on sides
    const pillarGeo = new THREE.BoxGeometry(2.4, 7.0, 2.4);
    const leftPillar = new THREE.Mesh(pillarGeo, concreteMat);
    leftPillar.position.set(-13.5, 3.5, -30);
    leftPillar.castShadow = true;
    group.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, concreteMat);
    rightPillar.position.set(13.5, 3.5, -30);
    rightPillar.castShadow = true;
    group.add(rightPillar);
  }

  /**
   * Adds roadside pursuit breakers (yellow impact water barrels with hazard stripes).
   */
  private static addPursuitBreakers(group: THREE.Group, chunkIndex: number) {
    const barrelYellowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.5,
    });
    const barrelGeo = new THREE.CylinderGeometry(0.42, 0.45, 1.1, 12);

    // Place cluster of 6 impact barrels at highway shoulder
    const side = chunkIndex % 2 === 0 ? -11.2 : 11.2;
    for (let i = 0; i < 4; i++) {
      const barrel = new THREE.Mesh(barrelGeo, barrelYellowMat);
      barrel.position.set(side, 0.55, -40 + i * 1.4);
      barrel.castShadow = true;
      group.add(barrel);
    }
  }

  private static createSignTexture(top: string, middle: string, bottom: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 180;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Highway Green background with white border
      ctx.fillStyle = '#0a522c';
      ctx.fillRect(0, 0, 512, 180);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 6;
      ctx.strokeRect(6, 6, 500, 168);

      // Top Header / Route
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(top, 24, 42);

      // Main Destination
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(middle, 24, 96);

      // Sub Destination / Mileage
      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(bottom, 24, 146);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }

  /**
   * Adds industrial warehouses, brick smokestacks, and distant skyline towers.
   */
  private static addCityScenery(group: THREE.Group, chunkIndex: number) {
    const buildingMat = new THREE.MeshStandardMaterial({
      color: 0x2d333b,
      roughness: 0.8,
      metalness: 0.2,
    });

    const brickMat = new THREE.MeshStandardMaterial({
      color: 0x5a2d1d,
      roughness: 0.9,
    });

    // Warehouses in midground
    const warehouseGeo = new THREE.BoxGeometry(22, 10, 36);
    const warehouse = new THREE.Mesh(warehouseGeo, buildingMat);
    const side = chunkIndex % 2 === 0 ? -55 : 55;
    warehouse.position.set(side, 5, 0);
    group.add(warehouse);

    // Brick Factory Chimney / Smokestack
    const chimneyGeo = new THREE.CylinderGeometry(1.6, 2.2, 28, 12);
    const chimney = new THREE.Mesh(chimneyGeo, brickMat);
    chimney.position.set(side + (side < 0 ? -12 : 12), 14, 10);
    group.add(chimney);

    // Distant Downtown Skyscrapers (Distant silhouette at x = ±140)
    for (let i = 0; i < 3; i++) {
      const towerH = 45 + Math.random() * 50;
      const towerGeo = new THREE.BoxGeometry(18 + Math.random() * 12, towerH, 18 + Math.random() * 12);
      const tower = new THREE.Mesh(towerGeo, buildingMat);
      tower.position.set((side < 0 ? -140 : 140) + (i - 1) * 28, towerH / 2, -40 + i * 40);
      group.add(tower);
    }
  }
}
