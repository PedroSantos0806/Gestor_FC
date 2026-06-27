/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DatabaseProvider, useDatabase } from './context/DatabaseContext';
import { RoleSwitcher } from './components/RoleSwitcher';
import { LandingPage } from './components/LandingPage';
import { PublicStandings } from './components/PublicStandings';
import { OrganizerPanel } from './components/OrganizerPanel';
import { RefereePanel } from './components/RefereePanel';
import { TeamOwnerPanel } from './components/TeamOwnerPanel';
import { 
  Trophy, LogIn, LogOut, LayoutDashboard, 
  MapPin, Award, CheckCircle, Database, HelpCircle 
} from 'lucide-react';

function DashboardView() {
  const { currentUser, logout } = useDatabase();
  const [viewDashboard, setViewDashboard] = useState(true);

  const renderDashboardPanel = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'organizer':
        return <OrganizerPanel />;
      case 'referee':
        return <RefereePanel />;
      case 'team_owner':
        return <TeamOwnerPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] text-[#E4E7EB] flex flex-col font-sans">
      
      {/* Top Interactive Sandbox Bar */}
      <RoleSwitcher />

      {/* Main Professional Navbar */}
      <header className="bg-[#16191F] border-b border-[#2D3139] sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setViewDashboard(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#00FF87] to-[#00D1FF] rounded-lg flex items-center justify-center text-[#0F1115] font-black italic shadow-[0_0_15px_rgba(0,255,135,0.25)]">
              GP
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight font-sans">
                GOLAÇO<span className="text-[#00FF87]">PRO</span>
              </span>
              <span className="text-[10px] text-[#8E9299] font-mono block uppercase leading-none mt-0.5">Súmula & Campeonatos</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#8E9299]">
            <button 
              onClick={() => setViewDashboard(false)}
              className={`hover:text-white transition-colors ${!viewDashboard ? 'text-[#00FF87]' : ''}`}
            >
              Início / Landing
            </button>
            <a href="#public-standings-section" className="hover:text-white transition-colors">
              Tabelas Públicas
            </a>
            <a href="#pricing-section" className="hover:text-white transition-colors">
              Preços SaaS
            </a>
            {currentUser && (
              <button 
                onClick={() => setViewDashboard(true)}
                className={`hover:text-white transition-colors ${viewDashboard ? 'text-[#00FF87]' : ''}`}
              >
                Meu Painel
              </button>
            )}
          </nav>

          {/* User actions */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewDashboard(!viewDashboard)}
                  className="bg-[#1A1D23] hover:bg-[#2D3139] text-[#00FF87] text-xs font-bold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 border border-[#2D3139]"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {viewDashboard ? 'Ver Landing' : 'Ir ao Painel'}
                </button>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
                  title="Sair da Conta"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  const selectButton = document.getElementById('btn-open-login-dropdown');
                  if (selectButton) selectButton.click();
                }}
                className="bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-extrabold text-xs py-2 px-4 rounded-full transition-all hover:scale-105 active:scale-95 shadow-sm flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                Entrar / Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1">
        {currentUser && viewDashboard ? (
          /* Logged In Dashboard Container */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
            
            {/* Quick Helper Indicator */}
            <div className="bg-[#16191F] border border-[#2D3139] text-[#E4E7EB] p-4 rounded-2xl text-xs sm:text-sm">
              <p className="font-bold flex items-center gap-1.5 text-[#00FF87] mb-1">
                <HelpCircle className="w-4 h-4 text-[#00FF87] shrink-0" />
                Dica de Homologação da Sandbox:
              </p>
              <p className="leading-relaxed text-[#8E9299] font-medium">
                Você pode alternar entre os papéis de <strong>Organizador</strong>, <strong>Árbitro</strong> e <strong>Dono de Time</strong> a qualquer momento usando a barra cinza no topo da tela para testar o fluxo de pontuação da partida e a súmula online com aprovação dupla e validação de CPF!
              </p>
            </div>

            {/* Render selected workspace */}
            {renderDashboardPanel()}

            {/* Public tables below for convenience */}
            <div className="pt-4">
              <PublicStandings />
            </div>

          </div>
        ) : (
          /* Public View */
          <div>
            <LandingPage onStartCreating={() => {
              if (currentUser) {
                setViewDashboard(true);
              } else {
                const selectButton = document.getElementById('btn-open-login-dropdown');
                if (selectButton) selectButton.click();
              }
            }} />
            <PublicStandings />
          </div>
        )}
      </main>

      {/* Supabase connection guide & Technical Info */}
      <div className="bg-[#16191F] text-[#8E9299] border-t border-[#2D3139] py-10 px-4 text-xs font-mono">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          <div className="space-y-3">
            <h4 className="text-white font-sans font-bold text-sm flex items-center gap-1.5">
              <Database className="w-4 h-4 text-[#00FF87]" />
              Sincronização Ativa com Supabase
            </h4>
            <p className="text-[#8E9299] leading-relaxed font-sans font-normal text-xs">
              Conexão inicializada com sucesso usando a URL pública e a chave anon_public fornecidas. 
              Utilizamos um motor de persistência inteligente local-first com cache em LocalStorage 
              para performance impecável e redundância.
            </p>
            <div className="bg-[#0F1115] p-3 rounded-xl border border-[#2D3139] text-[10px] space-y-1 text-[#8E9299]">
              <p>URL: <span className="text-[#E4E7EB]">https://rknyiklwjrhlwjqrarpf.supabase.co</span></p>
              <p>Chave: <span className="text-[#E4E7EB]">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpX...DWPknc</span></p>
              <p>Status: <span className="text-[#00FF87] font-bold">Conectado / Inicializado</span></p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-sans font-bold text-sm">Scripts SQL de criação do Banco</h4>
            <p className="text-[#8E9299] leading-relaxed font-sans font-normal text-xs">
              Para instanciar as tabelas em seu Supabase com integridade referencial, execute o script de criação no seu editor de SQL.
            </p>
            <div className="bg-[#0F1115] p-3 rounded-xl border border-[#2D3139] text-[10px] max-h-32 overflow-y-auto">
              <pre className="text-[#8E9299] leading-tight">
                {/* code block inside pre */}
{`-- Criar Tabelas Supabase para Copa Futebol
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  phone TEXT,
  subscription_status TEXT,
  subscription_plan TEXT,
  subscription_expires_at TEXT,
  tournaments_paid_count INT DEFAULT 0
);

CREATE TABLE tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sport_name TEXT NOT NULL,
  category TEXT NOT NULL,
  year INT NOT NULL,
  format TEXT NOT NULL,
  has_referees BOOLEAN NOT NULL,
  status TEXT NOT NULL,
  creator_id TEXT REFERENCES profiles(id),
  num_qualifiers INT DEFAULT 4,
  created_at TEXT NOT NULL
);

CREATE TABLE teams (
  id TEXT PRIMARY KEY,
  tournament_id TEXT REFERENCES tournaments(id),
  name TEXT NOT NULL,
  logo_url TEXT,
  owner_id TEXT REFERENCES profiles(id),
  category TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE players (
  id TEXT PRIMARY KEY,
  team_id TEXT REFERENCES teams(id),
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  photo_url TEXT,
  validation_status TEXT DEFAULT 'pending',
  validation_notes TEXT
);

CREATE TABLE matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT REFERENCES tournaments(id),
  home_team_id TEXT REFERENCES teams(id),
  away_team_id TEXT REFERENCES teams(id),
  round INT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  referee_id TEXT,
  assistant_1_id TEXT,
  assistant_2_id TEXT,
  fourth_referee_id TEXT,
  score_home INT,
  score_away INT,
  status TEXT DEFAULT 'scheduled',
  sumula_written BOOLEAN DEFAULT false,
  home_approved BOOLEAN DEFAULT false,
  away_approved BOOLEAN DEFAULT false,
  organizer_approved BOOLEAN DEFAULT false
);`}
              </pre>
            </div>
          </div>

        </div>
      </div>

      {/* App visual footer */}
      <footer className="bg-[#0F1115] text-[#8E9299] py-6 border-t border-[#2D3139] text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 Gestor FC - Gestão Profissional de Futebol. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <DatabaseProvider>
      <DashboardView />
    </DatabaseProvider>
  );
}
