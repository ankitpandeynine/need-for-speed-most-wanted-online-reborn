import React, { useEffect, useState } from 'react';
import { EATraxSong } from '../types';
import { EATraxService, EA_TRAX_PLAYLIST } from '../services/eaTrax';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  Radio,
  Disc,
} from 'lucide-react';

export const EATraxView: React.FC = () => {
  const trax = EATraxService.getInstance();
  const [currentSong, setCurrentSong] = useState<EATraxSong>(trax.getCurrentTrack());
  const [isPlaying, setIsPlaying] = useState<boolean>(trax.getIsPlaying());
  const [volume, setVolume] = useState<number>(0.6);

  useEffect(() => {
    const unsub = trax.subscribe((song) => {
      setCurrentSong(song);
      setIsPlaying(trax.getIsPlaying());
    });
    return unsub;
  }, []);

  const handleTogglePlay = () => {
    trax.togglePlay();
    setIsPlaying(trax.getIsPlaying());
  };

  const handleNext = () => {
    trax.nextTrack();
    setCurrentSong(trax.getCurrentTrack());
    setIsPlaying(trax.getIsPlaying());
  };

  const handlePrev = () => {
    trax.prevTrack();
    setCurrentSong(trax.getCurrentTrack());
    setIsPlaying(trax.getIsPlaying());
  };

  const handleSelectSong = (index: number) => {
    trax.selectTrack(index);
    trax.play();
    setCurrentSong(trax.getCurrentTrack());
    setIsPlaying(true);
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    trax.setVolume(newVol);
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1280px', margin: '0 auto', color: '#fff' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: 800, fontSize: '12px' }}>
            <Radio size={18} />
            <span>ELECTRONIC ARTS SOUNDTRACK ENGINE</span>
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', textTransform: 'uppercase', margin: '4px 0' }}>
            EA TRAX™ JUKEBOX
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Experience the original 2005 Need for Speed: Most Wanted soundtrack with dynamic pursuit suites and rock/metal hits.
          </p>
        </div>

        {/* Current Playing Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(16, 20, 28, 0.9)', padding: '12px 20px', borderRadius: '14px', border: '1px solid #283142' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              animation: isPlaying ? 'spin 4s linear infinite' : 'none',
            }}
          >
            <Disc size={22} />
          </div>
          <div>
            <div style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 800 }}>NOW PLAYING</div>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>{currentSong.title}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{currentSong.artist}</div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
        {/* Tracklist Table */}
        <div style={{ background: 'rgba(16, 20, 28, 0.85)', borderRadius: '16px', border: '1px solid #283142', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #283142', display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
            <span>TRACK / ARTIST</span>
            <span>GENRE • DURATION</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {EA_TRAX_PLAYLIST.map((song, i) => {
              const isSelected = song.id === currentSong.id;
              return (
                <div
                  key={song.id}
                  onClick={() => handleSelectSong(i)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 24px',
                    borderBottom: '1px solid #1c2331',
                    background: isSelected ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                    borderLeft: isSelected ? '4px solid #f59e0b' : '4px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '24px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: isSelected ? '#f59e0b' : '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                      {isSelected && isPlaying ? (
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '14px' }}>
                          <span style={{ width: '3px', height: '12px', background: '#f59e0b', animation: 'pulse 0.8s infinite' }} />
                          <span style={{ width: '3px', height: '8px', background: '#f59e0b', animation: 'pulse 0.5s infinite' }} />
                          <span style={{ width: '3px', height: '14px', background: '#f59e0b', animation: 'pulse 0.9s infinite' }} />
                        </div>
                      ) : (
                        i + 1
                      )}
                    </div>

                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: isSelected ? '#f59e0b' : '#fff' }}>
                        {song.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {song.artist} • <span style={{ color: '#64748b' }}>{song.album} ({song.year})</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background:
                          song.genre === 'Metal'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : song.genre === 'Electronic'
                            ? 'rgba(6, 182, 212, 0.2)'
                            : 'rgba(245, 158, 11, 0.2)',
                        color:
                          song.genre === 'Metal'
                            ? '#f87171'
                            : song.genre === 'Electronic'
                            ? '#22d3ee'
                            : '#f59e0b',
                      }}
                    >
                      {song.genre}
                    </span>

                    <span style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8' }}>
                      {formatDuration(song.durationSec)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Player Controls & Visualizer Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Vinyl Album Cover Display */}
          <div
            style={{
              padding: '28px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(20, 25, 36, 0.95), rgba(10, 13, 18, 0.98))',
              border: '1px solid #283142',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {/* Spinning Disc */}
            <div
              style={{
                width: '140px',
                height: '140px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #283142 20%, #0d121c 60%, #000 100%)',
                border: '4px solid #333d4d',
                boxShadow: '0 8px 30px rgba(0,0,0,0.85)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: isPlaying ? 'spin 3s linear infinite' : 'none',
                marginBottom: '20px',
              }}
            >
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Disc size={24} color="#000" />
              </div>
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 900, fontFamily: 'Chakra Petch, sans-serif', margin: '0 0 4px 0' }}>
              {currentSong.title}
            </h3>
            <div style={{ fontSize: '13px', color: '#f59e0b', fontWeight: 700 }}>{currentSong.artist}</div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{currentSong.album}</div>

            {/* Playback Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
              <button
                onClick={handlePrev}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <SkipBack size={18} />
              </button>

              <button
                onClick={handleTogglePlay}
                style={{
                  background: '#f59e0b',
                  border: 'none',
                  borderRadius: '50%',
                  width: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#000',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(245, 158, 11, 0.4)',
                }}
              >
                {isPlaying ? <Pause size={24} fill="#000" /> : <Play size={24} fill="#000" style={{ marginLeft: '3px' }} />}
              </button>

              <button
                onClick={handleNext}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                <SkipForward size={18} />
              </button>
            </div>

            {/* Volume Slider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '22px', width: '100%' }}>
              <Volume2 size={16} color="#94a3b8" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                style={{ flex: 1, accentColor: '#f59e0b', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#94a3b8', width: '32px' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
