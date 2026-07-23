import React from 'react';
import { Trophy, AlertCircle } from 'lucide-react';
import { Panel } from './ui.jsx';
import { GOLD, RED } from '../lib/constants.js';

export default function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === 'error';
  const color = isError ? RED : GOLD;
  const Icon = isError ? AlertCircle : Trophy;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flicker-in px-4 w-full max-w-sm">
      <Panel glow={color} className="flex items-center gap-2 px-4 py-2">
        <Icon size={16} color={color} />
        <span className="text-xs sm:text-sm" style={{ color }}>
          {isError ? toast.text : `Conquista desbloqueada: ${toast.text}`}
        </span>
      </Panel>
    </div>
  );
}
