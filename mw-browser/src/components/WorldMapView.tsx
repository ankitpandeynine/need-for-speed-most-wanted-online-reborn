import React, { useState } from 'react';
import { MapLocation } from '../types';
import {
  MapPin,
  Navigation,
  Compass,
  Home,
  Flag,
  AlertTriangle,
  Shield,
} from 'lucide-react';

const ROCKPORT_LOCATIONS: MapLocation[] = [
  // Safehouses
  {
    id: 'safehouse-rosewood',
    title: 'Rosewood Suburbs Safehouse',
    type: 'safehouse',
    district: 'Rosewood',
    posX: 32,
    posY: 28,
    description: 'Underground automotive repair garage and safehouse. Low police presence.',
  },
  {
    id: 'safehouse-camden',
    title: 'Camden Beach Marina Safehouse',
    type: 'safehouse',
    district: 'Camden Beach',
    posX: 74,
    posY: 68,
    description: 'Secluded waterfront warehouse near the amusement pier with direct access to Ocean Blvd.',
  },
  {
    id: 'safehouse-downtown',
    title: 'Downtown Rockport City Safehouse',
    type: 'safehouse',
    district: 'Downtown Rockport',
    posX: 52,
    posY: 46,
    description: 'Hidden basement workshop behind Century Square with quick freeway on-ramps.',
  },

  // Race Events
  {
    id: 'race-century-square',
    title: 'Century Square Grand Prix',
    type: 'race',
    district: 'Downtown Rockport',
    posX: 48,
    posY: 42,
    description: 'High-stakes 3-lap circuit winding through towering financial skyscrapers and transit plazas.',
    rewardCash: 25000,
    rewardBounty: 65000,
  },
  {
    id: 'race-heritage-strip',
    title: 'Rosewood Heritage Sprint',
    type: 'race',
    district: 'Rosewood',
    posX: 24,
    posY: 35,
    description: 'Full-throttle straightaways through suburban Rosewood connecting to rail depot.',
    rewardCash: 18000,
    rewardBounty: 45000,
  },
  {
    id: 'race-point-camden',
    title: 'Point Camden Radar Run',
    type: 'race',
    district: 'Camden Beach',
    posX: 82,
    posY: 78,
    description: 'Coastal speedtrap run with 4 photo radar cameras along the ocean cliffs.',
    rewardCash: 22000,
    rewardBounty: 50000,
  },
  {
    id: 'race-hwy99-loop',
    title: 'Highway 99 Interstate Loop',
    type: 'race',
    district: 'Rockport Freeway',
    posX: 58,
    posY: 22,
    description: 'High-speed perimeter 4-lane sprint at top speed with active police patrols.',
    rewardCash: 35000,
    rewardBounty: 90000,
  },

  // Pursuit Breakers
  {
    id: 'breaker-water-tower',
    title: 'Rosewood Water Tower',
    type: 'pursuit_breaker',
    district: 'Rosewood',
    posX: 38,
    posY: 34,
    description: 'Impact steel support struts to collapse 50,000 gallons of water across pursuit cruisers.',
    rewardBounty: 35000,
  },
  {
    id: 'breaker-gas-station',
    title: 'Rockport Turnpike Gas Station Canopy',
    type: 'pursuit_breaker',
    district: 'Rockport Freeway',
    posX: 64,
    posY: 38,
    description: 'Ram canopy pillars to bring the roof down and explode fuel pumps onto police Corvettes.',
    rewardBounty: 50000,
  },
  {
    id: 'breaker-donut-sign',
    title: 'Giant Donut Billboard',
    type: 'pursuit_breaker',
    district: 'Camden Beach',
    posX: 68,
    posY: 62,
    description: 'Smash billboard legs to roll the giant steel donut down Ocean Boulevard into chasing squads.',
    rewardBounty: 40000,
  },

  // Hiding Spots
  {
    id: 'hide-carwash',
    title: 'Speedy Car Wash Bay',
    type: 'hiding_spot',
    district: 'Rosewood',
    posX: 28,
    posY: 42,
    description: 'Concealed automated car wash tunnel for instant pursuit cooldown.',
  },
  {
    id: 'hide-subway-tunnel',
    title: 'Disused Transit Subway Tunnel',
    type: 'hiding_spot',
    district: 'Downtown Rockport',
    posX: 56,
    posY: 52,
    description: 'Underground rail spur shielding vehicle completely from police helicopters and radar.',
  },
];

interface WorldMapViewProps {
  onStartDriveAt: (location: MapLocation) => void;
}

