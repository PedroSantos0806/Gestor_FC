/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { UserRole } from '../types';
import { Shield, User, Award, RefreshCw, LogIn, Check } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, profiles, login, switchRole, resetDatabase } = useDatabase();
  const [emailInput, setEmailInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      login(emailInput.trim());
      setEmailInput('');
      setShowDropdown(false);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'organizer':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Shield className="w-3.5 h-3.5" />
            Organizador / Criador
          </span>
        );
      case 'referee':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <Award className="w-3.5 h-3.5" />
            Árbitro Oficial
          </span>
        );
      case 'team_owner':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <User className="w-3.5 h-3.5" />
            Dono de Time
          </span>
        );
    }
  };

  return (
    <div id="role-switcher-bar" className="bg-[#16191F] border-b border-[#2D3139] text-[#E4E7EB] py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
        
        {/* Sandbox Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00FF87] animate-pulse" />
          <span className="font-mono text-xs text-[#8E9299]">AMBIE_HOMOLOGAÇÃO:</span>
          {currentUser ? (
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-white">{currentUser.name}</span>
              <span className="text-[#8E9299]">({currentUser.email})</span>
              {getRoleBadge(currentUser.role)}
            </div>
          ) : (
            <span className="text-[#8E9299]">Visitante (Não logado)</span>
          )}
        </div>

        {/* Interactive simulation actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Quick Preset Switche */}
          {currentUser && (
            <div className="flex items-center bg-[#0F1115] p-1 rounded-lg border border-[#2D3139] gap-1">
              <button
                id="btn-switch-organizer"
                onClick={() => switchRole('organizer')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  currentUser.role === 'organizer' 
                    ? 'bg-[#00D1FF] text-[#0F1115] font-bold shadow-sm' 
                    : 'text-[#8E9299] hover:text-white'
                }`}
                title="Mudar para papel de Criador do Campeonato"
              >
                Organizador
              </button>
              <button
                id="btn-switch-referee"
                onClick={() => switchRole('referee')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  currentUser.role === 'referee' 
                    ? 'bg-[#00FF87] text-[#0F1115] font-bold shadow-sm' 
                    : 'text-[#8E9299] hover:text-white'
                }`}
                title="Mudar para papel de Árbitro escalado"
              >
                Árbitro
              </button>
              <button
                id="btn-switch-team-owner"
                onClick={() => switchRole('team_owner')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all ${
                  currentUser.role === 'team_owner' 
                    ? 'bg-[#00FF87] text-[#0F1115] font-bold shadow-sm' 
                    : 'text-[#8E9299] hover:text-white'
                }`}
                title="Mudar para papel de Representante de Time"
              >
                Dono de Time
              </button>
            </div>
          )}

          {/* Quick accounts picker */}
          <div className="relative">
            <button
              id="btn-open-login-dropdown"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-1 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 font-medium transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              Simular Contas
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-slate-200">
                <p className="text-xs text-slate-400 font-medium mb-2 uppercase tracking-wider font-mono">
                  Contas de Demonstração
                </p>
                <div className="space-y-1.5 mb-3 max-h-48 overflow-y-auto">
                  {profiles.map(p => (
                    <button
                      key={p.id}
                      onClick={() => {
                        login(p.email);
                        setShowDropdown(false);
                      }}
                      className={`w-full text-left p-2 rounded-lg text-xs hover:bg-slate-900 transition-colors flex items-center justify-between ${
                        currentUser?.email === p.email ? 'bg-slate-900 border border-indigo-500/30' : 'border border-transparent'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                          {p.name}
                          {currentUser?.email === p.email && <Check className="w-3 h-3 text-indigo-400" />}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">{p.email}</div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                        p.role === 'organizer' ? 'bg-indigo-950 text-indigo-400' :
                        p.role === 'referee' ? 'bg-yellow-950 text-yellow-500' : 'bg-emerald-950 text-emerald-400'
                      }`}>
                        {p.role}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Custom login form */}
                <form onSubmit={handleLoginSubmit} className="border-t border-slate-800 pt-2.5">
                  <p className="text-[10px] text-slate-400 mb-1.5">Acessar com outro email:</p>
                  <div className="flex gap-1.5">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="email@exemplo.com"
                      className="bg-slate-900 text-xs text-slate-200 border border-slate-800 rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-2.5 py-1 rounded transition-colors"
                    >
                      Ok
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Reset button */}
          <button
            id="btn-reset-db"
            onClick={() => {
              if (confirm('Deseja restaurar os dados originais de demonstração?')) {
                resetDatabase();
                alert('Banco de dados local restaurado com sucesso!');
              }
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 text-xs px-2 py-1.5 rounded transition-all"
            title="Restaurar Banco para os Dados Originais"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Restaurar Sandbox
          </button>

        </div>

      </div>
    </div>
  );
};
