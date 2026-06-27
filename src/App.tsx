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

      {/* App visual footer */}
      <footer className="bg-[#16191F] text-[#8E9299] py-8 border-t border-[#2D3139] text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p className="font-semibold text-white">© 2026 Gestor FC - Gestão Profissional de Futebol. Todos os direitos reservados.</p>
            <p className="text-[11px] text-[#8E9299]">Desenvolvido com excelência pela <span className="text-[#00FF87] font-bold">Aurora Tech</span></p>
          </div>
          <div className="flex flex-wrap gap-5 justify-center items-center">
            <a href="https://wa.me/5511992835438?text=Acessei%20o%20sistema%20do%20Gestor%20FC%20e%20tenho%20algumas%20d%C3%BAvidas%2C%20pode%20me%20ajudar%3F" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.413 9.863-9.847.001-2.63-1.019-5.101-2.872-6.957C16.608 1.995 14.137.974 11.485.974c-5.443 0-9.866 4.414-9.868 9.849-.001 1.802.487 3.53 1.412 5.04l-.998 3.642 3.73-.977c1.52.831 3.126 1.27 4.753 1.275zM17.43 14.38c-.32-.16-1.89-.93-2.185-1.04-.294-.11-.51-.16-.723.16-.214.32-.827 1.04-1.012 1.25-.185.21-.37.24-.69.08-.32-.16-1.353-.5-2.578-1.593-.953-.85-1.596-1.9-1.783-2.22-.185-.32-.02-.49.14-.65.145-.145.32-.37.48-.56.16-.19.21-.32.32-.54.11-.22.05-.41-.03-.57-.08-.16-.723-1.74-.99-2.4-.26-.62-.52-.54-.723-.55-.185-.01-.397-.01-.61-.01-.213 0-.56.08-.85.4-.294.32-1.127 1.1-1.127 2.68 0 1.58 1.149 3.11 1.309 3.32.16.21 2.262 3.45 5.48 4.84.765.33 1.362.528 1.828.675.77.244 1.47.21 2.02.128.614-.09 1.89-.77 2.155-1.48.265-.7.265-1.31.185-1.43-.08-.12-.294-.2-.614-.36z"/>
              </svg>
              Suporte WhatsApp
            </a>
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
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
