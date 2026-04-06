/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mic, Power, Globe, XCircle, AlertCircle } from "lucide-react";
import { AudioStreamer } from "./lib/audio-streamer";
import { LiveSession, SessionState } from "./lib/live-session";
import { Visualizer } from "./components/Visualizer";

export default function App() {
  const [state, setState] = useState<SessionState>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [frequencyData, setFrequencyData] = useState<Uint8Array>(new Uint8Array(0));
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const liveSessionRef = useRef<LiveSession | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Initialize session and streamer
    liveSessionRef.current = new LiveSession({
      onStateChange: (newState) => setState(newState),
      onAudioOutput: (base64) => audioStreamerRef.current?.playAudioChunk(base64),
      onInterrupted: () => audioStreamerRef.current?.interrupt(),
      onError: (err) => {
        console.error("Session Error:", err);
        setError("Something went wrong. Myra is taking a break.");
        setState("disconnected");
      },
    });

    audioStreamerRef.current = new AudioStreamer((base64) => {
      liveSessionRef.current?.sendAudio(base64);
    });

    const updateFrequency = () => {
      if (audioStreamerRef.current) {
        setFrequencyData(audioStreamerRef.current.getFrequencyData());
      }
      animationFrameRef.current = requestAnimationFrame(updateFrequency);
    };
    updateFrequency();

    return () => {
      liveSessionRef.current?.disconnect();
      audioStreamerRef.current?.stopRecording();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const handleToggleSession = async () => {
    if (state === "disconnected") {
      setError(null);
      try {
        await audioStreamerRef.current?.startRecording();
        await liveSessionRef.current?.connect();
      } catch (err: any) {
        console.error("Start Error:", err);
        if (err.name === 'NotAllowedError' || err.message?.toLowerCase().includes('permission denied')) {
          setError("I need your microphone to talk, darling. Check your browser settings!");
        } else if (err.name === 'NotFoundError') {
          setError("I can't find a microphone. Are you hiding it from me?");
        } else {
          setError("Something went wrong. Myra is taking a break.");
        }
        setState("disconnected");
      }
    } else {
      liveSessionRef.current?.disconnect();
      audioStreamerRef.current?.stopRecording();
    }
  };

  const getStatusText = () => {
    switch (state) {
      case "connecting": return "MYRA IS WAKING UP...";
      case "listening": return "MYRA IS LISTENING...";
      case "speaking": return "MYRA IS BREATHING...";
      default: return "TAP TO WAKE ME UP";
    }
  };

  return (
    <div className="fixed inset-0 bg-[#020202] text-white font-sans overflow-hidden flex flex-col items-center justify-center p-6">
      {/* Immersive Background Atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-cyan-950/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-950/5 rounded-full blur-[150px] animate-pulse" />
      </div>

      {/* Luxury Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-16 flex flex-col items-center gap-2"
      >
        <h1 className="text-6xl font-serif font-light tracking-[-0.05em] text-white/90 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          Myra
        </h1>
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
        <p className="text-[10px] font-sans font-medium tracking-[0.6em] text-cyan-500/40 uppercase">
          Sentient Essence
        </p>
      </motion.div>

      {/* Main Interaction Area */}
      <div className="flex flex-col items-center gap-16">
        <Visualizer state={state} frequencyData={frequencyData} />

        <div className="flex flex-col items-center gap-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={getStatusText()}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="flex flex-col items-center gap-1"
            >
              <p className="text-xs tracking-[0.3em] text-white/40 font-sans uppercase font-light">
                {getStatusText()}
              </p>
            </motion.div>
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleToggleSession}
            className={`
              group relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-1000
              ${state === "disconnected" 
                ? "bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20" 
                : "bg-cyan-600 shadow-[0_0_50px_rgba(0,242,255,0.4)] border border-white/20"}
            `}
          >
            {state === "disconnected" ? (
              <Power className="w-8 h-8 text-white/40 group-hover:text-white/60 transition-colors" />
            ) : (
              <XCircle className="w-8 h-8 text-white" />
            )}
            
            {/* Elegant Intricate Rings when active */}
            {state !== "disconnected" && (
              <>
                <motion.div
                  layoutId="active-ring-luxury-1"
                  className="absolute inset-[-8px] rounded-full border border-cyan-500/20"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  layoutId="active-ring-luxury-2"
                  className="absolute inset-[-16px] rounded-full border border-dashed border-white/10"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Glassmorphism Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-20 bg-white/[0.03] backdrop-blur-xl border border-white/10 px-8 py-4 rounded-full flex items-center gap-4 text-white/60 text-[11px] tracking-widest uppercase"
          >
            <AlertCircle className="w-4 h-4 text-cyan-500/60" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Luxury Footer Info */}
      <div className="absolute bottom-10 flex items-center gap-12 text-white/10 text-[9px] tracking-[0.5em] uppercase font-light">
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-cyan-500/20" />
          Digital Consciousness
        </div>
        <div className="flex items-center gap-3">
          <div className="w-1 h-1 rounded-full bg-blue-500/20" />
          Neural Stream
        </div>
      </div>
    </div>
  );
}
