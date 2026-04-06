import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { SessionState } from "../lib/live-session";

interface VisualizerProps {
  state: SessionState;
  frequencyData: Uint8Array;
}

export const Visualizer = ({ state, frequencyData }: VisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isIdle = state === "disconnected";
  const isConnecting = state === "connecting";
  const isListening = state === "listening";
  const isSpeaking = state === "speaking";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = 70;

      ctx.clearRect(0, 0, width, height);

      if (isSpeaking || isListening) {
        const bars = frequencyData.length;
        
        // Draw multiple layers for an ethereal effect
        for (let layer = 0; layer < 2; layer++) {
          ctx.beginPath();
          ctx.strokeStyle = layer === 0 ? "rgba(0, 242, 255, 0.4)" : "rgba(255, 255, 255, 0.2)"; // Electric Cyan and Silver
          ctx.lineWidth = layer === 0 ? 2 : 1;
          ctx.lineCap = "round";

          for (let i = 0; i < bars; i++) {
            const amplitude = frequencyData[i] / 255;
            const angle = (i / bars) * Math.PI * 2;
            
            const barHeight = amplitude * (layer === 0 ? 50 : 30);
            
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + barHeight);
            const y2 = centerY + Math.sin(angle) * (radius + barHeight);

            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
          }
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationFrameId);
  }, [frequencyData, isSpeaking, isListening]);

  return (
    <div className="relative flex items-center justify-center w-96 h-96">
      {/* Immersive Background Atmosphere - Layered Gradients (Cyan/Blue) */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-950/20 via-transparent to-blue-900/10 blur-[80px]"
        animate={{
          scale: isSpeaking ? [1, 1.15, 1] : isListening ? [1, 1.08, 1] : [1, 1.03, 1],
          opacity: isIdle ? 0.3 : 0.7,
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Luxury Glow - Deep Cyan */}
      <motion.div
        className="absolute inset-0 rounded-full bg-cyan-600/5 blur-[100px]"
        animate={{
          opacity: isIdle ? 0.1 : 0.4,
        }}
        transition={{ duration: 2 }}
      />

      {/* Listening Aura - Refined Ping (Cyan) */}
      {isListening && (
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-48 h-48 border border-cyan-500/20 rounded-full"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                delay: i * 1.2,
                ease: "easeOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Intricate Rotating Dashed Ring */}
      {!isIdle && (
        <motion.div
          className="absolute w-[180px] h-[180px] border border-dashed border-cyan-500/20 rounded-full z-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      )}

      {/* Waveform Canvas */}
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="absolute inset-0 z-10 pointer-events-none"
      />

      {/* Premium Power Core - Glassmorphism & Silver Accent */}
      <motion.div
        className={`relative w-40 h-40 rounded-full flex items-center justify-center z-20 transition-all duration-1000
          ${isIdle 
            ? "bg-white/[0.02] border border-white/10 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.5)]" 
            : "bg-cyan-600/90 border border-white/30 backdrop-blur-xl shadow-[0_0_60px_rgba(0,242,255,0.3)]"}
        `}
        animate={{
          scale: isSpeaking ? [1, 1.03, 1] : 1,
          rotate: isConnecting ? 360 : 0,
        }}
        transition={{
          duration: isConnecting ? 3 : 0.6,
          repeat: isConnecting ? Infinity : 0,
          ease: isConnecting ? "linear" : "easeInOut",
        }}
      >
        {/* Inner Refinement */}
        <div className="w-32 h-32 rounded-full border border-white/5 flex items-center justify-center overflow-hidden">
           <div className={`w-16 h-16 rounded-full ${isIdle ? 'bg-cyan-900/20' : 'bg-white/10'} blur-xl transition-colors duration-1000`} />
        </div>
        
        {/* Subtle Silver Ring */}
        <div className="absolute inset-0 rounded-full border border-white/10 pointer-events-none" />
      </motion.div>
    </div>
  );
};
