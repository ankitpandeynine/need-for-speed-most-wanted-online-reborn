import React, { useState, useEffect } from 'react';
import {
  MultiplayerService,
  TRACK_CATALOG,
  INITIAL_LEADERBOARD,
} from '../services/multiplayer';
import {
  LobbyRoom,
  MultiplayerPlayer,
  ChatMessage,
  GameMode,
  CarTier,
} from '../types';
import {
  Users,
  Flag,
  Trophy,
  ShieldCheck,
  Send,
  Plus,
  Play,
  Zap,
  Activity,
  MessageSquare,
  Car,
  Copy,
  Check,
} from 'lucide-react';

interface MultiplayerViewProps {
  onStartOnlineRace: () => void;
}

const CAR_OPTIONS = [
  'BMW M3 GTR E46',
  'Porsche Carrera GT',
  'Lamborghini Gallardo',
  'Ford GT (2005)',
  'Corvette C6.R Police Interceptor',
  'Aston Martin DB9',
  'Mazda RX-7 (FD3S)',
  'Subaru Impreza WRX STi',
  'Ford Mustang GT',
  'Mitsubishi Lancer Evolution VIII',
  'VW Golf GTI (Mk5)',
];

export const MultiplayerView: React.FC<MultiplayerViewProps> = ({ onStartOnlineRace }) => {
  const [subTab, setSubTab] = useState<'lobbies' | 'room' | 'leaderboard'>('lobbies');
  const [rooms, setRooms] = useState<LobbyRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<LobbyRoom | null>(null);
  const [localPlayer, setLocalPlayer] = useState<MultiplayerPlayer>(MultiplayerService.getLocalPlayer());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [callsignInput, setCallsignInput] = useState(localPlayer.callsign);
  const [selectedCar, setSelectedCar] = useState(localPlayer.carModel);

  // Create Room state
  const [createName, setCreateName] = useState('');
  const [createTrack, setCreateTrack] = useState(TRACK_CATALOG[0].id);
  const [createMode, setCreateMode] = useState<GameMode>('sprint');
  const [createMaxPlayers, setCreateMaxPlayers] = useState(4);
  const [createCollision, setCreateCollision] = useState<'ghost' | 'contact'>('ghost');
  const [createCarTier, setCreateCarTier] = useState<CarTier>('open');
  const [createModVerify, setCreateModVerify] = useState(true);

  useEffect(() => {
    const unsubRooms = MultiplayerService.subscribeRoomsList(setRooms);
    const unsubRoom = MultiplayerService.subscribeRoom((r) => {
      setCurrentRoom(r);
      if (r) setSubTab('room');
    });
    const unsubChat = MultiplayerService.subscribeChat(setChatMessages);

    return () => {
      unsubRooms();
      unsubRoom();
      unsubChat();
    };
  }, []);

  const handleSaveProfile = () => {
    MultiplayerService.updateProfile(callsignInput, selectedCar, localPlayer.paintColor);
    setLocalPlayer(MultiplayerService.getLocalPlayer());
    setEditingProfile(false);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    MultiplayerService.createRoom({
      name: createName.trim() || `${callsignInput}'s Championship`,
      trackId: createTrack,
      gameMode: createMode,
      maxPlayers: createMaxPlayers,
      collisionMode: createCollision,
      carTier: createCarTier,
      catchup: true,
      modVerificationRequired: createModVerify,
    });
    setShowCreateModal(false);
    setSubTab('room');
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const ok = MultiplayerService.joinRoom(joinCodeInput);
    if (ok) {
      setJoinCodeInput('');
      setSubTab('room');
    } else {
      alert('Room code not found or lobby is full.');
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    MultiplayerService.sendChatMessage(chatInput);
    setChatInput('');
  };

  const handleQuickTaunt = (tauntText: string) => {
    MultiplayerService.sendChatMessage(tauntText, true);
  };

  const handleCopyCode = () => {
    if (!currentRoom) return;
    navigator.clipboard.writeText(currentRoom.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredRooms = rooms.filter((r) => {
    if (selectedFilter === 'all') return true;
    return r.gameMode === selectedFilter;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner & Status */}
      <div
        className="glass-panel"
        style={{
          padding: '24px 28px',
          marginBottom: '24px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          borderLeft: '4px solid #f59e0b',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Zap size={13} /> Rockport Online Grid • 120 Hz Peer Synchronization
            </span>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Activity size={13} /> {localPlayer.pingMs} ms Ping
            </span>
          </div>
          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '0.04em',
              margin: '4px 0',
            }}
          >
            NEED FOR SPEED <span style={{ color: '#f59e0b' }}>ONLINE REBORN</span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '13.5px', maxWidth: '720px' }}>
            Real-time peer-to-peer multiplayer with dead reckoning, WebRTC mesh signaling,
            anti-cheat mod verification, and Blacklist boss duels.
          </p>
        </div>

        {/* Local Player Profile Card */}
        <div
          style={{
            background: 'rgba(10, 14, 23, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
            }}
          >
            {localPlayer.avatar}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '15px' }}>
                {localPlayer.callsign}
              </span>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f59e0b',
                  fontSize: '11px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {editingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Car size={13} /> {localPlayer.carModel}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Drawer */}
      {editingProfile && (
        <div
          className="glass-panel"
          style={{
            padding: '18px 24px',
            marginBottom: '24px',
            border: '1px solid #f59e0b',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '18px',
          }}
        >
          <div style={{ flex: '1 1 200px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
              Racer Callsign
            </label>
            <input
              type="text"
              value={callsignInput}
              onChange={(e) => setCallsignInput(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0d14',
                border: '1px solid #232b3c',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13.5px',
              }}
              placeholder="e.g. RazorRival"
            />
          </div>
          <div style={{ flex: '1 1 280px' }}>
            <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
              Signature Vehicle
            </label>
            <select
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0d14',
                border: '1px solid #232b3c',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '13.5px',
              }}
            >
              {CAR_OPTIONS.map((car) => (
                <option key={car} value={car}>
                  {car}
                </option>
              ))}
            </select>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <button onClick={handleSaveProfile} className="btn btn-primary" style={{ padding: '8px 18px' }}>
              Save Callsign & Car
            </button>
          </div>
        </div>
      )}

      {/* Sub navigation bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #232b3c',
          paddingBottom: '14px',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setSubTab('lobbies')}
            className={`btn ${subTab === 'lobbies' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Users size={15} /> Race Lobbies ({rooms.length})
          </button>
          {currentRoom && (
            <button
              onClick={() => setSubTab('room')}
              className={`btn ${subTab === 'room' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              <Flag size={15} /> Active Room: {currentRoom.code}
            </button>
          )}
          <button
            onClick={() => setSubTab('leaderboard')}
            className={`btn ${subTab === 'leaderboard' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Trophy size={15} /> Blacklist Records
          </button>
        </div>

        {/* Join by Code Form & Create Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <form onSubmit={handleJoinByCode} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
              placeholder="ENTER ROOM CODE"
              maxLength={8}
              style={{
                background: '#0a0d14',
                border: '1px solid #232b3c',
                color: '#f59e0b',
                fontFamily: 'JetBrains Mono, monospace',
                padding: '7px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                width: '150px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            />
            <button type="submit" className="btn btn-secondary" style={{ padding: '7px 14px', fontSize: '12px' }}>
              Join
            </button>
          </form>

          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
            style={{ padding: '7px 16px', fontSize: '12px' }}
          >
            <Plus size={15} /> Create Lobby
          </button>
        </div>
      </div>

      {/* --- TAB 1: LOBBIES BROWSER --- */}
      {subTab === 'lobbies' && (
        <div>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {['all', 'sprint', 'circuit', 'drag', 'speedtrap', 'pursuit_tag'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                style={{
                  background: selectedFilter === filter ? '#f59e0b' : '#141822',
                  color: selectedFilter === filter ? '#000' : '#94a3b8',
                  border: '1px solid #232b3c',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
              >
                {filter === 'pursuit_tag' ? 'Pursuit Tag' : filter}
              </button>
            ))}
          </div>

          {/* Rooms Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredRooms.map((room) => {
              const isFull = room.players.length >= room.maxPlayers;
              const isCurrent = currentRoom?.id === room.id;

              return (
                <div
                  key={room.id}
                  className="glass-panel"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: isCurrent ? '1px solid #f59e0b' : '1px solid #232b3c',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div>
                    {/* Top badging */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '10px',
                      }}
                    >
                      <span
                        style={{
                          background:
                            room.gameMode === 'circuit'
                              ? 'rgba(6, 182, 212, 0.15)'
                              : room.gameMode === 'pursuit_tag'
                              ? 'rgba(239, 68, 68, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            room.gameMode === 'circuit'
                              ? '#06b6d4'
                              : room.gameMode === 'pursuit_tag'
                              ? '#ef4444'
                              : '#f59e0b',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {room.gameMode.replace('_', ' ')}
                      </span>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          color: '#94a3b8',
                          fontSize: '12px',
                        }}
                      >
                        CODE: <strong style={{ color: '#fff' }}>{room.code}</strong>
                      </span>
                    </div>

                    <h3 style={{ fontSize: '17px', color: '#fff', marginBottom: '8px' }}>
                      {room.name}
                    </h3>

                    {/* Track info */}
                    <div style={{ color: '#cbd5e1', fontSize: '13px', marginBottom: '12px' }}>
                      🏁 <strong>{room.trackName}</strong> ({room.trackDistanceKm} km)
                    </div>

                    {/* Properties */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '6px',
                        fontSize: '12px',
                        color: '#94a3b8',
                        background: 'rgba(10, 14, 23, 0.6)',
                        padding: '10px 12px',
                        borderRadius: '6px',
                        marginBottom: '14px',
                      }}
                    >
                      <div>
                        Host: <span style={{ color: '#fff' }}>{room.hostName}</span>
                      </div>
                      <div>
                        Collision:{' '}
                        <span style={{ color: room.collisionMode === 'ghost' ? '#06b6d4' : '#f59e0b' }}>
                          {room.collisionMode === 'ghost' ? 'Ghost Rivals' : 'Contact'}
                        </span>
                      </div>
                      <div>
                        Racers:{' '}
                        <span style={{ color: isFull ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                          {room.players.length} / {room.maxPlayers}
                        </span>
                      </div>
                      <div>
                        Anti-Cheat:{' '}
                        <span style={{ color: room.modVerificationRequired ? '#10b981' : '#cbd5e1' }}>
                          {room.modVerificationRequired ? 'Enforced' : 'Open'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {isCurrent ? (
                      <button
                        onClick={() => setSubTab('room')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '9px 0', fontSize: '13px' }}
                      >
                        Open In-Game Room
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const ok = MultiplayerService.joinRoom(room.id);
                          if (ok) setSubTab('room');
                        }}
                        disabled={isFull}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '9px 0', fontSize: '13px' }}
                      >
                        {isFull ? 'Lobby Full' : 'Enter Lobby'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- TAB 2: ACTIVE ROOM VIEW --- */}
      {subTab === 'room' && currentRoom && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Left Column: Room Roster & Match Info */}
          <div>
            <div className="glass-panel" style={{ padding: '24px', marginBottom: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ fontSize: '22px', color: '#fff' }}>{currentRoom.name}</h2>
                    <span
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        color: '#f59e0b',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {currentRoom.gameMode.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
                    Course: <strong style={{ color: '#06b6d4' }}>{currentRoom.trackName}</strong> • {currentRoom.trackDistanceKm} km • Difficulty: {currentRoom.trackDifficulty}
                  </div>
                </div>

                {/* Room Code Badge */}
                <button
                  onClick={handleCopyCode}
                  style={{
                    background: '#0e131d',
                    border: '1px solid #232b3c',
                    color: '#f59e0b',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'JetBrains Mono, monospace',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                  title="Click to copy Room Code"
                >
                  {copiedCode ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  CODE: <strong>{currentRoom.code}</strong>
                </button>
              </div>

              {/* Player Roster Grid */}
              <h3 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>
                Connected Racers ({currentRoom.players.length} / {currentRoom.maxPlayers})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {currentRoom.players.map((p) => {
                  const isMe = p.id === localPlayer.id;
                  return (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: isMe ? 'rgba(245, 158, 11, 0.08)' : 'rgba(12, 16, 24, 0.7)',
                        border: isMe ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid #1e2635',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '20px' }}>{p.avatar}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>
                              {p.callsign} {isMe && '(You)'}
                            </span>
                            {p.isHost && (
                              <span
                                style={{
                                  background: 'rgba(245, 158, 11, 0.2)',
                                  color: '#f59e0b',
                                  fontSize: '10px',
                                  padding: '1px 6px',
                                  borderRadius: '3px',
                                  fontWeight: 700,
                                }}
                              >
                                HOST
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Car size={12} color="#06b6d4" /> {p.carModel}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                          {p.pingMs} ms
                        </span>
                        {p.modVerified ? (
                          <span
                            title="Anti-Cheat: Verified Vanilla Physics & Handling"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: '#10b981',
                            }}
                          >
                            <ShieldCheck size={14} /> Verified
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#f59e0b' }}>Modded</span>
                        )}

                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: p.isReady ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                            color: p.isReady ? '#10b981' : '#f87171',
                          }}
                        >
                          {p.isReady ? 'READY' : 'PREPARING'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Room Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => MultiplayerService.toggleReady()}
                  className={`btn ${localPlayer.isReady ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ flex: 1, padding: '10px 0' }}
                >
                  {localPlayer.isReady ? 'Set Preparing' : 'Toggle Ready'}
                </button>

                {localPlayer.isHost && (
                  <button
                    onClick={() => {
                      MultiplayerService.startRace();
                      onStartOnlineRace();
                    }}
                    className="btn btn-primary"
                    style={{
                      flex: 1.4,
                      padding: '10px 0',
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    <Play size={16} fill="#000" /> Launch Race Now
                  </button>
                )}

                <button
                  onClick={() => MultiplayerService.leaveRoom()}
                  className="btn btn-danger"
                  style={{ padding: '10px 18px' }}
                >
                  Leave Lobby
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat & Quick Taunts */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #232b3c', paddingBottom: '10px' }}>
              <MessageSquare size={16} color="#f59e0b" />
              <h3 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>Lobby Comms & Radio</h3>
            </div>

            {/* Chat Messages Log */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '6px',
                marginBottom: '14px',
              }}
            >
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    fontSize: '12.5px',
                    lineHeight: 1.4,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: msg.isSystem ? 'rgba(35, 43, 60, 0.4)' : msg.isTaunt ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 20, 29, 0.7)',
                    borderLeft: msg.isTaunt ? '3px solid #f59e0b' : msg.isSystem ? '3px solid #06b6d4' : 'none',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 700,
                      color: msg.isSystem ? '#06b6d4' : msg.senderId === localPlayer.id ? '#f59e0b' : '#cbd5e1',
                      marginRight: '6px',
                    }}
                  >
                    {msg.senderName}:
                  </span>
                  <span style={{ color: '#fff' }}>{msg.text}</span>
                </div>
              ))}
            </div>

            {/* Quick Taunt Macros */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                Quick Radio Taunts:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  'Eat my dust!',
                  'Cross is on my tail!',
                  'Hit the NOS!',
                  'You cannot beat the M3 GTR!',
                  'Pursuit Level 5 incoming!',
                ].map((taunt) => (
                  <button
                    key={taunt}
                    onClick={() => handleQuickTaunt(taunt)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid #232b3c',
                      color: '#cbd5e1',
                      fontSize: '11px',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {taunt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input form */}
            <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type radio message..."
                style={{
                  flex: 1,
                  background: '#0a0d14',
                  border: '1px solid #232b3c',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 3: LEADERBOARD RECORDS --- */}
      {subTab === 'leaderboard' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', color: '#fff' }}>Rockport Blacklist Leaderboard</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>
                Official WebGPU & WebAssembly time trial lap records across all competitive districts.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #232b3c', color: '#94a3b8' }}>
                  <th style={{ padding: '12px' }}>RANK</th>
                  <th style={{ padding: '12px' }}>RACER</th>
                  <th style={{ padding: '12px' }}>CAR MODEL</th>
                  <th style={{ padding: '12px' }}>CIRCUIT / TRACK</th>
                  <th style={{ padding: '12px' }}>BEST LAP</th>
                  <th style={{ padding: '12px' }}>TOP SPEED</th>
                  <th style={{ padding: '12px' }}>BOUNTY</th>
                  <th style={{ padding: '12px' }}>PLATFORM</th>
                </tr>
              </thead>
              <tbody>
                {INITIAL_LEADERBOARD.map((item) => (
                  <tr
                    key={item.rank}
                    style={{
                      borderBottom: '1px solid #1a202c',
                      background: item.rank === 1 ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '14px 12px', fontWeight: 700, color: item.rank === 1 ? '#f59e0b' : '#fff' }}>
                      #{item.rank}
                    </td>
                    <td style={{ padding: '14px 12px', fontWeight: 600, color: '#fff' }}>
                      {item.callsign}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#06b6d4' }}>
                      {item.carModel}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#cbd5e1' }}>
                      {item.trackName}
                    </td>
                    <td style={{ padding: '14px 12px', fontFamily: 'JetBrains Mono, monospace', color: '#10b981', fontWeight: 700 }}>
                      {item.bestTime}
                    </td>
                    <td style={{ padding: '14px 12px', fontFamily: 'JetBrains Mono, monospace', color: '#f59e0b' }}>
                      {item.topSpeedMph} MPH
                    </td>
                    <td style={{ padding: '14px 12px', color: '#e2e8f0' }}>
                      ${item.bounty.toLocaleString()}
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: '12px', color: '#94a3b8' }}>
                      {item.platform}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE ROOM MODAL */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '28px',
              border: '1px solid #f59e0b',
              boxShadow: '0 20px 40px rgba(0,0,0,0.9)',
            }}
          >
            <h2 style={{ fontSize: '20px', color: '#fff', marginBottom: '18px' }}>
              Host New Online Race Lobby
            </h2>

            <form onSubmit={handleCreateRoom}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  Lobby Room Name
                </label>
                <input
                  type="text"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="e.g. Camden Speedtrap Masters"
                  style={{
                    width: '100%',
                    background: '#0a0d14',
                    border: '1px solid #232b3c',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                  Select Course / Track
                </label>
                <select
                  value={createTrack}
                  onChange={(e) => setCreateTrack(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#0a0d14',
                    border: '1px solid #232b3c',
                    color: '#fff',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13.5px',
                  }}
                >
                  {TRACK_CATALOG.map((track) => (
                    <option key={track.id} value={track.id}>
                      {track.name} ({track.distanceKm} km - {track.difficulty})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    Game Mode
                  </label>
                  <select
                    value={createMode}
                    onChange={(e) => setCreateMode(e.target.value as GameMode)}
                    style={{
                      width: '100%',
                      background: '#0a0d14',
                      border: '1px solid #232b3c',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                    }}
                  >
                    <option value="sprint">Sprint</option>
                    <option value="circuit">Circuit</option>
                    <option value="drag">Drag</option>
                    <option value="speedtrap">Speedtrap</option>
                    <option value="pursuit_tag">Pursuit Tag</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    Car Tier
                  </label>
                  <select
                    value={createCarTier}
                    onChange={(e) => setCreateCarTier(e.target.value === 'open' ? 'open' : (Number(e.target.value) as CarTier))}
                    style={{
                      width: '100%',
                      background: '#0a0d14',
                      border: '1px solid #232b3c',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                    }}
                  >
                    <option value="open">Open (All Cars)</option>
                    <option value="1">Tier 1 (Exotics / Supercars)</option>
                    <option value="2">Tier 2 (Muscle & Sports)</option>
                    <option value="3">Tier 3 (Tuners)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    Max Racers
                  </label>
                  <select
                    value={createMaxPlayers}
                    onChange={(e) => setCreateMaxPlayers(Number(e.target.value))}
                    style={{
                      width: '100%',
                      background: '#0a0d14',
                      border: '1px solid #232b3c',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                    }}
                  >
                    <option value={2}>2 Racers (1v1 Duel)</option>
                    <option value={4}>4 Racers</option>
                    <option value={6}>6 Racers</option>
                    <option value={8}>8 Racers (Full Grid)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    Collision Mode
                  </label>
                  <select
                    value={createCollision}
                    onChange={(e) => setCreateCollision(e.target.value as 'ghost' | 'contact')}
                    style={{
                      width: '100%',
                      background: '#0a0d14',
                      border: '1px solid #232b3c',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                    }}
                  >
                    <option value="ghost">Ghost Rivals (No Griefing)</option>
                    <option value="contact">Full Contact Physics</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '6px' }}>
                    Anti-Cheat Mod Verification
                  </label>
                  <select
                    value={createModVerify ? 'true' : 'false'}
                    onChange={(e) => setCreateModVerify(e.target.value === 'true')}
                    style={{
                      width: '100%',
                      background: '#0a0d14',
                      border: '1px solid #232b3c',
                      color: '#fff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '13.5px',
                    }}
                  >
                    <option value="true">Enforced (Vanilla 120 Hz Physics)</option>
                    <option value="false">Allow All Custom Mods</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px' }}>
                  Create Lobby
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
