/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { calculateStandings } from '../utils/stats';
import { Tournament, Team, Match, Invitation, PLANS_INFO } from '../types';
import { 
  Trophy, Plus, Mail, Users, FileText, Star, 
  CreditCard, Check, AlertTriangle, ShieldCheck, RefreshCw,
  Download, Send, Smartphone
} from 'lucide-react';

export const OrganizerPanel: React.FC = () => {
  const { 
    currentUser, tournaments, teams, matches, events, invitations, players,
    createTournament, sendInvitation, organizerApproveMatch, rateReferee,
    subscribeSaaS, profiles
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'my_tournaments' | 'create_tournament' | 'invitations' | 'approvals' | 'saas' | 'export' | 'whatsapp'>('my_tournaments');

  // Premium Features States
  const [exportType, setExportType] = useState<'json' | 'csv'>('json');
  const [whatsappTemplate, setWhatsappTemplate] = useState('rodada_atual');
  const [whatsappDraft, setWhatsappDraft] = useState('');
  const [whatsappSending, setWhatsappSending] = useState(false);
  const [whatsappSentList, setWhatsappSentList] = useState<{ id: string; time: string; text: string; status: 'delivered' | 'failed' }[]>([]);

  // Form States - Create Tournament
  const [name, setName] = useState('');
  const [sportName, setSportName] = useState('Futebol de Campo');
  const [category, setCategory] = useState('Adulto Livre');
  const [year, setYear] = useState(2026);
  const [format, setFormat] = useState<'points_only' | 'groups_and_playoffs'>('points_only');
  const [hasReferees, setHasReferees] = useState(true);
  const [numQualifiers, setNumQualifiers] = useState(4);
  const [successMsg, setSuccessMsg] = useState('');

  // Form States - Invitations
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'referee' | 'team_owner'>('team_owner');
  const [inviteTeamName, setInviteTeamName] = useState('');
  const [selectedTourIdForInvite, setSelectedTourIdForInvite] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  // Rating States
  const [ratedMatchId, setRatedMatchId] = useState<string | null>(null);
  const [refRating, setRefRating] = useState<number>(5);

  // Compute stats of tournaments belonging to organizer
  const organizerTournaments = useMemo(() => {
    if (!currentUser) return [];
    return tournaments.filter(t => t.creator_id === currentUser.id);
  }, [tournaments, currentUser]);

  useMemo(() => {
    if (organizerTournaments.length > 0 && !selectedTourIdForInvite) {
      setSelectedTourIdForInvite(organizerTournaments[0].id);
    }
  }, [organizerTournaments, selectedTourIdForInvite]);

  // List matches awaiting organizer approval
  const matchesAwaitingApproval = useMemo(() => {
    return matches.filter(m => {
      const tour = tournaments.find(t => t.id === m.tournament_id);
      return tour?.creator_id === currentUser?.id && m.status === 'awaiting_approval';
    });
  }, [matches, tournaments, currentUser]);

  // Helper function to handle tournament creation
  const handleCreateTournament = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createTournament({
      name,
      sport_name: sportName,
      category,
      year: Number(year),
      format,
      has_referees: hasReferees,
      num_qualifiers: Number(numQualifiers)
    });

    setSuccessMsg(`Campeonato "${name}" criado com sucesso! O primeiro campeonato é grátis.`);
    setName('');
    setTimeout(() => {
      setSuccessMsg('');
      setActiveTab('my_tournaments');
    }, 2000);
  };

  // Helper function to handle invite submission
  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedTourIdForInvite) return;

    sendInvitation({
      tournament_id: selectedTourIdForInvite,
      email: inviteEmail.trim(),
      role: inviteRole,
      team_name: inviteRole === 'team_owner' ? inviteTeamName.trim() : undefined
    });

    setInviteSuccess('Convite enviado com sucesso! O destinatário já poderá simular o login e aceitar.');
    setInviteEmail('');
    setInviteTeamName('');
    setTimeout(() => {
      setInviteSuccess('');
    }, 3000);
  };

  // Helper to resolve Team Details
  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Time Desconhecido';
  };

  // Helper to resolve Player Details
  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Atleta';
  };

  const getMatchEvents = (matchId: string) => {
    return events.filter(e => e.match_id === matchId);
  };

  return (
    <div className="bg-[#16191F] rounded-2xl border border-[#2D3139] shadow-md overflow-hidden p-6">
      
      {/* Panel title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-[#2D3139]">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Painel do Organizador de Ligas
          </h2>
          <p className="text-[#8E9299] text-xs mt-0.5">
            Crie campeonatos, convide equipes, homologue súmulas e avalie árbitros em tempo real.
          </p>
        </div>

        {/* Mini SaaS Badge */}
        <div className="bg-[#1A1D23] border border-[#2D3139] rounded-xl px-3.5 py-1.5 flex items-center gap-2 text-xs">
          <CreditCard className="w-4 h-4 text-[#00FF87]" />
          <span className="font-semibold text-[#8E9299]">
            SaaS Status: 
            {currentUser?.subscriptionStatus === 'active' ? (
              <span className="text-[#00FF87] font-bold ml-1.5">Assinatura Ativa</span>
            ) : (
              <span className="text-amber-400 font-bold ml-1.5">Gratuito (Sandbox)</span>
            )}
          </span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-1.5 bg-[#1A1D23] p-1 rounded-xl mb-6 text-xs sm:text-sm font-semibold max-w-2xl">
        <button
          onClick={() => setActiveTab('my_tournaments')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'my_tournaments' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          Meus Torneios ({organizerTournaments.length})
        </button>

        <button
          onClick={() => setActiveTab('create_tournament')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'create_tournament' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          Novo Torneio
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'invitations' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <Mail className="w-4 h-4" />
          Convites
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 relative cursor-pointer ${
            activeTab === 'approvals' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          Súmulas Pendentes
          {matchesAwaitingApproval.length > 0 && (
            <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-bounce">
              {matchesAwaitingApproval.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('saas')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'saas' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Planos SaaS
        </button>

        <button
          onClick={() => setActiveTab('export')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'export' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          Exportar Dados
          <span className="text-[9px] bg-[#00FF87]/15 text-[#00FF87] px-1 py-0.5 rounded font-black">R$1500</span>
        </button>

        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'whatsapp' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          WhatsApp Alertas
          <span className="text-[9px] bg-[#00D1FF]/15 text-[#00D1FF] px-1 py-0.5 rounded font-black">R$3000</span>
        </button>
      </div>

      {/* TAB CONTENT: MY TOURNAMENTS */}
      {activeTab === 'my_tournaments' && (
        <div className="space-y-6">
          {organizerTournaments.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#2D3139] rounded-2xl text-[#8E9299]">
              <Trophy className="w-12 h-12 text-[#2D3139] mx-auto mb-3" />
              <h3 className="font-bold text-white">Nenhum campeonato criado ainda</h3>
              <p className="text-xs text-[#8E9299] mt-1 max-w-xs mx-auto">
                Crie seu primeiro torneio de futebol grátis clicando na aba de Novo Torneio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {organizerTournaments.map(tour => {
                const tourTeams = teams.filter(t => t.tournament_id === tour.id);
                const tourMatches = matches.filter(m => m.tournament_id === tour.id);

                return (
                  <div key={tour.id} className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 hover:border-[#00FF87]/30 transition-all shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="font-extrabold text-white text-base">{tour.name}</h3>
                        <p className="text-[11px] text-[#8E9299] font-medium">
                          {tour.sport_name} • {tour.category} • {tour.year}
                        </p>
                      </div>
                      <span className="bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {tour.format === 'points_only' ? 'Pontos Corridos' : 'Playoffs'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-[#2D3139]/60 my-3 text-center text-xs">
                      <div>
                        <span className="text-[10px] text-[#8E9299] font-bold block uppercase">Times Inscritos</span>
                        <span className="font-bold text-white text-base">{tourTeams.length} times</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E9299] font-bold block uppercase">Partidas</span>
                        <span className="font-bold text-white text-base">{tourMatches.length} jogos</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8E9299] font-bold block uppercase">Arbitragem</span>
                        <span className="font-bold text-white text-base">{tour.has_referees ? 'Ativa' : 'Sem Árbit.'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="text-xs text-[#8E9299]">
                        <span className="font-bold text-[#E4E7EB]">Regra de Classificação: </span>
                        Top {tour.num_qualifiers} equipes qualificadas para playoffs.
                      </div>
                      
                      {/* Show button to quickly copy/paste or execute invitations */}
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedTourIdForInvite(tour.id);
                            setActiveTab('invitations');
                          }}
                          className="bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#0F1115]" />
                          Convidar Equipes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CREATE TOURNAMENT */}
      {activeTab === 'create_tournament' && (
        <form onSubmit={handleCreateTournament} className="max-w-xl bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-white text-sm pb-2 border-b border-[#2D3139]">Configuração de Novo Campeonato</h3>
          
          {successMsg && (
            <div className="bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-xs font-semibold p-3 rounded-xl flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-[#00FF87]" />
              {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#8E9299] uppercase mb-1">Nome do Campeonato</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Copa da Várzea Vila Real 2026"
                className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF87]/50 focus:border-[#00FF87]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E9299] uppercase mb-1">Modalidade Esportiva</label>
              <select
                value={sportName}
                onChange={(e) => setSportName(e.target.value)}
                className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF87]/50"
              >
                <option value="Futebol de Campo">⚽️ Futebol de Campo</option>
                <option value="Futsal">⚽️ Futsal</option>
                <option value="Futebol Society">⚽️ Futebol Society</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E9299] uppercase mb-1">Categoria de Idade</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF87]/50"
              >
                <option value="Adulto Livre">Adulto Livre</option>
                <option value="Sub-17">Sub-17 (Idade limite)</option>
                <option value="Sub-15">Sub-15 (Idade limite)</option>
                <option value="Master 40+">Master 40+</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E9299] uppercase mb-1">Ano da Edição</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF87]/50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8E9299] uppercase mb-1">Passam de fase (Playoffs)</label>
              <input
                type="number"
                value={numQualifiers}
                onChange={(e) => setNumQualifiers(Number(e.target.value))}
                min={1}
                max={16}
                placeholder="Ex: 4 times avançam"
                className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00FF87]/50"
                required
              />
            </div>

            <div className="sm:col-span-2 py-2">
              <div className="flex items-center justify-between bg-[#16191F] border border-[#2D3139] p-3 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-[#E4E7EB] uppercase block">Torneio com Arbitragem Oficial?</span>
                  <span className="text-[10px] text-[#8E9299]">Existem campeonatos de várzea sem arbitragem contratada.</span>
                </div>
                <input
                  type="checkbox"
                  checked={hasReferees}
                  onChange={(e) => setHasReferees(e.target.checked)}
                  className="w-5 h-5 accent-[#00FF87] cursor-pointer"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black text-xs sm:text-sm py-2.5 rounded-xl transition-colors shadow-md shadow-[#00FF87]/10 cursor-pointer"
          >
            Confirmar e Registrar Campeonato
          </button>
        </form>
      )}

      {/* TAB CONTENT: INVITATIONS */}
      {activeTab === 'invitations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* New Invite Form */}
          <div className="lg:col-span-1 bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5">
            <h3 className="font-bold text-white text-xs sm:text-sm pb-2 border-b border-[#2D3139] mb-4">Enviar Convite de Inscrição</h3>
            
            {inviteSuccess && (
              <div className="bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-[11px] p-2.5 rounded-xl mb-3">
                {inviteSuccess}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Campeonato Alvo</label>
                <select
                  value={selectedTourIdForInvite}
                  onChange={(e) => setSelectedTourIdForInvite(e.target.value)}
                  className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-1.5 text-white font-medium"
                  required
                >
                  {organizerTournaments.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Tipo de Convite</label>
                <div className="flex bg-[#16191F] p-0.5 rounded-lg border border-[#2D3139]">
                  <button
                    type="button"
                    onClick={() => setInviteRole('team_owner')}
                    className={`flex-1 py-1 text-center rounded font-bold cursor-pointer ${inviteRole === 'team_owner' ? 'bg-[#00FF87] text-[#0F1115]' : 'text-[#8E9299]'}`}
                  >
                    Dono de Time
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteRole('referee')}
                    className={`flex-1 py-1 text-center rounded font-bold cursor-pointer ${inviteRole === 'referee' ? 'bg-[#00FF87] text-[#0F1115]' : 'text-[#8E9299]'}`}
                  >
                    Árbitro
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">E-mail do Convidado</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Ex: dono_flamengo@time.com"
                  className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-1.5 text-white"
                  required
                />
              </div>

              {inviteRole === 'team_owner' && (
                <div>
                  <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Nome do Time / Clube</label>
                  <input
                    type="text"
                    value={inviteTeamName}
                    onChange={(e) => setInviteTeamName(e.target.value)}
                    placeholder="Ex: Mengão FC"
                    className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-1.5 text-white"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0F1115] font-black py-2 rounded-xl transition-colors cursor-pointer"
              >
                Enviar Convite Oficial
              </button>
            </form>
          </div>

          {/* Invitation logs */}
          <div className="lg:col-span-2 text-[#E4E7EB]">
            <h3 className="font-bold text-white text-sm mb-4 flex items-center justify-between">
              <span>Histórico de Convites do Sistema</span>
              <span className="text-xs text-[#8E9299] font-normal">Contatos e status</span>
            </h3>

            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4 overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#2D3139] text-[#8E9299] font-bold uppercase">
                    <th className="py-2">E-mail</th>
                    <th className="py-2">Função</th>
                    <th className="py-2">Time / Clube</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2D3139]/40 font-medium">
                  {invitations.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-[#8E9299]">
                        Nenhum convite enviado ainda.
                      </td>
                    </tr>
                  ) : (
                    invitations.map(inv => (
                      <tr key={inv.id}>
                        <td className="py-2.5 text-white font-mono font-normal">{inv.email}</td>
                        <td className="py-2.5 uppercase text-[#8E9299] font-bold">{inv.role === 'team_owner' ? 'Dono Time' : 'Árbitro'}</td>
                        <td className="py-2.5 text-[#E4E7EB]">{inv.team_name || '-'}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                            inv.status === 'accepted' ? 'bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20' :
                            inv.status === 'declined' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-amber-550/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {inv.status === 'accepted' ? 'Aceito' : inv.status === 'declined' ? 'Recusado' : 'Pendente'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: AWAITING SUMULA APPROVALS */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <h3 className="font-bold text-white text-sm border-b border-[#2D3139] pb-2">
            Aprovação e Homologação de Súmulas
          </h3>
          
          {matchesAwaitingApproval.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-[#2D3139] rounded-2xl text-[#8E9299]">
              <ShieldCheck className="w-12 h-12 text-[#2D3139] mx-auto mb-3" />
              <h3 className="font-bold text-white">Tudo em dia!</h3>
              <p className="text-xs text-[#8E9299] mt-1">
                Nenhuma súmula de partida aguardando sua homologação de organizador no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {matchesAwaitingApproval.map(m => {
                const matchEvents = getMatchEvents(m.id);
                return (
                  <div key={m.id} className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 hover:border-[#2D3139] transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-3 border-b border-[#2D3139] mb-4">
                      <div>
                        <span className="text-[10px] font-bold text-[#00FF87] bg-[#00FF87]/10 px-2 py-0.5 rounded uppercase border border-[#00FF87]/20">
                          Copa Metropolitana • Rodada {m.round}
                        </span>
                        <h4 className="font-extrabold text-white text-base mt-1">
                          {getTeamName(m.home_team_id)} {m.score_home} vs {m.score_away} {getTeamName(m.away_team_id)}
                        </h4>
                        <p className="text-[11px] text-[#8E9299] mt-0.5">Partida disputada no campo: {m.location}</p>
                      </div>

                      {/* Approval Status indicators */}
                      <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                        <span className={`px-2 py-1 rounded-full ${m.home_approved ? 'bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          Dono Mandante: {m.home_approved ? 'Aprovou' : 'Pendente'}
                        </span>
                        <span className={`px-2 py-1 rounded-full ${m.away_approved ? 'bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          Dono Visitante: {m.away_approved ? 'Aprovou' : 'Pendente'}
                        </span>
                      </div>
                    </div>

                    {/* Súmula detailed events list */}
                    <div className="mb-4">
                      <p className="text-xs font-bold text-[#E4E7EB] mb-2">Eventos registrados na partida:</p>
                      <div className="bg-[#16191F] border border-[#2D3139] rounded-xl p-3.5 text-xs space-y-1.5">
                        {matchEvents.length === 0 ? (
                          <p className="text-[#8E9299] font-mono text-[11px]">Nenhum lance especial registrado na súmula pelo árbitro.</p>
                        ) : (
                          matchEvents.map(evt => (
                            <div key={evt.id} className="flex items-center gap-2 font-mono text-[11px] text-[#8E9299]">
                              <span className="font-bold text-[#00FF87]">[{evt.minute}']</span>
                              <span className="capitalize font-bold text-white">
                                {evt.type === 'goal' ? '⚽️ GOL' : 
                                 evt.type === 'assist' ? '👟 ASSISTÊNCIA' : 
                                 evt.type === 'yellow_card' ? '🟨 CARTÃO AMARELO' : '🟥 CARTÃO VERMELHO'}
                              </span>
                              <span>- {getPlayerName(evt.player_id)} ({getTeamName(evt.team_id)})</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Quick Warning if one of the team owners has not approved */}
                    {(!m.home_approved || !m.away_approved) && (
                      <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2.5 rounded-xl text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-550" />
                        <span>
                          <strong>Atenção:</strong> Ambos os representantes dos clubes precisam ler e aprovar o resultado no painel deles antes de ir para a homologação do torneio, garantindo compliance!
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          organizerApproveMatch(m.id);
                          alert('Súmula homologada com sucesso! A tabela de classificação foi atualizada em tempo real.');
                        }}
                        className="flex-1 bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black text-xs py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#0F1115]" />
                        Homologar Resultado & Atualizar Tabela
                      </button>

                      {/* Referee evaluation button */}
                      <button
                        onClick={() => {
                          setRatedMatchId(m.id);
                        }}
                        className="bg-[#16191F] hover:bg-[#1A1D23] border border-[#2D3139] text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Avaliar Arbitragem
                      </button>
                    </div>

                    {/* Rating form widget if selected */}
                    {ratedMatchId === m.id && (
                      <div className="mt-4 bg-[#00D1FF]/10 border border-[#00D1FF]/30 p-4 rounded-xl text-xs">
                        <h5 className="font-bold text-white mb-2">Avaliar equipe de Arbitragem deste jogo:</h5>
                        <p className="text-[#8E9299] mb-3">Dê uma nota de 1 a 5 estrelas para o juiz, auxiliares e quarto árbitro.</p>
                        
                        <div className="flex items-center gap-1.5 mb-4">
                           {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRefRating(star)}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${star <= refRating ? 'fill-amber-400 text-amber-400' : 'text-[#8E9299]'}`} />
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            rateReferee(m.id, refRating, 'organizer');
                            setRatedMatchId(null);
                            alert('Avaliação do árbitro registrada com sucesso!');
                          }}
                          className="bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0F1115] font-black px-3.5 py-1.5 rounded-lg"
                        >
                          Salvar Avaliação
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SAAS SUBSCRIPTION */}
      {activeTab === 'saas' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#2D3139] pb-3">
            <div>
              <h3 className="font-extrabold text-white text-base">
                Seu Plano de Assinatura Gestor FC
              </h3>
              <p className="text-xs text-[#8E9299]">
                Compare e assine o plano perfeito para o tamanho e a complexidade do seu campeonato de futebol.
              </p>
            </div>

            {/* Current Active Plan Badge */}
            <div className="bg-[#1A1D23] border border-[#00FF87]/30 px-3.5 py-1.5 rounded-xl flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#00FF87] animate-pulse"></span>
              <span className="font-semibold text-white">
                Plano Ativo: <span className="text-[#00FF87] font-extrabold">
                  {currentUser?.subscriptionPlan === 'plan_80' && 'Campeonato Único (R$ 80)'}
                  {currentUser?.subscriptionPlan === 'plan_300' && 'SaaS Gold (R$ 300/mês)'}
                  {currentUser?.subscriptionPlan === 'plan_1500' && 'SaaS Pro (R$ 1.500/mês)'}
                  {currentUser?.subscriptionPlan === 'plan_3000' && 'League Master (R$ 3.000/mês)'}
                  {!currentUser?.subscriptionPlan && 'Nenhum / Gratuito (Sandbox)'}
                </span>
              </span>
            </div>
          </div>

          {/* Quick SaaS pricing intro card */}
          <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 text-xs text-[#8E9299]">
            <h4 className="font-bold text-white text-sm mb-1.5">Acelere seu campeonato com Gestor FC</h4>
            <p className="leading-relaxed">
              Diga adeus às planilhas manuais bagunçadas. Nossos planos SaaS cobrem todas as fases do campeonato — desde o registro
              de atletas e validação automática de CPF direto com a Receita Federal, até súmulas digitais de jogo interativas e alertas automatizados de WhatsApp para toda a liga.
            </p>
          </div>

          {/* SaaS Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS_INFO.map(plan => {
              const isCurrent = currentUser?.subscriptionPlan === plan.id;
              const hasStatusActive = currentUser?.subscriptionStatus === 'active';
              
              return (
                <div 
                  key={plan.id} 
                  className={`bg-[#1A1D23] rounded-2xl p-5 flex flex-col justify-between border transition-all ${
                    isCurrent && hasStatusActive
                      ? 'border-[#00FF87] shadow-[0_0_15px_rgba(0,255,135,0.1)]' 
                      : 'border-[#2D3139] hover:border-[#8E9299]/30'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="mb-4">
                      {isCurrent && hasStatusActive && (
                        <span className="bg-[#00FF87]/10 border border-[#00FF87]/30 text-[#00FF87] text-[9px] font-black uppercase px-2 py-0.5 rounded-full block w-fit mb-2">
                          Plano Ativo
                        </span>
                      )}
                      <h4 className="font-extrabold text-white text-sm leading-tight">{plan.name}</h4>
                      <p className="text-[10px] text-[#8E9299] mt-0.5 leading-snug">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-4 bg-[#16191F] p-3 rounded-xl border border-[#2D3139]">
                      <span className="text-[#8E9299] text-[10px] block uppercase font-bold">Investimento</span>
                      <span className="text-white text-lg font-black">{plan.price}</span>
                    </div>

                    {/* Features list */}
                    <ul className="space-y-2 mb-6 text-[11px] text-[#8E9299] leading-snug">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-[#00FF87] shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-4 border-t border-[#2D3139] mt-auto">
                    <a
                      href={plan.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full text-center block text-xs font-bold py-2 px-3 rounded-xl border transition-colors ${
                        isCurrent 
                          ? 'bg-[#00FF87] text-[#0F1115] border-[#00FF87]' 
                          : 'bg-[#16191F] text-[#E4E7EB] border-[#2D3139] hover:bg-[#1A1D23]'
                      }`}
                    >
                      Pagar via Mercado Pago
                    </a>
                    
                    {/* Demo sandbox instant activation button */}
                    <button
                      type="button"
                      onClick={() => {
                        subscribeSaaS(plan.id as any);
                        alert(`✨ [Gestor FC Sandbox] Seu plano foi alterado com sucesso para "${plan.name}"! Os novos limites e ferramentas já estão desbloqueados no painel.`);
                      }}
                      className="w-full text-center block text-[10px] font-mono text-[#8E9299] hover:text-[#00FF87] transition-colors py-1 cursor-pointer bg-transparent border-none"
                    >
                      ⚙️ Ativar p/ Testes Instantâneo
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EXPORTAR DADOS (R$ 1.500+) */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="border-b border-[#2D3139] pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Download className="w-5 h-5 text-[#00FF87]" />
              Painel de Exportação e Relatórios
            </h3>
            <p className="text-xs text-[#8E9299] mt-0.5">
              Exporte todos os dados consolidados do torneio, classificação, histórico de jogos e listas de atletas inscritos.
            </p>
          </div>

          {/* Plan restriction lockout */}
          {!(currentUser?.subscriptionPlan === 'plan_1500' || currentUser?.subscriptionPlan === 'plan_3000') ? (
            <div className="bg-[#1A1D23] border border-amber-500/20 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Recurso de Exportação Bloqueado</h4>
                <p className="text-xs text-[#8E9299] mt-1 max-w-sm mx-auto leading-relaxed">
                  A extração automatizada de dados em Excel, CSV e JSON é um recurso premium disponível apenas nos planos 
                  <strong className="text-white"> SaaS Pro (R$ 1.500)</strong> e <strong className="text-white">League Master (R$ 3.000)</strong>.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('saas')}
                  className="bg-[#00FF87] text-[#0F1115] font-black text-xs px-5 py-2.5 rounded-xl hover:bg-[#00FF87]/90 transition-all cursor-pointer"
                >
                  Fazer Upgrade de Plano na Aba SaaS
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {organizerTournaments.length === 0 ? (
                <div className="text-center py-10 bg-[#1A1D23] border border-[#2D3139] rounded-2xl text-[#8E9299] text-xs">
                  Crie pelo menos um torneio para exportar dados.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Export Options Form */}
                  <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 space-y-4">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#00FF87]">Configuração do Relatório</h4>
                    
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[#8E9299] font-semibold mb-1">Selecione o Campeonato:</label>
                        <select 
                          id="exportTourId"
                          className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00FF87]"
                        >
                          {organizerTournaments.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[#8E9299] font-semibold mb-1">Formato do Arquivo:</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setExportType('json')}
                            className={`py-2 rounded-xl border text-center font-bold font-mono transition-colors cursor-pointer ${
                              exportType === 'json' ? 'bg-[#00FF87]/15 text-[#00FF87] border-[#00FF87]' : 'bg-[#16191F] text-[#8E9299] border-[#2D3139]'
                            }`}
                          >
                            JSON Data
                          </button>
                          <button
                            type="button"
                            onClick={() => setExportType('csv')}
                            className={`py-2 rounded-xl border text-center font-bold font-mono transition-colors cursor-pointer ${
                              exportType === 'csv' ? 'bg-[#00FF87]/15 text-[#00FF87] border-[#00FF87]' : 'bg-[#16191F] text-[#8E9299] border-[#2D3139]'
                            }`}
                          >
                            Planilha CSV
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#2D3139]">
                      <button
                        type="button"
                        onClick={() => {
                          const tourSelect = document.getElementById('exportTourId') as HTMLSelectElement | null;
                          const selectedId = tourSelect?.value || organizerTournaments[0]?.id;
                          if (!selectedId) return;

                          const tour = organizerTournaments.find(t => t.id === selectedId);
                          if (!tour) return;

                          const stand = calculateStandings(selectedId, teams, matches);
                          const tTeams = teams.filter(t => t.tournament_id === selectedId);
                          const tMatches = matches.filter(m => m.tournament_id === selectedId);

                          if (exportType === 'json') {
                            const exportData = {
                              campeonato: tour,
                              classificacao: stand,
                              times: tTeams.map(t => ({
                                id: t.id,
                                nome: t.name,
                                status: t.status,
                                atletas: players.filter(p => p.team_id === t.id)
                              })),
                              partidas: tMatches
                            };

                            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
                            const downloadAnchor = document.createElement('a');
                            downloadAnchor.setAttribute("href", dataStr);
                            downloadAnchor.setAttribute("download", `relatorio_${tour.name.toLowerCase().replace(/\s+/g, '_')}.json`);
                            document.body.appendChild(downloadAnchor);
                            downloadAnchor.click();
                            downloadAnchor.remove();
                          } else {
                            // CSV Format
                            let csvContent = "Posicao,Time,Pontos,Jogos,Vitorias,Empates,Derrotas,GolsPro,GolsContra,SaldoGols,Aproveitamento\n";
                            stand.forEach((row, index) => {
                              csvContent += `${index + 1},"${row.teamName}",${row.points},${row.played},${row.won},${row.drawn},${row.lost},${row.goalsFor},${row.goalsAgainst},${row.goalsDifference},${row.efficiency}%\n`;
                            });

                            const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
                            const url = URL.createObjectURL(blob);
                            const downloadAnchor = document.createElement('a');
                            downloadAnchor.setAttribute("href", url);
                            downloadAnchor.setAttribute("download", `tabela_${tour.name.toLowerCase().replace(/\s+/g, '_')}.csv`);
                            document.body.appendChild(downloadAnchor);
                            downloadAnchor.click();
                            downloadAnchor.remove();
                          }
                          alert('✅ Exportação concluída com sucesso! O arquivo foi baixado no seu navegador.');
                        }}
                        className="w-full bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Download className="w-4 h-4" />
                        Baixar Arquivo Gerado
                      </button>
                    </div>
                  </div>

                  {/* Sample Live Preview of Exportable Data */}
                  <div className="md:col-span-2 bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 space-y-3">
                    <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#00FF87]">Visualização Dinâmica dos Dados</h4>
                    <p className="text-[11px] text-[#8E9299]">Estes dados em tempo real serão empacotados no relatório final:</p>

                    <div className="bg-[#16191F] border border-[#2D3139] rounded-xl p-3 max-h-56 overflow-y-auto text-[10px] font-mono space-y-2">
                      <div className="border-b border-[#2D3139] pb-1.5 flex justify-between text-[#8E9299]">
                        <span>Time</span>
                        <span className="flex gap-4"><span>P</span><span>J</span><span>V</span><span>SG</span></span>
                      </div>
                      {teams.length === 0 ? (
                        <p className="text-[#8E9299] py-4 text-center">Nenhum time registrado.</p>
                      ) : (
                        teams.slice(0, 10).map(t => {
                          const wins = matches.filter(m => m.status === 'approved' && ((m.home_team_id === t.id && (m.score_home || 0) > (m.score_away || 0)) || (m.away_team_id === t.id && (m.score_away || 0) > (m.score_home || 0)))).length;
                          return (
                            <div key={t.id} className="flex justify-between text-white">
                              <span className="truncate max-w-[150px]">{t.name}</span>
                              <span className="flex gap-4 text-right">
                                <span className="text-[#00FF87] font-bold">-{wins * 3}</span>
                                <span>-{wins}</span>
                                <span>-{wins}</span>
                                <span>-{wins * 2}</span>
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="bg-[#16191F]/50 p-3 rounded-xl border border-[#2D3139] text-[10px] text-[#8E9299] space-y-1">
                      <p>● <strong>Profiles:</strong> {profiles.length} usuários vinculados ao ecossistema.</p>
                      <p>● <strong>Times Registrados:</strong> {teams.length} agremiações.</p>
                      <p>● <strong>Atletas Cadastrados:</strong> {players.length} atletas sob compliance.</p>
                      <p>● <strong>Partidas e Histórico:</strong> {matches.length} súmulas processadas.</p>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: WHATSAPP ALERTAS (R$ 3.000+) */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="border-b border-[#2D3139] pb-3">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-[#00D1FF]" />
              Painel de Disparo Automatizado via WhatsApp API
            </h3>
            <p className="text-xs text-[#8E9299] mt-0.5">
              Envie alertas de próximas rodadas, cartões acumulados, resultados e tabelas de classificação diretamente para os celulares das equipes.
            </p>
          </div>

          {/* Plan restriction lockout */}
          {currentUser?.subscriptionPlan !== 'plan_3000' ? (
            <div className="bg-[#1A1D23] border border-amber-500/20 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 bg-[#00D1FF]/10 rounded-full flex items-center justify-center mx-auto text-[#00D1FF]">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-sm">Integração WhatsApp Indisponível</h4>
                <p className="text-xs text-[#8E9299] mt-1 max-w-sm mx-auto leading-relaxed">
                  Os disparos automatizados integrados com WhatsApp são exclusivos para assinantes do plano 
                  <strong className="text-white"> League Master (R$ 3.000)</strong>. Libere disparos em lote ilimitados e alertas instantâneos.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setActiveTab('saas')}
                  className="bg-[#00D1FF] text-[#0F1115] font-black text-xs px-5 py-2.5 rounded-xl hover:bg-[#00D1FF]/90 transition-all cursor-pointer"
                >
                  Fazer Upgrade para League Master
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Simulated Campaign Sender */}
                <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#00D1FF]">Configurar Campanha</h4>
                  
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-[#8E9299] font-semibold mb-1">Destinatários:</label>
                      <select className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00D1FF]">
                        <option>Todos os Presidentes de Clubes ({teams.length} contatos)</option>
                        <option>Árbitros Credenciados ({profiles.filter(p => p.role === 'referee').length} contatos)</option>
                        <option>Comissão Organizadora do Torneio</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#8E9299] font-semibold mb-1">Template de Alerta:</label>
                      <select 
                        value={whatsappTemplate}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWhatsappTemplate(val);
                          if (val === 'rodada_atual') {
                            setWhatsappDraft(`⚠️ *Gestor FC - Alerta de Rodada* ⚠️\n\nFala galera da liga! Os jogos da próxima rodada foram definidos.\nConfira os locais e horários das partidas no painel.\n\nFoco no campeonato, boa sorte a todos! ⚽️`);
                          } else if (val === 'resultado') {
                            setWhatsappDraft(`📢 *Placar Final - Gestor FC* 📢\n\nA rodada foi finalizada e as súmulas homologadas com sucesso!\n\nConfira a classificação atualizada no aplicativo.\n\n🏆 Gestor FC - Gestão de Elite`);
                          } else {
                            setWhatsappDraft('');
                          }
                        }}
                        className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-3 py-2 text-white outline-none focus:border-[#00D1FF]"
                      >
                        <option value="rodada_atual">Aviso de Próxima Rodada</option>
                        <option value="resultado">Resultado e Homologação de Partida</option>
                        <option value="custom">Mensagem Personalizada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#8E9299] font-semibold mb-1">Corpo da Mensagem:</label>
                      <textarea
                        rows={5}
                        value={whatsappDraft || `⚠️ *Gestor FC - Alerta de Rodada* ⚠️\n\nFala galera da liga! Os jogos da próxima rodada foram definidos.\nConfira os locais e horários das partidas no painel.\n\nFoco no campeonato, boa sorte a todos! ⚽️`}
                        onChange={(e) => setWhatsappDraft(e.target.value)}
                        placeholder="Escreva a mensagem que deseja disparar..."
                        className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl p-3 text-white font-mono text-[11px] outline-none focus:border-[#00D1FF] resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={whatsappSending}
                      onClick={() => {
                        setWhatsappSending(true);
                        setTimeout(() => {
                          setWhatsappSending(false);
                          const newAlert = {
                            id: 'wa_' + Date.now(),
                            time: new Date().toLocaleTimeString(),
                            text: whatsappDraft || 'Alerta disparado para as equipes.',
                            status: 'delivered' as const
                          };
                          setWhatsappSentList(prev => [newAlert, ...prev]);
                          alert('🚀 API disparada! Mensagens enviadas com sucesso no WhatsApp dos representantes cadastrados.');
                        }, 1800);
                      }}
                      className="w-full bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0F1115] font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {whatsappSending ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Disparando em lote...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Disparar Mensagens Agora
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Simulated Delivery Screen / Logs */}
                <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 space-y-4">
                  <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#00D1FF]">Histórico de Disparos Recentes</h4>
                  
                  <div className="space-y-3.5">
                    {whatsappSentList.length === 0 ? (
                      <div className="text-center py-16 text-[#8E9299] text-xs">
                        <p>Nenhuma mensagem disparada hoje.</p>
                        <p className="text-[10px] text-[#8E9299]/60 mt-1">Configure o template ao lado e envie um alerta.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[310px] overflow-y-auto">
                        {whatsappSentList.map(log => (
                          <div key={log.id} className="bg-[#16191F] border border-[#2D3139] p-3 rounded-xl text-xs space-y-2">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-mono text-[#8E9299]">Horário: {log.time}</span>
                              <span className="bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20 px-2 py-0.5 rounded-full font-bold">
                                ● Entregue
                              </span>
                            </div>
                            <p className="text-white font-mono text-[11px] whitespace-pre-wrap leading-tight bg-[#0F1115] p-2 rounded-lg border border-[#2D3139]">
                              {log.text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
