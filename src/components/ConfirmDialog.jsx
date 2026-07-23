import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Panel } from './ui.jsx';
import { RED } from '../lib/constants.js';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: 'rgba(0,0,0,0.75)' }}>
      <div className="max-w-sm w-full">
        <Panel glow={RED} className="text-center">
          <AlertTriangle size={30} color={RED} className="mx-auto mb-3" />
          <h3 className="sys-title text-base tracking-widest mb-2" style={{ color: RED }}>{title || 'Confirmar'}</h3>
          <p className="text-sm mb-5" style={{ color: '#cbd5e1' }}>{message}</p>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 uppercase tracking-widest text-xs font-bold"
              style={{ background: 'transparent', border: '1px solid #475569', color: '#94a3b8' }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 uppercase tracking-widest text-xs font-bold"
              style={{ background: `${RED}33`, border: `1px solid ${RED}`, color: '#fff' }}
            >
              Excluir
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
