import React, { useState } from 'react';
import { BlacklistRival, BlacklistRaceEvent } from '../types';
import {
  Trophy,
  Flame,
  Flag,
  ShieldAlert,
  Play,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';

const BLACKLIST_RIVALS: BlacklistRival[] = [
  {
    rank: 15,
    name: 'Ho Seun',
    alias: 'Sonny',
    car: 'Volkswagen Golf GTI (2.0L Turbo)',
    carId: 'golf-gti',
    bio: 'Sonny has dropped a ton of cash into his ride. If you give him room, he will outrun you. Do not let him off the line.',
    quote: '"You think you can roll with the Blacklist? You have not seen anything yet."',
    heatLevel: 1,
    requiredRaces: 2,
    requiredMilestones: 2,
    requiredBounty: 20000,
    isDefeated: true,
    isUnlocked: true,
    races: [
      {
        id: 'sonny-circuit-1',
        title: 'Rosewood Suburbs Circuit',
        type: 'Circuit',
        trackName: 'Heritage Park Loop',
        distanceKm: 5.4,
        laps: 2,
        rewardCash: 5000,
        completed: true,
      },
      {
        id: 'sonny-sprint-1',
        title: 'Highway 99 Outbound',
        type: 'Sprint',
        trackName: 'Rockport Freeway North',
        distanceKm: 6.8,
        rewardCash: 5000,
        completed: true,
      },
      {
        id: 'sonny-speedtrap-1',
        title: 'Point Camden Radar Sprint',
        type: 'Speedtrap',
        trackName: 'Ocean Boulevard',
        distanceKm: 4.8,
        rewardCash: 6000,
        completed: false,
      },
    ],
    milestones: [
      {
        id: 'sonny-m1',
        title: 'Bounty Pursuit',
        description: 'Accumulate at least $10,000 Bounty in a single pursuit and evade.',
        targetCount: 10000,
        bountyReward: 15000,
        completed: true,
      },
      {
        id: 'sonny-m2',
        title: 'Police Vehicle Destruction',
        description: 'Disable at least 4 police cruisers before escaping.',
        targetCount: 4,
        bountyReward: 20000,
        completed: true,
      },
      {
        id: 'sonny-m3',
        title: 'Highway Speed Record',
        description: 'Trigger any photo radar camera above 135 MPH.',
        targetCount: 135,
        bountyReward: 10000,
        completed: false,
      },
    ],
  },
  {
    rank: 14,
    name: 'Vince Kilic',
    alias: 'Taz',
    car: 'Lexus IS300 (Twin Turbo)',
    carId: 'lexus-is300',
    bio: 'Taz is reckless and dangerous. He loves targeting rookies and running them straight into police cruisers.',
    quote: '"Get off my track before I put you through a concrete barrier."',
    heatLevel: 2,
    requiredRaces: 3,
    requiredMilestones: 2,
    requiredBounty: 50000,
    isDefeated: false,
    isUnlocked: true,
    races: [
      {
        id: 'taz-circuit-1',
        title: 'Camden Beach Marina Loop',
        type: 'Circuit',
        trackName: 'Boardwalk Expressway',
        distanceKm: 6.2,
        laps: 3,
        rewardCash: 8000,
        completed: false,
      },
      {
        id: 'taz-sprint-1',
        title: 'Industrial Rail Corridor',
        type: 'Sprint',
        trackName: 'Freight Depot Run',
        distanceKm: 7.4,
        rewardCash: 8500,
        completed: false,
      },
      {
        id: 'taz-tollbooth-1',
        title: 'Highway 99 Toll Run',
        type: 'Tollbooth',
        trackName: 'Rockport Turnpike South',
        distanceKm: 8.9,
        rewardCash: 9000,
        completed: false,
      },
    ],
    milestones: [
      {
        id: 'taz-m1',
        title: 'Cost to State Challenge',
        description: 'Inflict over $25,000 in property damage during pursuit.',
        targetCount: 25000,
        bountyReward: 35000,
        completed: false,
      },
      {
        id: 'taz-m2',
        title: 'Spike Strip Evasion',
        description: 'Evade pursuit after dodging a deployed spike strip.',
        targetCount: 1,
        bountyReward: 40000,
        completed: false,
      },
    ],
  },
  {
    rank: 10,
    name: 'Karl Smit',
    alias: 'Baron',
    car: 'Porsche Cayman S',
    carId: 'carrera-gt',
    bio: 'Baron considers himself high society. He uses precision cornering and top-tier German engineering to dominate.',
    quote: '"My ride costs more than your entire safehouse. Step aside."',
    heatLevel: 3,
    requiredRaces: 4,
    requiredMilestones: 3,
    requiredBounty: 250000,
    isDefeated: false,
    isUnlocked: true,
    races: [
      {
        id: 'baron-circuit-1',
        title: 'Century Square Grand Prix',
        type: 'Circuit',
        trackName: 'Downtown Financial Loop',
        distanceKm: 8.5,
        laps: 3,
        rewardCash: 18000,
        completed: false,
      },
      {
        id: 'baron-speedtrap-1',
        title: 'Ocean Expressway Speedtrap',
        type: 'Speedtrap',
        trackName: 'Point Camden Ridge',
        distanceKm: 9.1,
        rewardCash: 22000,
        completed: false,
      },
    ],
    milestones: [
      {
        id: 'baron-m1',
        title: 'Cruiser Neutralization',
        description: 'Disable 10 Police Interceptors in Heat Level 3.',
        targetCount: 10,
        bountyReward: 120000,
        completed: false,
      },
      {
        id: 'baron-m2',
        title: 'Pursuit Breaker Destruction',
        description: 'Trigger 3 Pursuit Breakers to collapse on pursuing cruisers.',
        targetCount: 3,
        bountyReward: 90000,
        completed: false,
      },
    ],
  },
  {
    rank: 5,
    name: 'Wes Allen',
    alias: 'Webster',
    car: 'Chevrolet Corvette C6 (7.0L V8)',
    carId: 'corvette-c6',
    bio: 'Webster talks constantly about performance numbers. If he gets on the highway straight, his Corvette will pull away fast.',
    quote: '"American displacement beats lightweight imports every single day."',
    heatLevel: 4,
    requiredRaces: 5,
    requiredMilestones: 4,
    requiredBounty: 1200000,
    isDefeated: false,
    isUnlocked: true,
    races: [
      {
        id: 'webster-sprint-1',
        title: 'Camden Highway Blast',
        type: 'Sprint',
        trackName: 'Interstate 99 Southbound',
        distanceKm: 11.2,
        rewardCash: 45000,
        completed: false,
      },
      {
        id: 'webster-tollbooth-1',
        title: 'Downtown Gateway Time Trial',
        type: 'Tollbooth',
        trackName: 'Century Highway Express',
        distanceKm: 12.8,
        rewardCash: 50000,
        completed: false,
      },
    ],
    milestones: [
      {
        id: 'webster-m1',
        title: 'Federal Cruiser Evade',
        description: 'Survive and evade a Heat Level 4 pursuit against State Police.',
        targetCount: 1,
        bountyReward: 350000,
        completed: false,
      },
      {
        id: 'webster-m2',
        title: 'Bounty Milestone',
        description: 'Amass $500,000 Bounty in a single chase.',
        targetCount: 500000,
        bountyReward: 400000,
        completed: false,
      },
    ],
  },
  {
    rank: 1,
    name: 'Clarence Callahan',
    alias: 'Razor',
    car: 'BMW M3 GTR E46 (Stolen Hero Car)',
    carId: 'bmw-m3-gtr',
    bio: 'Razor sabotaged your BMW in the prologue and used it to climb to #1 on the Blacklist. Now he runs Rockport.',
    quote: '"You want your car back? You are going to have to take it from me on Highway 99."',
    heatLevel: 5,
    requiredRaces: 5,
    requiredMilestones: 5,
    requiredBounty: 5000000,
    isDefeated: false,
    isUnlocked: true,
    races: [
      {
        id: 'razor-duel-1',
        title: 'Blacklist Duel: Century Square Circuit',
        type: 'Circuit',
        trackName: 'Downtown Rockport Metropolis Loop',
        distanceKm: 10.4,
        laps: 3,
        rewardCash: 150000,
        completed: false,
      },
      {
        id: 'razor-duel-2',
        title: 'Blacklist Duel: Camden Turnpike Sprint',
        type: 'Sprint',
        trackName: 'Rockport Expressway Full Perimeter',
        distanceKm: 14.8,
        rewardCash: 200000,
        completed: false,
      },
      {
        id: 'razor-duel-3',
        title: 'Final Showdown: The River Bridge Escape',
        type: 'Sprint',
        trackName: 'Highway 99 Border Crossing',
        distanceKm: 18.5,
        rewardCash: 500000,
        completed: false,
      },
    ],
    milestones: [
      {
        id: 'razor-m1',
        title: 'Condition Red: Cross Pursuit',
        description: 'Survive Heat Level 5 pursuit with Sgt. Cross Federal Corvettes.',
        targetCount: 1,
        bountyReward: 1000000,
        completed: false,
      },
      {
        id: 'razor-m2',
        title: 'Ultimate Cost to State',
        description: 'Inflict over $200,000 in state property and vehicle damage.',
        targetCount: 200000,
        bountyReward: 850000,
        completed: false,
      },
    ],
  },
];

interface BlacklistViewProps {
  onLaunchEvent: (event: BlacklistRaceEvent, rival: BlacklistRival) => void;
}

export const BlacklistView: React.FC<BlacklistViewProps> = ({ onLaunchEvent }) => {
  const [selectedRank, setSelectedRank] = useState<number>(1);
  const rival = BLACKLIST_RIVALS.find((r) => r.rank === selectedRank) || BLACKLIST_RIVALS[0];

  return (
    <div style={{ padding: '32px', maxWidth: '1440px', margin: '0 auto', color: '#fff' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f59e0b', fontWeight: 800, fontSize: '12px', letterSpacing: '0.1em' }}>
            <Trophy size={18} />
            <span>ROCKPORT POLICE DEPARTMENT — MOST WANTED LIST</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '4px 0 0 0' }}>
            THE BLACKLIST 15
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '4px', maxWidth: '650px' }}>
            Defeat Rockport's 15 most notorious street racers in sanctioned events and pursuit milestones to reclaim your stolen BMW M3 GTR.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', background: 'rgba(16, 20, 28, 0.85)', padding: '12px 20px', borderRadius: '12px', border: '1px solid #283142' }}>
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>YOUR BOUNTY</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>$4,850,000</div>
          </div>
          <div style={{ width: '1px', background: '#333d4d' }} />
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>RIVALS DEFEATED</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>14 / 15</div>
          </div>
          <div style={{ width: '1px', background: '#333d4d' }} />
          <div>
            <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>TARGET</div>
            <div style={{ fontSize: '18px', fontWeight: 900, color: '#ef4444', fontFamily: 'Chakra Petch, sans-serif' }}>#1 RAZOR</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Rival Selector / Right Rival Dossier */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '28px' }}>
        {/* Left: Rival Roster */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', marginBottom: '4px' }}>
            SELECT RIVAL DOSSIER
          </div>

          {BLACKLIST_RIVALS.map((r) => {
            const isSelected = r.rank === selectedRank;
            return (
              <div
                key={r.rank}
                onClick={() => setSelectedRank(r.rank)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.18), rgba(20, 24, 34, 0.95))'
                    : 'rgba(16, 20, 28, 0.75)',
                  border: isSelected ? '1px solid #f59e0b' : '1px solid #232b3c',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 20px rgba(245, 158, 11, 0.2)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      background: r.rank === 1 ? '#ef4444' : isSelected ? '#f59e0b' : '#232b3c',
                      color: r.rank === 1 || isSelected ? '#000' : '#cbd5e1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontFamily: 'Chakra Petch, sans-serif',
                      fontSize: '15px',
                    }}
                  >
                    #{r.rank}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{r.alias}</span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 500 }}>({r.name})</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>{r.car}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {r.isDefeated ? (
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      DEFEATED
                    </span>
                  ) : (
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                      HEAT {r.heatLevel}
                    </span>
                  )}
                  <ChevronRight size={16} color={isSelected ? '#f59e0b' : '#64748b'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Rival Dossier, Race Events, and Milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Rival Profile Header */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(20, 25, 36, 0.95), rgba(10, 13, 18, 0.98))',
              border: '1px solid #333d4d',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ position: 'absolute', top: '-10px', right: '20px', fontSize: '96px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', color: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}>
              #{rival.rank}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '12px' }}>
                  <Flame size={16} />
                  <span>BLACKLIST RANK #{rival.rank}</span>
                </div>
                <h2 style={{ fontSize: '32px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', textTransform: 'uppercase', margin: '4px 0' }}>
                  {rival.alias} <span style={{ fontSize: '18px', color: '#94a3b8', textTransform: 'none' }}>/ {rival.name}</span>
                </h2>
                <div style={{ fontSize: '15px', color: '#38bdf8', fontWeight: 700 }}>
                  Ride: {rival.car}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 16px', borderRadius: '10px', border: '1px solid #283142' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>RACES REQUIRED</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>
                    {rival.races.filter((r) => r.completed).length} / {rival.requiredRaces}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 16px', borderRadius: '10px', border: '1px solid #283142' }}>
                  <div style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800 }}>BOUNTY REQUIREMENT</div>
                  <div style={{ fontSize: '16px', fontWeight: 900, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                    ${rival.requiredBounty.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.6, marginTop: '16px', maxWidth: '780px' }}>
              {rival.bio}
            </p>

            <div style={{ marginTop: '14px', fontStyle: 'italic', color: '#f59e0b', fontSize: '13px', borderLeft: '3px solid #f59e0b', paddingLeft: '12px' }}>
              {rival.quote}
            </div>
          </div>

          {/* Race Events Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#f59e0b', marginBottom: '12px' }}>
              <Flag size={16} />
              <span>SANCTIONED RACE EVENTS ({rival.races.length} AVAILABLE)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {rival.races.map((event) => (
                <div
                  key={event.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(16, 20, 28, 0.85)',
                    border: '1px solid #283142',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background:
                            event.type === 'Circuit'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : event.type === 'Sprint'
                              ? 'rgba(245, 158, 11, 0.2)'
                              : 'rgba(239, 68, 68, 0.2)',
                          color:
                            event.type === 'Circuit'
                              ? '#60a5fa'
                              : event.type === 'Sprint'
                              ? '#f59e0b'
                              : '#f87171',
                        }}
                      >
                        {event.type} {event.laps ? `(${event.laps} LAPS)` : ''}
                      </span>

                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
                        +${event.rewardCash.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#fff' }}>{event.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      Track: {event.trackName} • {event.distanceKm} km
                    </div>
                  </div>

                  <button
                    onClick={() => onLaunchEvent(event, rival)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#f59e0b',
                      color: '#000',
                      border: 'none',
                      fontWeight: 800,
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 2px 10px rgba(245, 158, 11, 0.3)',
                    }}
                  >
                    <Play size={14} fill="#000" />
                    <span>LAUNCH 3D RACE</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Pursuit Milestones Section */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 800, color: '#ef4444', marginBottom: '12px' }}>
              <ShieldAlert size={16} />
              <span>PURSUIT MILESTONES ({rival.milestones.length} CHALLENGES)</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
              {rival.milestones.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(20, 16, 16, 0.85)',
                    border: '1px solid #3b2828',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: '#fff' }}>{m.title}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                        +${m.bountyReward.toLocaleString()} BOUNTY
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
                      {m.description}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: m.completed ? '#10b981' : '#f59e0b', fontWeight: 700 }}>
                    {m.completed ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                    <span>{m.completed ? 'COMPLETED & VERIFIED' : 'ACTIVE IN PURSUIT'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
