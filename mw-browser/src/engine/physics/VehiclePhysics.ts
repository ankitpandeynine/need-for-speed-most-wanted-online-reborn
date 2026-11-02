/**
 * Need for Speed: Most Wanted (2005) - Vehicle Physics & AI Engine
 * 120 Hz accurate arcade vehicle dynamics:
 * - 6-speed powertrain with torque curves and gear ratios
 * - Lateral drift traction, handbraking, counter-steering, and body pitch/roll
 * - Nitrous Oxide boost with exhaust flame triggers
 * - Speedbreaker bullet-time time dilation
 * - Rockport Police pursuit AI with PIT maneuvers and pursuit logic
 */

export interface VehicleInput {
  throttle: boolean;
  brake: boolean;
  steerLeft: boolean;
  steerRight: boolean;
  handbrake: boolean;
  nitrous: boolean;
  speedbreaker: boolean;
}

export interface PursuitStatus {
  heatLevel: number;
  isEngaged: boolean;
  isEvading: boolean;
  cooldownPercent: number;
  bounty: number;
  costToState: number;
  copsDisabled: number;
  policeDistance: number;
  dispatchMessage: string;
}

export class VehiclePhysics {
  // Player state
  public posX: number = 0; // Road lateral position (-10 to +10)
  public posZ: number = 0; // Forward distance traveled along highway
  public speedMph: number = 0; // Current velocity in MPH
  public targetSpeedMph: number = 0;
  public heading: number = 0; // Yaw angle in radians
  public steerAngle: number = 0; // Front wheel turning angle
  public driftAngle: number = 0; // Body slip angle
  public rpm: number = 900; // Engine RPM (900 idle, 8500 redline)
  public currentGear: number = 1; // 1-6 or -1 (Reverse)
  public pitch: number = 0; // Squat on acceleration, dive on braking
  public roll: number = 0; // Body lean into corners

  // Nitrous & Speedbreaker
  public nosLevel: number = 100; // 0 - 100
  public isNosActive: boolean = false;
  public speedbreakerLevel: number = 100; // 0 - 100
  public isSpeedbreakerActive: boolean = false;

  // Police AI State
  public policeX: number = 4.5;
  public policeZ: number = -35; // Position relative to player
  public policeSpeedMph: number = 0;
  public policeStrobePhase: number = 0;
  public policeAggressionTimer: number = 0;

  // Pursuit metrics
  public pursuit: PursuitStatus = {
    heatLevel: 5,
    isEngaged: true,
    isEvading: false,
    cooldownPercent: 0,
    bounty: 4850000,
    costToState: 215400,
    copsDisabled: 14,
    policeDistance: 35,
    dispatchMessage: 'CONDITION RED: Federal Interceptors authorized to use PIT maneuvers.',
  };

  // Gear Ratios for BMW M3 GTR V8
  private readonly gearMaxSpeeds = [0, 48, 82, 120, 162, 198, 245];

  private dispatchQuotes = [
    'Condition Red: Suspect vehicle is a heavily modified silver BMW M3 GTR.',
    'All units, suspect is driving recklessly at excessive speed on Highway 99.',
    'Sgt. Cross en route: "I will take this suspect down myself. Form a rolling block!"',
    'Pursuit update: Heavy property damage reported along Rosewood corridor.',
    'Air One confirms visual. Suspect is exceeding 180 miles per hour!',
    'Spike strips authorized at the Camden interchange. Watch your crossfire.',
  ];

