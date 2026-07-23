import React from 'react';
import { CYAN, BG } from '../lib/constants.js';

export function Panel({ children, glow = CYAN, className = '', style = {}, padded = true }) {
  return (
    <div
      className={`relative border ${padded ? 'p-4' : ''} ${className}`}
      style={{
        background: 'linear-gradient(180deg, rgba(13,20,34,0.92), rgba(6,9,17,0.96))',
        borderColor: glow + '4d',
        boxShadow: `0 0 22px ${glow}1f, inset 0 0 30px rgba(0,0,0,0.35)`,
        clipPath: 'polygon(0 14px, 14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Bar({ value, max, color = CYAN, height = 10 }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div style={{ height, background: '#0a0e18', border: '1px solid #1c2536' }} className="w-full overflow-hidden">
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 10px ${color}`,
          transition: 'width 0.5s ease',
        }}
      />
    </div>
  );
}

export function SectionTitle({ icon: Icon, children, color = CYAN }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon size={18} color={color} />
      <h2
        className="text-sm sm:text-base tracking-widest uppercase"
        style={{ fontFamily: "'Orbitron', sans-serif", color, textShadow: `0 0 12px ${color}66` }}
      >
        {children}
      </h2>
    </div>
  );
}

export function IconButton({ onClick, color = '#94a3b8', children, title }) {
  return (
    <button onClick={onClick} title={title} className="p-1.5 border" style={{ borderColor: color + '55', color }}>
      {children}
    </button>
  );
}
