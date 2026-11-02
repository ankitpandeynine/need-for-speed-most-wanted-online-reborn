import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CarModelBuilder, VEHICLE_CATALOG } from '../engine/graphics/CarModelBuilder';
import {
  Wrench,
  Play,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface GarageViewProps {
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
  onLaunchDrive: (vehicleId: string) => void;
}

export const GarageView: React.FC<GarageViewProps> = ({
  selectedVehicleId,
  onSelectVehicle,
  onLaunchDrive,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [currentCarIndex, setCurrentCarIndex] = useState<number>(
    Math.max(0, VEHICLE_CATALOG.findIndex((v) => v.id === selectedVehicleId))
  );

  const vehicle = VEHICLE_CATALOG[currentCarIndex];

  // 3D Turntable Scene setup
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0f17); // Dark studio

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(5.5, 2.2, 5.5);
    camera.lookAt(0, 0.6, 0);

    // Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xffbe76, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(8, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    fillLight.position.set(-8, 6, -6);
    scene.add(fillLight);

    // Circular Turntable Floor
    const floorGeo = new THREE.CylinderGeometry(4.5, 4.8, 0.2, 48);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x181e2b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.1;
    floor.receiveShadow = true;
    scene.add(floor);

    // Outer Neon Ring
    const ringGeo = new THREE.TorusGeometry(4.6, 0.04, 16, 64);
    ringGeo.rotateX(Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.01;
    scene.add(ring);

    // Car Model
    const car = CarModelBuilder.buildCar(vehicle.id);
    scene.add(car.root);

    let animId: number;
    let rotationAngle = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      rotationAngle += 0.006;
      car.root.rotation.y = rotationAngle;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [vehicle.id]);

  const handleNextCar = () => {
    const nextIdx = (currentCarIndex + 1) % VEHICLE_CATALOG.length;
    setCurrentCarIndex(nextIdx);
    onSelectVehicle(VEHICLE_CATALOG[nextIdx].id);
  };

  const handlePrevCar = () => {
    const prevIdx = (currentCarIndex - 1 + VEHICLE_CATALOG.length) % VEHICLE_CATALOG.length;
    setCurrentCarIndex(prevIdx);
    onSelectVehicle(VEHICLE_CATALOG[prevIdx].id);
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', color: '#fff' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '12px' }}>
            <Wrench size={18} />
            <span>SAFEHOUSE VEHICLE SHOWROOM & CUSTOMIZER</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', textTransform: 'uppercase', margin: '4px 0' }}>
            MY GARAGE
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Inspect your fleet in real-time 3D, compare performance specifications, and select your ride for Rockport Highway 99.
          </p>
        </div>

        {/* Carousel Switcher Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handlePrevCar}
            style={{
              background: 'rgba(16, 20, 28, 0.85)',
              border: '1px solid #283142',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              fontSize: '12px',
            }}
          >
            <ChevronLeft size={16} />
            PREVIOUS CAR
          </button>

          <span style={{ fontSize: '14px', fontWeight: 900, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
            {currentCarIndex + 1} / {VEHICLE_CATALOG.length}
          </span>

          <button
            onClick={handleNextCar}
            style={{
              background: 'rgba(16, 20, 28, 0.85)',
              border: '1px solid #283142',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              fontSize: '12px',
            }}
          >
            NEXT CAR
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Turntable on Left / Vehicle Specs on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '28px' }}>
        {/* 3D Turntable Canvas */}
        <div
          style={{
            position: 'relative',
            height: '520px',
            borderRadius: '16px',
            background: 'radial-gradient(circle at 50% 40%, #151a26, #090b10 85%)',
            border: '2px solid #283142',
            boxShadow: '0 8px 32px rgba(0,0,0,0.85)',
            overflow: 'hidden',
          }}
        >
          {/* Turntable 3D Mount */}
          <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

          {/* Floating Vehicle Title Badge */}
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '24px',
              background: 'rgba(10, 13, 20, 0.88)',
              backdropFilter: 'blur(12px)',
              padding: '14px 22px',
              borderRadius: '12px',
              border: '1px solid #333d4d',
            }}
          >
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}>
              {vehicle.category} • {vehicle.manufacturer}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', color: '#fff' }}>
              {vehicle.name}
            </div>
          </div>
        </div>

        {/* Vehicle Performance Specs & Tuning */}
        <div
          style={{
            background: 'rgba(16, 20, 28, 0.85)',
            borderRadius: '16px',
            border: '1px solid #283142',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 800, letterSpacing: '0.08em' }}>
              PERFORMANCE TELEMETRY
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', margin: '4px 0 16px 0' }}>
              {vehicle.name}
            </h3>

            <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6, margin: '0 0 20px 0' }}>
              {vehicle.description}
            </p>

            {/* Performance Stat Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Top Speed */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>TOP SPEED</span>
                  <span style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                    {vehicle.topSpeedMph} MPH
                  </span>
                </div>
                <div style={{ height: '8px', background: '#090d14', borderRadius: '999px', overflow: 'hidden', border: '1px solid #283142' }}>
                  <div style={{ width: `${(vehicle.topSpeedMph / 250) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #ea580c, #f59e0b)', borderRadius: '999px' }} />
                </div>
              </div>

              {/* Acceleration */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>ACCELERATION (0-60 MPH)</span>
                  <span style={{ color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                    {vehicle.accelRating} / 100
                  </span>
                </div>
                <div style={{ height: '8px', background: '#090d14', borderRadius: '999px', overflow: 'hidden', border: '1px solid #283142' }}>
                  <div style={{ width: `${vehicle.accelRating}%`, height: '100%', background: 'linear-gradient(90deg, #059669, #10b981)', borderRadius: '999px' }} />
                </div>
              </div>

              {/* Handling */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800, marginBottom: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>HANDLING & DRIFT ANGLE</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'JetBrains Mono, monospace' }}>
                    {vehicle.handlingRating} / 100
                  </span>
                </div>
                <div style={{ height: '8px', background: '#090d14', borderRadius: '999px', overflow: 'hidden', border: '1px solid #283142' }}>
                  <div style={{ width: `${vehicle.handlingRating}%`, height: '100%', background: 'linear-gradient(90deg, #0284c7, #38bdf8)', borderRadius: '999px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '28px' }}>
            <button
              onClick={() => onLaunchDrive(vehicle.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '14px',
                borderRadius: '10px',
                background: '#f59e0b',
                color: '#000',
                border: 'none',
                fontWeight: 900,
                fontSize: '13px',
                cursor: 'pointer',
                fontFamily: 'Chakra Petch, sans-serif',
                letterSpacing: '0.04em',
                boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              <Play size={16} fill="#000" />
              <span>TAKE {vehicle.name.toUpperCase()} TO HIGHWAY 99</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