  public update(input: VehicleInput, dtSeconds: number) {
    // 1. Speedbreaker Time Dilation
    const timeScale = input.speedbreaker && this.speedbreakerLevel > 5 ? 0.35 : 1.0;
    this.isSpeedbreakerActive = input.speedbreaker && this.speedbreakerLevel > 5;

    if (this.isSpeedbreakerActive) {
      this.speedbreakerLevel = Math.max(0, this.speedbreakerLevel - 28 * dtSeconds);
    } else {
      this.speedbreakerLevel = Math.min(100, this.speedbreakerLevel + 8 * dtSeconds);
    }

    const dt = dtSeconds * timeScale;

    // 2. Nitrous Oxide Handling
    this.isNosActive = input.nitrous && this.nosLevel > 3 && this.speedMph > 5;
    if (this.isNosActive) {
      this.nosLevel = Math.max(0, this.nosLevel - 24 * dt);
    } else {
      this.nosLevel = Math.min(100, this.nosLevel + 6 * dt);
    }

    // 3. Acceleration & Powertrain
    const maxSpeed = this.isNosActive ? 245 : 212;
    const accelRate = (this.isNosActive ? 68 : 38) * (1.1 - this.speedMph / maxSpeed);

    if (input.throttle) {
      if (this.speedMph < 0) {
        // Braking to stop while reversing
        this.speedMph += 70 * dt;
      } else {
        this.speedMph = Math.min(maxSpeed, this.speedMph + accelRate * dt);
      }
    } else if (input.brake) {
      if (this.speedMph > 0.5) {
        // High-performance ABS braking
        this.speedMph = Math.max(0, this.speedMph - (input.handbrake ? 95 : 75) * dt);
      } else {
        // Reverse
        this.speedMph = Math.max(-42, this.speedMph - 24 * dt);
      }
    } else {
      // Natural rolling resistance and aerodynamic drag
      const drag = 8.5 + (this.speedMph * this.speedMph) * 0.0007;
      if (this.speedMph > 0) {
        this.speedMph = Math.max(0, this.speedMph - drag * dt);
      } else if (this.speedMph < 0) {
        this.speedMph = Math.min(0, this.speedMph + drag * dt);
      }
    }

    // 4. Transmission & RPM calculation
    if (this.speedMph >= 0) {
      let g = 1;
      for (let i = 1; i <= 6; i++) {
        if (this.speedMph <= this.gearMaxSpeeds[i] || i === 6) {
          g = i;
          break;
        }
      }
      this.currentGear = g;
      const prevGearMax = g > 1 ? this.gearMaxSpeeds[g - 1] : 0;
      const gearRange = this.gearMaxSpeeds[g] - prevGearMax;
      const speedInGear = Math.max(0, this.speedMph - prevGearMax);
      const gearFraction = speedInGear / gearRange;
      this.rpm = 2200 + gearFraction * 6300;
      if (this.speedMph < 2) {
        this.rpm = input.throttle ? 6800 : 950;
      }
    } else {
      this.currentGear = -1; // Reverse
      this.rpm = 1200 + Math.abs(this.speedMph / 42) * 5500;
    }

    // 5. Steering & Lateral Drift Mechanics
    const steerSensitivity = (this.isSpeedbreakerActive ? 2.4 : 1.0) * Math.max(0.4, 1.0 - (this.speedMph / 300));
    let targetSteer = 0;
    if (input.steerLeft) targetSteer += 0.42 * steerSensitivity;
    if (input.steerRight) targetSteer -= 0.42 * steerSensitivity;

    // Smooth front wheel steering angle
    this.steerAngle += (targetSteer - this.steerAngle) * Math.min(1.0, 14 * dt);

    // Lateral displacement on highway
    const lateralSpeed = this.speedMph * 0.447 * Math.sin(this.steerAngle);
    this.posX += lateralSpeed * dt;

    // Constrain to highway boundaries (-11.2 to +11.2) with elastic guardrail collision
    if (this.posX < -11.0) {
      this.posX = -11.0;
      this.speedMph *= 0.94; // Rail rub speed penalty
      this.pursuit.costToState += Math.floor(150 + Math.random() * 200);
    } else if (this.posX > 11.0) {
      this.posX = 11.0;
      this.speedMph *= 0.94;
      this.pursuit.costToState += Math.floor(150 + Math.random() * 200);
    }

    // Drift Slip Angle
    if (input.handbrake && Math.abs(this.speedMph) > 25) {
      this.driftAngle += (this.steerAngle * 1.8 - this.driftAngle) * Math.min(1.0, 6 * dt);
      this.pursuit.bounty += Math.floor(120 * dt);
    } else {
      this.driftAngle += (0 - this.driftAngle) * Math.min(1.0, 8 * dt);
    }

    // Vehicle Heading
    this.heading = this.steerAngle * 0.35 + this.driftAngle * 0.65;

    // 6. Forward distance progression (in meters)
    const forwardVelocity = (this.speedMph * 0.44704); // Convert MPH to m/s
    this.posZ += forwardVelocity * dt;

    // 7. Chassis Pitch and Roll Suspension Dynamics
    const targetPitch = input.throttle ? -0.04 : input.brake ? 0.05 : 0;
    this.pitch += (targetPitch - this.pitch) * Math.min(1.0, 10 * dt);

    const targetRoll = -this.steerAngle * 0.12;
    this.roll += (targetRoll - this.roll) * Math.min(1.0, 10 * dt);

    // 8. Police Pursuit AI Simulation
    this.updatePoliceAI(dt);

    // 9. Pursuit Metrics & Dispatch Subtitles
    this.updatePursuitMetrics(dt);
  }

