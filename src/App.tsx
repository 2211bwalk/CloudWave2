/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Music, 
  Radio, 
  Volume2, 
  VolumeX,
  Volume1,
  Loader2,
  AlertCircle,
  X,
  Copy,
  Check,
  Coins,
  SkipBack,
  SkipForward,
  Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Track, PLAYLIST } from './tracks';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RadioState {
  status: 'playing' | 'stopped';
}

export default function App() {
  return (
    <RadioApp />
  );
}

function RadioApp() {
  const tracks: Track[] = PLAYLIST;

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [shuffleQueue, setShuffleQueue] = useState<number[]>([]);
  const [radioState, setRadioState] = useState<RadioState>({
    status: 'stopped'
  });

  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('radio-muted');
    return saved ? JSON.parse(saved) : false;
  });
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('radio-volume');
    return saved ? parseFloat(saved) : 0.7;
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const btcAddress = "bc1qhd3dzcz2xyurxgydgwa60h5m5728yzfe2r96gu";

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playPromiseRef = useRef<Promise<void> | null>(null);

  // Persist volume and muted state
  useEffect(() => {
    localStorage.setItem('radio-volume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    localStorage.setItem('radio-muted', JSON.stringify(isMuted));
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Reset shuffle queue when shuffle is toggled off
  useEffect(() => {
    if (!isShuffle) {
      setShuffleQueue([]);
    }
  }, [isShuffle]);

  // Audio logic
  useEffect(() => {
    if (!audioRef.current || !hasInteracted) return;

    const audio = audioRef.current;
    const currentTrack = tracks[currentTrackIndex];

    const handlePlay = async () => {
      try {
        if (radioState.status === 'playing') {
          console.log("Loading:", currentTrack.url);
          
          // Fully controlled track switching
          audio.pause();
          audio.crossOrigin = "anonymous";
          audio.src = currentTrack.url;
          audio.load();

          // Wait for canplaythrough before play()
          const onCanPlayThrough = async () => {
            try {
              audioRef.current.play();
              playPromiseRef.current = audio.play();
              await playPromiseRef.current;
            } catch (err: any) {
              if (err.name !== 'AbortError') {
                console.error("Play failed:", err);
                setAudioError(`Playback error: ${err.message}`);
              }
            } finally {
              playPromiseRef.current = null;
            }
          };

          audio.addEventListener("canplaythrough", onCanPlayThrough, { once: true });
        } else {
          audio.pause();
        }
      } catch (e: any) {
        console.error("Audio state transition failed:", e);
      }
    };

    handlePlay();

    // Error recovery: automatically skip on error
    audio.onerror = () => {
      console.log("Track failed, skipping:", currentTrack.url);
      handleNext();
    };
    
    return () => {
      audio.onerror = null;
    };
  }, [radioState.status, hasInteracted, currentTrackIndex]);

  // Update current time for UI
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && radioState.status === 'playing') {
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [radioState.status]);

  const togglePlay = () => {
    setRadioState(prev => ({
      status: prev.status === 'playing' ? 'stopped' : 'playing'
    }));
  };

  const handleRetry = () => {
    setAudioError(null);
    if (audioRef.current) {
      audioRef.current.load();
      if (radioState.status === 'playing') {
        playPromiseRef.current = audioRef.current.play();
      }
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(btcAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNext = () => {
    if (isShuffle) {
      let nextQueue = [...shuffleQueue];
      
      if (nextQueue.length === 0) {
        const indices = Array.from({ length: tracks.length }, (_, i) => i)
          .filter(i => i !== currentTrackIndex);
        
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        
        const nextIndex = indices[0];
        setShuffleQueue(indices.slice(1));
        setCurrentTrackIndex(nextIndex);
      } else {
        const nextIndex = nextQueue[0];
        setShuffleQueue(nextQueue.slice(1));
        setCurrentTrackIndex(nextIndex);
      }
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    }
  };

  const skipPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const currentTrack = tracks[currentTrackIndex];

  // Auto-scroll active track into view
  useEffect(() => {
    const activeItem = document.getElementById(`track-item-${currentTrackIndex}`);
    if (activeItem && radioState.status === 'playing') {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [currentTrackIndex, radioState.status]);

  // Calculate Queue
  const queueIndices = isShuffle 
    ? shuffleQueue 
    : tracks.map((_, i) => i).slice(currentTrackIndex + 1);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans selection:bg-indigo-500/30 flex flex-col">
      <audio
        key={currentTrack.url}
        ref={audioRef}
        src={currentTrack.url}
        onEnded={handleNext}
        preload="auto"
      />

      {/* Join Broadcast Overlay */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-6"
          >
            <div className="max-w-sm w-full text-center space-y-8">
              <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/40 animate-bounce">
                <Radio className="w-12 h-12 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Tune In</h2>
                <p className="text-white/40">Continuous radio stream with autoplay and live rotation.</p>
              </div>
              <button 
                onClick={() => {
                  setHasInteracted(true);
                  setRadioState({ status: 'playing' });
                }}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-indigo-500/20"
              >
                Start Radio
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
  src="/icon.png" 
  alt="CloudWave Icon" 
  className="w-14 h-14"
/>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <img 
  src="/logo.png" 
  alt="CloudWave Radio" 
  className="h-16 w-auto"
/>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/20 rounded-md">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-red-500 tracking-wider">LIVE</span>
                </div>
              </div>
              <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em] leading-none mt-1">
                Stream the Wave
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Public Player - No Auth Required */}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
        {/* Left Column: Player & Visualizer */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-square lg:aspect-video bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-3xl border border-white/5 overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                {currentTrack ? (
                  <motion.div 
                    key={currentTrack.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    className="text-center space-y-6 px-12 z-10"
                  >
                    <div className="w-56 h-56 mx-auto relative group">
                      <div className="absolute inset-0 bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/40 transition-colors rounded-full" />
                      <div className="relative aspect-square bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                        {currentTrack.cover ? (
                          <img 
                            src={currentTrack.cover} 
                            alt={currentTrack.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className={cn(
                              "w-24 h-24 text-indigo-400 transition-all duration-1000",
                              radioState.status === 'playing' && "animate-pulse scale-110"
                            )} />
                          </div>
                        )}
                        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-md">
                          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-bold text-white tracking-wider">LIVE</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className="text-[10px] font-mono text-indigo-400 font-bold tracking-widest uppercase py-1 px-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                          Radio Mode: ON
                        </span>
                      </div>
                      <h2 id="trackTitle" className="text-3xl font-bold mb-2">{currentTrack.title}</h2>
                      <p className="text-white/40 text-lg">{currentTrack.artist}</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-center text-white/20">
                    <Radio className="w-24 h-24 mx-auto mb-4 opacity-20" />
                    <p className="text-xl">No track playing</p>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Visualizer bars (mock) */}
            <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 px-12 pb-8 opacity-30">
              {[...Array(40)].map((_, i) => (
                <motion.div 
                  key={i}
                  animate={{ 
                    height: radioState.status === 'playing' ? [20, Math.random() * 80 + 20, 20] : 10 
                  }}
                  transition={{ 
                    duration: 0.5 + Math.random(), 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-1 bg-indigo-500 rounded-full"
                />
              ))}
            </div>

            {/* Audio Status Overlays */}
            <AnimatePresence>
              {audioError && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute top-6 left-6 right-6 bg-red-500/90 backdrop-blur-md px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-medium shadow-lg border border-red-400/20"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="flex-1">{audioError}</p>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleRetry}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-xs font-bold"
                    >
                      Retry
                    </button>
                    <button onClick={() => setAudioError(null)} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {isMuted && radioState.status === 'playing' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-6 right-6 bg-yellow-500/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-black shadow-lg"
                >
                  <VolumeX className="w-4 h-4" />
                  MUTED
                </motion.div>
              )}

              {volume === 0 && !isMuted && radioState.status === 'playing' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute top-6 right-6 bg-yellow-500/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold text-black shadow-lg"
                >
                  <Volume1 className="w-4 h-4" />
                  VOLUME IS 0
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 border border-white/5 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <button 
                  onClick={skipPrev}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
                  title="Previous"
                >
                  <SkipBack className="w-6 h-6" />
                </button>
                <button 
                  onClick={togglePlay}
                  className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shrink-0"
                >
                  {radioState.status === 'playing' ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
                <button 
                  onClick={handleNext}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/60 hover:text-white"
                  title="Next"
                >
                  <SkipForward className="w-6 h-6" />
                </button>
                <button 
                  onClick={() => setIsShuffle(!isShuffle)}
                  className={cn(
                    "p-3 rounded-full transition-all",
                    isShuffle ? "bg-indigo-600/20 text-indigo-400" : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                  title="Shuffle"
                >
                  <Shuffle className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleRetry}
                  className="p-3 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
                  title="Refresh Stream"
                >
                  <Loader2 className={cn("w-5 h-5", radioState.status === 'playing' && "animate-spin-slow")} />
                </button>
              </div>

              <div className="flex items-center gap-4 min-w-[200px]">
                <button 
                  onClick={() => setIsMuted(!isMuted)} 
                  className={cn(
                    "transition-colors",
                    isMuted ? "text-red-500" : "text-white/60 hover:text-white"
                  )}
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>
                <div className="relative flex-1 flex items-center group">
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setVolume(v);
                    }}
                    className={cn(
                      "w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white transition-opacity",
                      isMuted && "opacity-50"
                    )}
                  />
                  {isMuted && (
                    <div className="absolute left-0 right-0 h-[2px] bg-red-500/50 pointer-events-none rounded-full" />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500"
                  animate={{ width: `${(currentTime / (currentTrack?.duration || 1)) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>
              <div className="flex justify-between text-xs font-mono text-white/40">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(currentTrack?.duration || 0)}</span>
              </div>
              {import.meta.env.DEV && (
                <div className="text-[10px] font-mono text-indigo-400/60 text-center pt-2 border-t border-white/5">
                  DEBUG: Loading {currentTrack?.title}
                </div>
              )}
            </div>
          </div>

          {/* BTC Tip Section */}
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 rounded-3xl p-8 border border-indigo-500/20 space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
              <Coins className="w-24 h-24 text-indigo-400 rotate-12" />
            </div>
            
            <div className="space-y-2 relative z-10">
              <h3 className="text-xl font-bold tracking-tight">Support the Stream</h3>
              <p className="text-white/40 text-sm">Keep the waves rolling with a small contribution.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 relative z-10">
              <div className="flex-1 space-y-4">
                <button 
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                >
                  <Coins className="w-5 h-5" />
                  Tip in BTC
                </button>
                
                <div className="space-y-1 px-1">
                  <label className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Bitcoin Tips</label>
                  <div className="text-xs font-mono text-indigo-300/80 truncate bg-black/20 p-3 rounded-xl border border-white/5">
                    {btcAddress}
                  </div>
                </div>
              </div>

              <div className="sm:w-48 flex flex-col justify-end">
                <button 
                  onClick={handleCopy}
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border active:scale-[0.98]",
                    copied 
                      ? "bg-green-500/20 border-green-500/50 text-green-400" 
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-white"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy BTC Address
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Playlist & Queue */}
        <div className="lg:col-span-5 space-y-8">
          {queueIndices.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Next Up
                  <span className="text-xs font-mono text-white/20 font-normal py-0.5 px-2 bg-white/5 rounded-full uppercase tracking-widest">In {isShuffle ? 'Shuffle' : 'Linear'}</span>
                </h3>
              </div>
              <div className="space-y-3">
                {queueIndices.slice(0, 3).map((trackIdx, i) => {
                  const track = tracks[trackIdx];
                  return (
                    <motion.div 
                      key={`queue-${track.id}-${i}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-3 bg-white/5 rounded-xl border border-white/5 flex items-center gap-3 group hover:bg-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden shrink-0 border border-white/5 flex items-center justify-center">
                        {track.cover ? (
                          <img 
                            src={track.cover} 
                            alt={track.title}
                            className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <Music className="w-5 h-5 text-white/20" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold truncate group-hover:text-indigo-300 transition-colors">{track.title}</h4>
                        <p className="text-xs text-white/30 truncate">{track.artist}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">Live Rotation</h3>
              </div>
              <span className="text-xs font-mono text-white/40 uppercase tracking-widest">{tracks.length} tracks</span>
            </div>

            <div id="live-rotation-list" className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {tracks.map((track, index) => (
                <motion.div 
                  key={track.id}
                  id={`track-item-${index}`}
                  layout
                  onClick={() => {
                    setCurrentTrackIndex(index);
                    setRadioState({ status: 'playing' });
                  }}
                   className={cn(
                    "p-4 rounded-2xl border cursor-pointer transition-all relative overflow-hidden",
                    currentTrackIndex === index 
                      ? "bg-indigo-500/20 border-indigo-500/40 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500/30" 
                      : "bg-white/5 border-white/5 hover:bg-white/10"
                  )}
                >
                  {currentTrackIndex === index && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"
                    />
                  )}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                    {currentTrackIndex === index && radioState.status === 'playing' ? (
                      <div className="flex items-end gap-0.5 h-4">
                        <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-indigo-400" />
                        <motion.div animate={{ height: [8, 4, 8] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1 bg-indigo-400" />
                        <motion.div animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-indigo-400" />
                      </div>
                    ) : (
                      <Music className={cn("w-5 h-5", currentTrackIndex === index ? "text-indigo-400" : "text-white/20")} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn("font-semibold truncate", currentTrackIndex === index && "text-indigo-300")}>{track.title}</h4>
                    <p className="text-sm text-white/40 truncate">{track.artist}</p>
                  </div>
                  <div className="text-xs font-mono text-white/20">
                    {formatTime(track.duration)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 text-center text-xs text-white/20 border-t border-white/5 bg-black/20">
        <p>© 2026 CloudWave Radio • Built with Google AI Studio</p>
      </footer>
    </div>
  );
}

function formatTime(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
