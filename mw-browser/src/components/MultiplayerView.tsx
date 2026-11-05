import React, { useState, useEffect, useRef } from 'react';
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
  Radio,
  Wifi,
  WifiOff,
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

const QUICK_TAUNTS = [
  'Eat my dust!',
  'Cross is on my tail!',
  'Hit the NOS!',
  'You cannot beat the M3 GTR!',
  'Pursuit Level 5 incoming!',
  'See you at the finish line!',
];

export const MultiplayerView: React.FC<MultiplayerViewProps> = ({ onStartOnlineRace }) => {
  const [subTab, setSubTab] = useState<'lobbies' | 'chat' | 'room' | 'leaderboard'>('lobbies');
  const [rooms, setRooms] = useState<LobbyRoom[]>(MultiplayerService.getRooms());
  const [currentRoom, setCurrentRoom] = useState<LobbyRoom | null>(MultiplayerService.getCurrentRoom());
  const [localPlayer, setLocalPlayer] = useState<MultiplayerPlayer>(MultiplayerService.getLocalPlayer());
  const [isMqttConnected, setIsMqttConnected] = useState<boolean>(MultiplayerService.getIsConnected());

  // Room chat
  const [roomChatMessages, setRoomChatMessages] = useState<ChatMessage[]>(MultiplayerService.getRoomChatMessages());
  const [roomChatInput, setRoomChatInput] = useState('');

  // Global Synced chat
  const [globalChatMessages, setGlobalChatMessages] = useState<ChatMessage[]>(MultiplayerService.getGlobalChatMessages());
  const [globalChatInput, setGlobalChatInput] = useState('');

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

  // Auto-scroll chat boxes
  const globalChatEndRef = useRef<HTMLDivElement>(null);
  const roomChatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubRooms = MultiplayerService.subscribeRoomsList(setRooms);
    const unsubRoom = MultiplayerService.subscribeRoom((r) => {
      setCurrentRoom(r);
      if (r) setSubTab('room');
    });
    const unsubRoomChat = MultiplayerService.subscribeChat(setRoomChatMessages);
    const unsubGlobalChat = MultiplayerService.subscribeGlobalChat((msgs) => {
      setGlobalChatMessages(msgs);
    });
    const unsubStatus = MultiplayerService.subscribeOnlineStatus(setIsMqttConnected);
    const unsubRaceStart = MultiplayerService.subscribeRaceStart(() => {
      onStartOnlineRace();
    });

    return () => {
      unsubRooms();
      unsubRoom();
      unsubRoomChat();
      unsubGlobalChat();
      unsubStatus();
      unsubRaceStart();
    };
  }, [onStartOnlineRace]);

  useEffect(() => {
    globalChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [globalChatMessages]);

  useEffect(() => {
    roomChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomChatMessages]);

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
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;
    const ok = MultiplayerService.joinRoom(code);
    if (ok) {
      setJoinCodeInput('');
      setSubTab('room');
    } else {
      alert(`Room code "${code}" was not found or the lobby is full.`);
    }
  };

  const handleSendRoomChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomChatInput.trim()) return;
    MultiplayerService.sendChatMessage(roomChatInput);
    setRoomChatInput('');
  };

  const handleSendGlobalChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!globalChatInput.trim()) return;
    MultiplayerService.sendGlobalChat(globalChatInput);
    setGlobalChatInput('');
  };

  const handleQuickGlobalTaunt = (tauntText: string) => {
    MultiplayerService.sendGlobalChat(tauntText, true);
  };

  const handleQuickRoomTaunt = (tauntText: string) => {
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

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner & Online Grid Status */}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
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
              <Zap size={13} /> Rockport Online Grid • 120 Hz Telemetry
            </span>

            <span
              style={{
                background: isMqttConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: isMqttConnected ? '#10b981' : '#f59e0b',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              {isMqttConnected ? (
                <>
                  <Wifi size={13} /> Real-Time Synced (MQTT / WebSockets)
                </>
              ) : (
                <>
                  <WifiOff size={13} /> Connecting to Rockport Mesh...
                </>
              )}
            </span>

            <span
              style={{
                background: 'rgba(6, 182, 212, 0.15)',
                color: '#06b6d4',
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
          <p style={{ color: '#94a3b8', fontSize: '13.5px', maxWidth: '720px', margin: 0 }}>
            Real-time peer multiplayer with synchronized telemetry, private 6-character room codes,
            anti-cheat mod verification, and a live driver radio synced across everyone on the website.
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
                  padding: 0,
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

      {/* Sub Navigation Bar */}
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setSubTab('lobbies')}
            className={`btn ${subTab === 'lobbies' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <Users size={15} /> Race Lobbies ({rooms.length})
          </button>

          <button
            onClick={() => setSubTab('chat')}
            className={`btn ${subTab === 'chat' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            <MessageSquare size={15} /> Global Driver Radio ({globalChatMessages.length})
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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

      {/* --- TAB 1: LOBBIES BROWSER + SIDEBAR GLOBAL CHAT --- */}
      {subTab === 'lobbies' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.6fr) minmax(320px, 1fr)', gap: '24px' }}>
          {/* Left Column: Active Rooms & Lobbies */}
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

            {/* Real Rooms Grid / Clean Empty State */}
            {filteredRooms.length === 0 ? (
              <div
                className="glass-panel"
                style={{
                  padding: '48px 32px',
                  textAlign: 'center',
                  border: '1px dashed #232b3c',
                  background: 'rgba(10, 14, 23, 0.4)',
                }}
              >
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px',
                    color: '#f59e0b',
                  }}
                >
                  <Users size={30} />
                </div>
                <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '8px' }}>
                  No Active Race Lobbies Found
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '13.5px', maxWidth: '480px', margin: '0 auto 24px', lineHeight: 1.5 }}>
                  All fake bot lobbies have been removed. Be the first driver to host a race, or enter a 6-character room code from a friend above to start competing!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary"
                    style={{ padding: '10px 22px', fontSize: '13px' }}
                  >
                    <Plus size={16} /> Host Custom Race Lobby
                  </button>
                  <button
                    onClick={() => setSubTab('chat')}
                    className="btn btn-secondary"
                    style={{ padding: '10px 20px', fontSize: '13px' }}
                  >
                    <MessageSquare size={16} /> Open Driver Radio Lounge
                  </button>
                </div>

                <div
                  style={{
                    marginTop: '32px',
                    paddingTop: '20px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    fontSize: '12px',
                    color: '#64748b',
                    flexWrap: 'wrap',
                  }}
                >
                  <span>✓ 120 Hz Dead Reckoning</span>
                  <span>✓ Real P2P WebSockets Sync</span>
                  <span>✓ Anti-Cheat Mod Verification</span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '18px',
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
                        {/* Top Badging */}
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
            )}
          </div>

          {/* Right Column: Embedded Global Driver Radio & Synced Chat */}
          <div
            className="glass-panel"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              height: '620px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '12px',
                borderBottom: '1px solid #232b3c',
                marginBottom: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={16} color="#f59e0b" />
                <h3 style={{ fontSize: '14.5px', color: '#fff', margin: 0, fontWeight: 700 }}>
                  Global Driver Radio
                </h3>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  color: isMqttConnected ? '#10b981' : '#f59e0b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: isMqttConnected ? '#10b981' : '#f59e0b',
                    display: 'inline-block',
                  }}
                />
                {isMqttConnected ? 'Live Network Synced' : 'Connecting'}
              </span>
            </div>

            <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 10px 0' }}>
              Live messages broadcast to all drivers across the website in real-time. History persists in browser.
            </p>

            {/* Chat Messages Feed */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                paddingRight: '6px',
                marginBottom: '12px',
              }}
            >
              {globalChatMessages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                  No messages yet. Send a radio dispatch below!
                </div>
              ) : (
                globalChatMessages.map((msg) => {
                  const isMe = msg.senderId === localPlayer.id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        fontSize: '12px',
                        lineHeight: 1.4,
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: msg.isSystem
                          ? 'rgba(6, 182, 212, 0.12)'
                          : msg.isTaunt
                          ? 'rgba(245, 158, 11, 0.12)'
                          : isMe
                          ? 'rgba(245, 158, 11, 0.08)'
                          : 'rgba(15, 20, 30, 0.75)',
                        borderLeft: msg.isTaunt
                          ? '3px solid #f59e0b'
                          : msg.isSystem
                          ? '3px solid #06b6d4'
                          : isMe
                          ? '3px solid #f59e0b'
                          : '1px solid #1e2635',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '3px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '13px' }}>{msg.avatar || '🏎️'}</span>
                          <span
                            style={{
                              fontWeight: 700,
                              color: msg.isSystem ? '#06b6d4' : isMe ? '#f59e0b' : '#93c5fd',
                            }}
                          >
                            {msg.senderName} {isMe && '(You)'}
                          </span>
                          {msg.carModel && (
                            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                              • {msg.carModel}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '10px', color: '#475569' }}>
                          {formatTime(msg.timestamp)}
                        </span>
                      </div>
                      <div style={{ color: '#f1f5f9', wordBreak: 'break-word' }}>{msg.text}</div>
                    </div>
                  );
                })
              )}
              <div ref={globalChatEndRef} />
            </div>

            {/* Quick Radio Taunts */}
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '5px', textTransform: 'uppercase' }}>
                Quick Radio Taunts:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                {QUICK_TAUNTS.slice(0, 4).map((taunt) => (
                  <button
                    key={taunt}
                    type="button"
                    onClick={() => handleQuickGlobalTaunt(taunt)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid #232b3c',
                      color: '#cbd5e1',
                      fontSize: '10.5px',
                      padding: '3px 7px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {taunt}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendGlobalChat} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={globalChatInput}
                onChange={(e) => setGlobalChatInput(e.target.value)}
                placeholder="Broadcast to all drivers..."
                style={{
                  flex: 1,
                  background: '#0a0d14',
                  border: '1px solid #232b3c',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                }}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px' }}>
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- TAB 2: EXPANDED FULL-SCREEN GLOBAL DRIVER CHAT --- */}
      {subTab === 'chat' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              paddingBottom: '14px',
              borderBottom: '1px solid #232b3c',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={20} color="#f59e0b" />
                <h2 style={{ fontSize: '20px', color: '#fff', margin: 0 }}>
                  Rockport Citywide Driver Radio & Comms
                </h2>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0 0' }}>
                Public radio frequency synced across every active website visitor via MQTT WebSockets.
                Chat history is preserved in browser storage.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: isMqttConnected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isMqttConnected ? '#10b981' : '#f59e0b',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                {isMqttConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                {isMqttConnected ? 'Live Network Synced' : 'Connecting to Mesh...'}
              </span>

              <button
                onClick={() => setSubTab('lobbies')}
                className="btn btn-secondary"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Back to Lobbies
              </button>
            </div>
          </div>

          {/* Full Screen Chat Log */}
          <div
            style={{
              height: '460px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              padding: '16px',
              background: 'rgba(10, 14, 23, 0.65)',
              borderRadius: '8px',
              border: '1px solid #1e2635',
              marginBottom: '16px',
            }}
          >
            {globalChatMessages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: '#64748b' }}>
                No dispatches on this frequency yet. Send the first radio message!
              </div>
            ) : (
              globalChatMessages.map((msg) => {
                const isMe = msg.senderId === localPlayer.id;
                return (
                  <div
                    key={msg.id}
                    style={{
                      fontSize: '13px',
                      lineHeight: 1.45,
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: msg.isSystem
                        ? 'rgba(6, 182, 212, 0.12)'
                        : msg.isTaunt
                        ? 'rgba(245, 158, 11, 0.12)'
                        : isMe
                        ? 'rgba(245, 158, 11, 0.08)'
                        : 'rgba(20, 26, 38, 0.8)',
                      borderLeft: msg.isTaunt
                        ? '4px solid #f59e0b'
                        : msg.isSystem
                        ? '4px solid #06b6d4'
                        : isMe
                        ? '4px solid #f59e0b'
                        : '1px solid #232b3c',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px' }}>{msg.avatar || '🏎️'}</span>
                        <span
                          style={{
                            fontWeight: 700,
                            color: msg.isSystem ? '#06b6d4' : isMe ? '#f59e0b' : '#93c5fd',
                          }}
                        >
                          {msg.senderName} {isMe && '(You)'}
                        </span>
                        {msg.carModel && (
                          <span
                            style={{
                              fontSize: '11px',
                              color: '#94a3b8',
                              background: 'rgba(255, 255, 255, 0.05)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            <Car size={11} style={{ display: 'inline', marginRight: '4px' }} />
                            {msg.carModel}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div style={{ color: '#fff', fontSize: '13.5px', marginTop: '2px' }}>
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={globalChatEndRef} />
          </div>

          {/* Quick Taunts Row */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
              Quick Radio Taunt Shortcuts:
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {QUICK_TAUNTS.map((taunt) => (
                <button
                  key={taunt}
                  type="button"
                  onClick={() => handleQuickGlobalTaunt(taunt)}
                  style={{
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#f59e0b',
                    fontSize: '12px',
                    padding: '5px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
                  {taunt}
                </button>
              ))}
            </div>
          </div>

          {/* Send Input */}
          <form onSubmit={handleSendGlobalChat} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={globalChatInput}
              onChange={(e) => setGlobalChatInput(e.target.value)}
              placeholder="Send live radio dispatch to all drivers across the website..."
              style={{
                flex: 1,
                background: '#0a0d14',
                border: '1px solid #232b3c',
                color: '#fff',
                padding: '10px 16px',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '14px' }}>
              <Send size={16} /> Broadcast
            </button>
          </form>
        </div>
      )}

      {/* --- TAB 3: ACTIVE ROOM VIEW --- */}
      {subTab === 'room' && currentRoom && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: '24px' }}>
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
                    <h2 style={{ fontSize: '22px', color: '#fff', margin: 0 }}>{currentRoom.name}</h2>
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
              <h3 style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px', textTransform: 'uppercase' }}>
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

          {/* Right Column: In-Room Live Chat & Quick Taunts */}
          <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '560px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #232b3c', paddingBottom: '10px' }}>
              <MessageSquare size={16} color="#f59e0b" />
              <h3 style={{ fontSize: '15px', color: '#fff', margin: 0 }}>Lobby Comms & Radio</h3>
            </div>

            {/* Room Chat Messages Log */}
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
              {roomChatMessages.map((msg) => (
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
              <div ref={roomChatEndRef} />
            </div>

            {/* Quick Taunt Macros */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase' }}>
                Quick Radio Taunts:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {QUICK_TAUNTS.map((taunt) => (
                  <button
                    key={taunt}
                    type="button"
                    onClick={() => handleQuickRoomTaunt(taunt)}
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

            {/* Room Chat Input form */}
            <form onSubmit={handleSendRoomChat} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={roomChatInput}
                onChange={(e) => setRoomChatInput(e.target.value)}
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

      {/* --- TAB 4: LEADERBOARD RECORDS --- */}
      {subTab === 'leaderboard' && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '20px', color: '#fff', margin: 0 }}>Rockport Blacklist Leaderboard</h2>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
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