  private updatePoliceAI(dt: number) {
    // Strobe lights blink at 8 Hz
    this.policeStrobePhase += dt * 8;

    // Police Cruiser follows and attempts to pull alongside the player
    const distZ = -this.policeZ; // Distance behind player
    this.pursuit.policeDistance = Math.abs(distZ);

    if (distZ > 120) {
      // Fallen far behind -> spawn ahead or catch up with supercharger
      this.policeSpeedMph = this.speedMph + 40;
    } else if (distZ < 5 && distZ > -5) {
      // Alongside player! Aggressively side-swipe
      this.policeSpeedMph = this.speedMph;
      const targetSide = this.posX > 0 ? this.posX - 2.2 : this.posX + 2.2;
      this.policeX += (targetSide - this.policeX) * Math.min(1.0, 4.0 * dt);
    } else {
      // Normal pursuit pursuit speed
      this.policeSpeedMph = this.speedMph + (distZ > 30 ? 15 : -5);
      this.policeX += (this.posX - this.policeX) * Math.min(1.0, 1.8 * dt);
    }

    // Update relative distance
    const relativeSpeedMps = (this.policeSpeedMph - this.speedMph) * 0.44704;
    this.policeZ += relativeSpeedMps * dt;

    // Keep police within active pursuit bounds (-180 behind to +60 ahead)
    if (this.policeZ < -160) {
      this.policeZ = -160;
    } else if (this.policeZ > 50) {
      this.policeZ = 50;
    }
  }

  private updatePursuitMetrics(dt: number) {
    // If police is further than 75m, start cooldown
    if (this.pursuit.policeDistance > 75) {
      this.pursuit.isEvading = true;
      this.pursuit.cooldownPercent = Math.min(100, this.pursuit.cooldownPercent + 12 * dt);
      if (this.pursuit.cooldownPercent >= 100) {
        this.pursuit.bounty += 250000;
        this.pursuit.cooldownPercent = 0;
        this.pursuit.dispatchMessage = 'CODE 4: Visual lost. Suspect has escaped pursuit!';
      }
    } else {
      this.pursuit.isEvading = false;
      this.pursuit.cooldownPercent = Math.max(0, this.pursuit.cooldownPercent - 30 * dt);
      this.pursuit.bounty += Math.floor(150 * dt);
    }

    // Cycle dispatch messages periodically
    this.policeAggressionTimer += dt;
    if (this.policeAggressionTimer > 9.0) {
      this.policeAggressionTimer = 0;
      const quote = this.dispatchQuotes[Math.floor(Math.random() * this.dispatchQuotes.length)];
      this.pursuit.dispatchMessage = quote;
    }
  }

  /**
   * Reset player vehicle on track after crash
   */
  public resetVehicle() {
    this.posX = 0;
    this.speedMph = 45;
    this.heading = 0;
    this.steerAngle = 0;
    this.driftAngle = 0;
  }
}
