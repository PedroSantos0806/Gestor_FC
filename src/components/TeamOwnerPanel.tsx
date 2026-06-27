/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Player, Team } from '../types';
import { 
  Users, UserPlus, CheckCircle2, XCircle, Trophy, 
  Mail, Star, ShieldAlert, ArrowRight, UserCheck 
} from 'lucide-react';

export const TeamOwnerPanel: React.FC = () => {
  const { 
    currentUser, invitations, tournaments, teams, players, matches, events,
    respondInvitation, registerTeam, registerPlayer, approveSumula, rateField 
  } = useDatabase();

  const [activeTab, setActiveTab] = useState<'invites' | 'roster' | 'match_sheets'>('invites');

  // Register Team states
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('⚽️');
  const [selectedTourIdForTeam, setSelectedTourIdForTeam] = useState('');

  // Register Player states
  const [playerName, setPlayerName] = useState('');
  const [playerCpf, setPlayerCpf] = useState('');
  const [playerBirthDate, setPlayerBirthDate] = useState('2009-05-15');
  const [playerPhoto, setPlayerPhoto] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80');
  const [selectedTeamIdForPlayer, setSelectedTeamIdForPlayer] = useState('');
  const [validationResult, setValidationResult] = useState<{ success: boolean; notes?: string } | null>(null);

  // Field Rating States
  const [ratedMatchId, setRatedMatchId] = useState<string | null>(null);
  const [fieldRating, setFieldRating] = useState<number>(5);

  // Filter invites belonging to current user
  const myInvites = useMemo(() => {
    if (!currentUser) return [];
    return invitations.filter(inv => inv.email.toLowerCase() === currentUser.email.toLowerCase() && inv.status === 'pending');
  }, [invitations, currentUser]);

  // Filter teams belonging to current user
  const myTeams = useMemo(() => {
    if (!currentUser) return [];
    return teams.filter(t => t.owner_id === currentUser.id);
  }, [teams, currentUser]);

  useMemo(() => {
    if (myTeams.length > 0 && !selectedTeamIdForPlayer) {
      setSelectedTeamIdForPlayer(myTeams[0].id);
    }
  }, [myTeams, selectedTeamIdForPlayer]);

  // Filter tour invites that can have a team registered (not yet registered)
  const myAvailableTournamentsForTeam = useMemo(() => {
    if (!currentUser) return [];
    // Active accepted tournament memberships
    const acceptedInvites = invitations.filter(inv => inv.email.toLowerCase() === currentUser.email.toLowerCase() && inv.status === 'accepted');
    return tournaments.filter(t => {
      const alreadyHasTeam = teams.some(tm => tm.tournament_id === t.id && tm.owner_id === currentUser.id);
      const wasInvited = acceptedInvites.some(inv => inv.tournament_id === t.id);
      return wasInvited && !alreadyHasTeam;
    });
  }, [tournaments, teams, invitations, currentUser]);

  useMemo(() => {
    if (myAvailableTournamentsForTeam.length > 0 && !selectedTourIdForTeam) {
      setSelectedTourIdForTeam(myAvailableTournamentsForTeam[0].id);
    }
  }, [myAvailableTournamentsForTeam, selectedTourIdForTeam]);

  // Filter players belonging to teams of the current user
  const myPlayers = useMemo(() => {
    const teamIds = new Set(myTeams.map(t => t.id));
    return players.filter(p => teamIds.has(p.team_id));
  }, [players, myTeams]);

  // Matches involving this user's teams awaiting approval
  const awaitingApprovalMatches = useMemo(() => {
    const teamIds = new Set(myTeams.map(t => t.id));
    return matches.filter(m => {
      const isHome = teamIds.has(m.home_team_id);
      const isAway = teamIds.has(m.away_team_id);
      const isMatchAwaitingApproval = m.status === 'awaiting_approval';
      const alreadyApprovedByMe = (isHome && m.home_approved) || (isAway && m.away_approved);
      return (isHome || isAway) && isMatchAwaitingApproval && !alreadyApprovedByMe;
    });
  }, [matches, myTeams]);

  // Handles responding to a pending tournament invitation
  const handleAcceptInvite = (id: string) => {
    respondInvitation(id, 'accepted');
    alert('Convite aceito! Agora você pode criar e inscrever sua equipe e seus atletas.');
    setActiveTab('roster');
  };

  const handleDeclineInvite = (id: string) => {
    respondInvitation(id, 'declined');
    alert('Convite recusado.');
  };

  const handleRegisterTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !selectedTourIdForTeam) return;

    registerTeam({
      name: teamName.trim(),
      logo_url: teamLogo,
      tournament_id: selectedTourIdForTeam,
      category: 'Adulto Livre' // matches standard
    });

    setTeamName('');
    alert(`Equipe "${teamName}" registrada com sucesso e inscrita no campeonato!`);
  };

  const handleRegisterPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !playerCpf.trim() || !selectedTeamIdForPlayer) return;

    // Resolve tournament category
    const playerTeam = teams.find(t => t.id === selectedTeamIdForPlayer);
    const tournament = tournaments.find(t => t.id === playerTeam?.tournament_id);
    const categoryName = tournament?.category || 'Adulto Livre';

    const result = registerPlayer({
      name: playerName.trim(),
      cpf: playerCpf.trim(),
      birth_date: playerBirthDate,
      photo_url: playerPhoto,
      team_id: selectedTeamIdForPlayer
    }, categoryName);

    // Display validation response directly to user
    setValidationResult({
      success: result.isValid,
      notes: result.errorNotes
    });

    if (result.isValid) {
      setPlayerName('');
      setPlayerCpf('');
      // clear status after 4s
      setTimeout(() => setValidationResult(null), 4000);
    }
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Time';
  };

  const getTournamentName = (tourId: string) => {
    return tournaments.find(t => t.id === tourId)?.name || 'Campeonato';
  };

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Atleta';
  };

  const getMatchEvents = (matchId: string) => {
    return events.filter(e => e.match_id === matchId);
  };

  return (
    <div className="bg-[#16191F] rounded-2xl border border-[#2D3139] shadow-md overflow-hidden p-6">
      
      {/* Title */}
      <div className="mb-6 pb-4 border-b border-[#2D3139] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#00FF87]" />
            Painel do Dono do Time
          </h2>
          <p className="text-[#8E9299] text-xs mt-0.5">
            Inscreva sua equipe nos torneios convidados, cadastre atletas com checagem automática e aprove súmulas.
          </p>
        </div>

        <div className="flex bg-[#1A1D23] p-0.5 rounded-lg border border-[#2D3139] text-xs font-bold">
          <button
            onClick={() => setActiveTab('invites')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'invites' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'}`}
          >
            Convites Pendentes ({myInvites.length})
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${activeTab === 'roster' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'}`}
          >
            Gerenciar Time & Elenco
          </button>
          <button
            onClick={() => setActiveTab('match_sheets')}
            className={`px-3 py-1.5 rounded-md transition-all relative cursor-pointer ${activeTab === 'match_sheets' ? 'bg-[#16191F] text-[#00FF87] shadow-sm' : 'text-[#8E9299] hover:text-white'}`}
          >
            Aprovar Resultados
            {awaitingApprovalMatches.length > 0 && (
              <span className="absolute -top-1.5 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {awaitingApprovalMatches.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB CONTENT: PENDING INVITES */}
      {activeTab === 'invites' && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-sm mb-2">Convites Recebidos de Organizadores</h3>
          
          {myInvites.length === 0 ? (
            <div className="text-center py-10 bg-[#1A1D23] border border-[#2D3139] rounded-2xl text-[#8E9299] text-xs">
              Nenhum convite pendente para sua conta no momento.
            </div>
          ) : (
            <div className="space-y-3">
              {myInvites.map(inv => (
                <div key={inv.id} className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#00FF87]/30 transition-all">
                  <div>
                    <span className="text-[10px] font-bold text-[#00D1FF] bg-[#00D1FF]/10 px-2 py-0.5 rounded uppercase border border-[#00D1FF]/20">
                      Torneio Oficial
                    </span>
                    <h4 className="font-extrabold text-white text-sm mt-1">
                      Você foi convidado para inscrever o time: <span className="text-[#00D1FF] font-sans">"{inv.team_name || 'Seu Clube'}"</span>
                    </h4>
                    <p className="text-xs text-[#8E9299] mt-0.5">Campeonato: {getTournamentName(inv.tournament_id)}</p>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleAcceptInvite(inv.id)}
                      className="flex-1 sm:flex-initial bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black text-xs px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      Aceitar e Entrar
                    </button>
                    <button
                      onClick={() => handleDeclineInvite(inv.id)}
                      className="flex-1 sm:flex-initial bg-[#16191F] border border-[#2D3139] text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors hover:bg-[#1A1D23] cursor-pointer"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ROSTER REGISTRATION */}
      {activeTab === 'roster' && (
        <div className="space-y-8">
          
          {/* Step 1: Register Team (if accepted invitation but no team active yet) */}
          {myAvailableTournamentsForTeam.length > 0 && (
            <div className="bg-[#1A1D23] border border-[#00FF87]/30 rounded-2xl p-5">
              <h3 className="font-bold text-white text-sm pb-2 border-b border-[#2D3139] mb-3 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-[#00FF87]" />
                Criar Equipe do Campeonato Aceito
              </h3>
              <p className="text-xs text-[#8E9299] mb-4">Primeiro, defina os dados do clube para o torneio no qual você aceitou o convite:</p>

              <form onSubmit={handleRegisterTeamSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Escolher Campeonato</label>
                  <select
                    value={selectedTourIdForTeam}
                    onChange={(e) => setSelectedTourIdForTeam(e.target.value)}
                    className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-2 text-white font-medium focus:outline-none"
                    required
                  >
                    {myAvailableTournamentsForTeam.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Nome Oficial da Equipe</label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Ex: Alvinegro Vila Real FC"
                    className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-2 text-white focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Símbolo / Logo (Emoji)</label>
                  <div className="flex gap-2">
                    <select
                      value={teamLogo}
                      onChange={(e) => setTeamLogo(e.target.value)}
                      className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-2 text-white focus:outline-none"
                    >
                      <option value="⚽️">⚽️ Tradicional</option>
                      <option value="🔴⚫️">🔴⚫️ Rubro-Negro</option>
                      <option value="🟢⚪️">🟢⚪️ Alviverde</option>
                      <option value="⚫️⚪️">⚫️⚪️ Alvinegro</option>
                      <option value="🔵⚪️">🔵⚪️ Azul e Branco</option>
                      <option value="🦁">🦁 Leão</option>
                      <option value="🦅">🦅 Águia</option>
                    </select>
                    <button
                      type="submit"
                      className="bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black px-4 rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      Criar Time
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Register Athlete Form */}
          {myTeams.length === 0 ? (
            <div className="text-center py-6 text-[#8E9299] text-xs bg-[#1A1D23] rounded-xl border border-[#2D3139]">
              Para cadastrar atletas, você precisa primeiro ter uma equipe cadastrada em algum torneio.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form card */}
              <div className="lg:col-span-1 bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 space-y-4">
                <h3 className="font-bold text-white text-xs sm:text-sm pb-1.5 border-b border-[#2D3139] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#00FF87]" />
                  Inscrever Atleta no Time
                </h3>

                {validationResult && (
                  <div className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                    validationResult.success 
                      ? 'bg-[#00FF87]/10 border-[#00FF87]/30 text-[#00FF87]' 
                      : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}>
                    {validationResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-[#00FF87] shrink-0 mt-0.5" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{validationResult.success ? 'Inscrição Aprovada!' : 'Inscrição Bloqueada!'}</p>
                      <p className="text-[10px] mt-0.5 leading-relaxed font-medium">
                        {validationResult.success 
                          ? 'CPF e limite de idade validados com sucesso no portal do Governo.' 
                          : `Erro: ${validationResult.notes}`}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegisterPlayerSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Selecionar Equipe</label>
                    <select
                      value={selectedTeamIdForPlayer}
                      onChange={(e) => setSelectedTeamIdForPlayer(e.target.value)}
                      className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-1.5 text-white font-medium focus:outline-none"
                      required
                    >
                      {myTeams.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({getTournamentName(t.tournament_id)})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Nome Completo do Atleta</label>
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Ex: Gabigol de Souza"
                      className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">CPF (11 dígitos)</label>
                      <input
                        type="text"
                        value={playerCpf}
                        onChange={(e) => setPlayerCpf(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Nascimento</label>
                      <input
                        type="date"
                        value={playerBirthDate}
                        onChange={(e) => setPlayerBirthDate(e.target.value)}
                        className="w-full bg-[#16191F] border border-[#2D3139] rounded-xl px-2.5 py-1.5 text-white focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Warning on CPF Sandbox simulation */}
                  <div className="bg-[#16191F] border border-[#2D3139] p-2.5 rounded-lg text-[10px] text-[#8E9299] font-medium leading-relaxed">
                    💡 <strong>Dica de Teste Sandbox CPF:</strong> Digite o CPF finalizado com <strong>99</strong> (ex: <code>000.000.000-99</code>) para simular uma rejeição da Receita Federal ou erro de idade por categoria de menor!
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black py-2 rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-[#0F1115]" />
                    Enviar e Checar CPF
                  </button>
                </form>
              </div>

              {/* Player Roster lists */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="font-bold text-white text-sm mb-2 flex items-center justify-between">
                  <span>Elenco e Atletas Inscritos ({myPlayers.length})</span>
                  <span className="text-[10px] text-[#8E9299] font-semibold uppercase">Checagem de elegibilidade</span>
                </h3>

                <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4 overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#2D3139] text-[#8E9299] font-bold uppercase">
                        <th className="py-2">Foto</th>
                        <th className="py-2">Nome Atleta</th>
                        <th className="py-2">CPF</th>
                        <th className="py-2">Nascimento</th>
                        <th className="py-2">Checagem Governo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D3139]/30 font-medium">
                      {myPlayers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-[#8E9299] font-normal">
                            Nenhum jogador registrado no elenco do seu time ainda.
                          </td>
                        </tr>
                      ) : (
                        myPlayers.map(p => (
                          <tr key={p.id} className="hover:bg-[#16191F]/50">
                            <td className="py-2.5">
                              <img
                                src={p.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=80'}
                                alt="atleta"
                                className="w-8 h-8 rounded-full border border-[#2D3139] object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </td>
                            <td className="py-2.5 text-white font-bold">
                              {p.name}
                              <span className="block text-[9px] text-[#8E9299] font-normal uppercase mt-0.5">
                                Time: {getTeamName(p.team_id)}
                              </span>
                            </td>
                            <td className="py-2.5 font-mono text-[#8E9299] text-[10px]">{p.cpf}</td>
                            <td className="py-2.5 text-[#E4E7EB]">{p.birth_date}</td>
                            <td className="py-2.5">
                              {p.validation_status === 'valid' ? (
                                <span className="inline-flex items-center gap-1 text-[#00FF87] bg-[#00FF87]/10 px-2 py-0.5 rounded-full font-bold text-[9px] border border-[#00FF87]/20">
                                  <CheckCircle2 className="w-3 h-3 text-[#00FF87]" />
                                  Regularizado
                                </span>
                              ) : (
                                <div className="space-y-0.5">
                                  <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full font-bold text-[9px] border border-red-500/20">
                                    <XCircle className="w-3 h-3 text-red-400" />
                                    Bloqueado CPF/Idade
                                  </span>
                                  {p.validation_notes && (
                                    <span className="block text-[9px] text-red-400 font-medium max-w-[180px] leading-tight">
                                      {p.validation_notes}
                                    </span>
                                  )}
                                </div>
                              )}
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
        </div>
      )}

      {/* TAB CONTENT: APPROVALS */}
      {activeTab === 'match_sheets' && (
        <div className="space-y-4">
          <h3 className="font-bold text-white text-sm mb-2">Aprovação de Resultados e Súmulas</h3>
          <p className="text-xs text-[#8E9299]">Ambos os representantes de times envolvidos no jogo precisam ler e certificar o placar antes do organizador oficializar.</p>

          {awaitingApprovalMatches.length === 0 ? (
            <div className="text-center py-10 bg-[#1A1D23] border border-[#2D3139] rounded-2xl text-[#8E9299] text-xs">
              Nenhuma súmula de partida envolvendo seu clube aguarda sua leitura ou homologação no momento.
            </div>
          ) : (
            <div className="space-y-4">
              {awaitingApprovalMatches.map(m => {
                const home = getTeamName(m.home_team_id);
                const away = getTeamName(m.away_team_id);
                const matchEvents = getMatchEvents(m.id);

                return (
                  <div key={m.id} className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4 space-y-3 hover:border-[#2D3139] transition-all">
                    <div className="flex justify-between items-start text-xs border-b border-[#2D3139] pb-2">
                      <div>
                        <span className="bg-[#2D3139] text-[#E4E7EB] px-1.5 py-0.5 rounded font-extrabold text-[9px] uppercase">
                          Copa Metropolitana • Rodada {m.round}
                        </span>
                        <h4 className="font-extrabold text-white text-sm sm:text-base mt-1">
                          {home} {m.score_home} - {m.score_away} {away}
                        </h4>
                      </div>
                      <span className="text-[#8E9299] text-[10px]">{m.date}</span>
                    </div>

                    {/* Events detailed report */}
                    <div className="text-xs">
                      <p className="font-bold text-white mb-1.5">Eventos da Súmula do Árbitro:</p>
                      <div className="bg-[#16191F] p-3 rounded-xl border border-[#2D3139] font-mono text-[10px] space-y-1 text-[#E4E7EB]">
                        {matchEvents.length === 0 ? (
                          <p className="text-[#8E9299] font-normal">Nenhum evento lançado.</p>
                        ) : (
                          matchEvents.map(evt => (
                            <p key={evt.id}>
                              [{evt.minute}'] - {evt.type.toUpperCase()}: {getPlayerName(evt.player_id)} ({getTeamName(evt.team_id)})
                            </p>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Action button bar */}
                    <div className="pt-2 border-t border-[#2D3139] flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => {
                          // Resolve which team is current user's team in this match
                          const userTeam = myTeams.find(t => t.id === m.home_team_id || t.id === m.away_team_id);
                          if (userTeam) {
                            approveSumula(m.id, userTeam.id);
                            alert('Súmula aprovada pelo seu clube! Após o outro time e o organizador assinarem, a tabela atualizará.');
                          }
                        }}
                        className="flex-1 bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black text-xs py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Aprovar Súmula da Partida (Assinatura Digital)
                      </button>

                      {/* Field assessment modal trigger */}
                      <button
                        onClick={() => {
                          setRatedMatchId(m.id);
                        }}
                        className="bg-[#16191F] hover:bg-[#1A1D23] border border-[#2D3139] text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        Avaliar Campo / Gramado
                      </button>
                    </div>

                    {/* Field rating form widget if selected */}
                    {ratedMatchId === m.id && (
                      <div className="mt-3 bg-[#00D1FF]/10 border border-[#00D1FF]/30 p-3.5 rounded-xl text-xs">
                        <h5 className="font-bold text-[#00D1FF] mb-1">Avaliar Campo da Partida ({m.location})</h5>
                        <p className="text-[#8E9299] mb-3">Avalie o estado do campo, vestiários e infraestrutura geral para futuras rodadas.</p>
                        
                        <div className="flex items-center gap-1.5 mb-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFieldRating(star)}
                              className="p-1 hover:scale-115 transition-transform cursor-pointer"
                            >
                              <Star className={`w-5 h-5 ${star <= fieldRating ? 'fill-amber-400 text-amber-400' : 'text-[#2D3139]'}`} />
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            // Determine which side rate
                            const isHome = myTeams.some(t => t.id === m.home_team_id);
                            rateField(m.id, fieldRating, isHome ? 'home' : 'away');
                            setRatedMatchId(null);
                            alert('Avaliação do campo enviada com sucesso ao organizador do torneio!');
                          }}
                          className="bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0F1115] font-black px-3 py-1.5 rounded-lg"
                        >
                          Registrar Nota do Campo
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

    </div>
  );
};