export const WorldMapView: React.FC<WorldMapViewProps> = ({ onStartDriveAt }) => {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation>(ROCKPORT_LOCATIONS[0]);
  const [filterType, setFilterType] = useState<string>('all');
  const [activeDistrict, setActiveDistrict] = useState<string>('all');

  const filteredLocations = ROCKPORT_LOCATIONS.filter((loc) => {
    if (filterType !== 'all' && loc.type !== filterType) return false;
    if (activeDistrict !== 'all' && loc.district !== activeDistrict) return false;
    return true;
  });

  const getMarkerIcon = (type: MapLocation['type']) => {
    switch (type) {
      case 'safehouse':
        return <Home size={14} color="#10b981" />;
      case 'race':
        return <Flag size={14} color="#f59e0b" />;
      case 'pursuit_breaker':
        return <AlertTriangle size={14} color="#ef4444" />;
      case 'hiding_spot':
        return <Shield size={14} color="#38bdf8" />;
      default:
        return <MapPin size={14} color="#f59e0b" />;
    }
  };

  const getMarkerColor = (type: MapLocation['type']) => {
    switch (type) {
      case 'safehouse':
        return '#10b981';
      case 'race':
        return '#f59e0b';
      case 'pursuit_breaker':
        return '#ef4444';
      case 'hiding_spot':
        return '#38bdf8';
      default:
        return '#f59e0b';
    }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', color: '#fff' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '12px' }}>
            <Compass size={18} />
            <span>ROCKPORT COUNTY GPS NAVIGATION SYSTEM</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', textTransform: 'uppercase', margin: '4px 0' }}>
            WORLD MAP & DISTRICTS
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Explore Rosewood, Camden Beach, and Downtown Rockport. Locate race events, safehouses, and destructible pursuit breakers.
          </p>
        </div>

        {/* Filter Toolbar: Types and Districts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'Rosewood', 'Camden Beach', 'Downtown'].map((d) => (
              <button
                key={d}
                onClick={() => setActiveDistrict(d)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: activeDistrict === d ? '#3b82f6' : 'rgba(16, 20, 28, 0.85)',
                  color: activeDistrict === d ? '#fff' : '#94a3b8',
                  border: activeDistrict === d ? '1px solid #60a5fa' : '1px solid #283142',
                  fontWeight: 800,
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {d === 'all' ? 'All Districts' : d}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'race', 'safehouse', 'pursuit_breaker', 'hiding_spot'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: filterType === f ? '#f59e0b' : 'rgba(16, 20, 28, 0.85)',
                  color: filterType === f ? '#000' : '#cbd5e1',
                  border: filterType === f ? '1px solid #f59e0b' : '1px solid #283142',
                  fontWeight: 800,
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Container: Map on Left / Details on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '28px' }}>
        {/* Interactive GPS Vector Map */}
        <div
          style={{
            position: 'relative',
            height: '640px',
            borderRadius: '16px',
            background: 'radial-gradient(circle at 50% 50%, #0d121c, #06080d 90%)',
            border: '2px solid #283142',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8), inset 0 0 60px rgba(0,0,0,0.9)',
            overflow: 'hidden',
          }}
        >
          {/* Compass Rose */}
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '8px', border: '1px solid #283142', fontSize: '11px', fontWeight: 800, color: '#f59e0b' }}>
            <Compass size={14} />
            <span>NORTH • ROCKPORT GPS</span>
          </div>

          {/* SVG Road Network & Coastline */}
          <svg
            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
            viewBox="0 0 1000 700"
          >
            <defs>
              <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#040b17" />
                <stop offset="100%" stopColor="#081426" />
              </linearGradient>
            </defs>

            {/* Ocean Bay / Camden Coastline */}
            <path
              d="M 650 0 Q 750 250 850 400 T 1000 700 L 1000 0 Z"
              fill="url(#oceanGrad)"
              opacity="0.8"
            />

            {/* District Boundary Waterlines */}
            <path
              d="M 650 0 Q 750 250 850 400 T 1000 700"
              stroke="#1e3a5f"
              strokeWidth="4"
              fill="none"
              strokeDasharray="6,6"
            />

            {/* Major Arterial Highway 99 Interstate Loop (Orange Highway) */}
            <path
              d="M 120 180 Q 300 80 550 140 T 900 240 Q 820 540 680 620 T 320 580 Q 140 450 120 180 Z"
              fill="none"
              stroke="#ea580c"
              strokeWidth="12"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.85"
            />

            {/* Highway 99 Core Yellow Centerline */}
            <path
              d="M 120 180 Q 300 80 550 140 T 900 240 Q 820 540 680 620 T 320 580 Q 140 450 120 180 Z"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeDasharray="8,6"
            />

            {/* Rosewood Suburban Secondary Road Grid (White Arteries) */}
            <path
              d="M 180 160 L 380 200 L 400 360 L 220 340 Z"
              fill="none"
              stroke="#475569"
              strokeWidth="6"
              strokeLinejoin="round"
            />
            <line x1="220" y1="200" x2="380" y2="300" stroke="#64748b" strokeWidth="4" />
            <line x1="260" y1="160" x2="280" y2="350" stroke="#64748b" strokeWidth="4" />

            {/* Downtown Rockport Financial Loop Grid */}
            <rect x="440" y="300" width="180" height="180" rx="20" fill="none" stroke="#3b82f6" strokeWidth="6" opacity="0.7" />
            <line x1="440" y1="360" x2="620" y2="360" stroke="#38bdf8" strokeWidth="4" />
            <line x1="440" y1="420" x2="620" y2="420" stroke="#38bdf8" strokeWidth="4" />
            <line x1="500" y1="300" x2="500" y2="480" stroke="#38bdf8" strokeWidth="4" />
            <line x1="560" y1="300" x2="560" y2="480" stroke="#38bdf8" strokeWidth="4" />

            {/* Camden Beach Boardwalk & Coastal Turnpike */}
            <path
              d="M 680 440 Q 780 480 840 600 T 740 680"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* District Labels */}
            <text x="240" y="240" fill="#94a3b8" fontSize="22" fontWeight="900" fontFamily="Chakra Petch, sans-serif" letterSpacing="4">
              ROSEWOOD
            </text>
            <text x="470" y="280" fill="#60a5fa" fontSize="22" fontWeight="900" fontFamily="Chakra Petch, sans-serif" letterSpacing="4">
              DOWNTOWN ROCKPORT
            </text>
            <text x="710" y="550" fill="#22d3ee" fontSize="22" fontWeight="900" fontFamily="Chakra Petch, sans-serif" letterSpacing="4">
              CAMDEN BEACH
            </text>
            <text x="440" y="110" fill="#f59e0b" fontSize="16" fontWeight="900" fontFamily="Chakra Petch, sans-serif" letterSpacing="2">
              INTERSTATE 99 FREEWAY LOOP
            </text>
          </svg>

          {/* Interactive Pins on Map */}
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc)}
                style={{
                  position: 'absolute',
                  left: `${loc.posX}%`,
                  top: `${loc.posY}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: isSelected ? 30 : 20,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                {/* Ping Animation if selected */}
                {isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: getMarkerColor(loc.type),
                      opacity: 0.4,
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                    }}
                  />
                )}

                {/* Marker Button */}
                <div
                  style={{
                    width: isSelected ? '34px' : '26px',
                    height: isSelected ? '34px' : '26px',
                    borderRadius: '50%',
                    background: isSelected ? '#fff' : 'rgba(10, 14, 22, 0.95)',
                    border: `2px solid ${getMarkerColor(loc.type)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: `0 0 14px ${getMarkerColor(loc.type)}`,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {getMarkerIcon(loc.type)}
                </div>

                {isSelected && (
                  <div
                    style={{
                      marginTop: '4px',
                      background: 'rgba(0,0,0,0.85)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #333d4d',
                      fontSize: '11px',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      color: '#fff',
                    }}
                  >
                    {loc.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Location Details Panel */}
        <div
          style={{
            background: 'rgba(16, 20, 28, 0.85)',
            borderRadius: '16px',
            border: '1px solid #283142',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: `${getMarkerColor(selectedLocation.type)}25`,
                  color: getMarkerColor(selectedLocation.type),
                  border: `1px solid ${getMarkerColor(selectedLocation.type)}60`,
                }}
              >
                {selectedLocation.type.replace('_', ' ')}
              </span>
              <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                {selectedLocation.district}
              </span>
            </div>

            <h3 style={{ fontSize: '22px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', margin: '8px 0 12px 0', lineHeight: 1.2 }}>
              {selectedLocation.title}
            </h3>

            <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: 1.6, margin: '0 0 18px 0' }}>
              {selectedLocation.description}
            </p>

            {/* Event Rewards if applicable */}
            {(selectedLocation.rewardCash || selectedLocation.rewardBounty) && (
              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '14px', borderRadius: '10px', border: '1px solid #232b3c', display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                {selectedLocation.rewardCash && (
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>CASH REWARD</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                      +${selectedLocation.rewardCash.toLocaleString()}
                    </div>
                  </div>
                )}
                {selectedLocation.rewardBounty && (
                  <div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>BOUNTY BOOST</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                      +${selectedLocation.rewardBounty.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={() => onStartDriveAt(selectedLocation)}
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
              boxShadow: '0 4px 18px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.15s ease',
            }}
          >
            <Navigation size={16} fill="#000" />
            <span>GPS DRIVE TO THIS LOCATION</span>
          </button>
        </div>
      </div>
    </div>
  );
};
