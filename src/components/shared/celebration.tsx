"use client";

import { useEffect, useState } from "react";

const COLORS = ["#ff6b9d", "#c44dff", "#4dc9f6", "#f7c948", "#51cf66", "#ff6348"];

export function Celebration({ show }: { show: boolean }) {
  const [particles, setParticles] = useState<{ id: number; color: string; left: number; delay: number; size: number }[]>([]);

  useEffect(() => {
    if (show) {
      const p = Array.from({ length: 40 }, (_, i) => ({
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        left: Math.random() * 100,
        delay: Math.random() * 2,
        size: Math.random() * 8 + 4,
      }));
      setParticles(p);
      const timer = setTimeout(() => setParticles([]), 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute top-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animation: `confettiFall ${2 + p.delay}s ease-in forwards`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
