/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { Match, Team, Player, MatchEvent } from '../types';
import { Award, FileText, Plus, Trash2, CheckCircle, Calendar, Play } from 'lucide-react';

export const RefereePanel: React.FC = () => {
  const { currentUser, matches, teams, players, submitSumula } = useDatabase();

  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Súmula Form States
  const [scoreHome, setScoreHome] = useState<number>(0);
  const [scoreAway, setScoreAway] = useState<number>(0);
  const [tempEvents, setTempEvents] = useState<Omit<MatchEvent, 'id'>[]>([]);

  // Event logger states
  const [eventType, setEventType] = useState<'goal' | 'assist' | 'yellow_card' | 'red_card'>('goal');
  const [eventTeamId, setEventTeamId] = useState<string>('');
  const [eventPlayerId, setEventPlayerId] = useState<string>('');
  const [eventMinute, setEventMinute] = useState<number>(45);

  // Filter matches assigned to this referee
  const refereeMatches = useMemo(() => {
    if (!currentUser) return [];
    return matches.filter(m => m.referee_id === currentUser.id);
  }, [matches, currentUser]);

  // Selected Match details
  const selectedMatch = useMemo(() => {
    return matches.find(m => m.id === selectedMatchId) || null;
  }, [matches, selectedMatchId]);

  // Teams in the selected match
  const selectedMatchTeams = useMemo(() => {
    if (!selectedMatch) return { home: null, away: null };
    const home = teams.find(t => t.id === selectedMatch.home_team_id) || null;
    const away = teams.find(t => t.id === selectedMatch.away_team_id) || null;
    return { home, away };
  }, [selectedMatch, teams]);

  // Auto-fill form values when selecting a match
  const handleSelectMatch = (match: Match) => {
    setSelectedMatchId(match.id);
    setScoreHome(match.score_home || 0);
    setScoreAway(match.score_away || 0);
    setTempEvents([]);
    
    // Set default team for event builder
    setEventTeamId(match.home_team_id);
  };

  // Players of the selected team for event assignment
  const eventAvailablePlayers = useMemo(() => {
    if (!eventTeamId) return [];
    return players.filter(p => p.team_id === eventTeamId && p.validation_status === 'valid');
  }, [eventTeamId, players]);

  // Handle adding an event to the temporary sheet
  const handleAddTempEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId || !eventTeamId || !eventPlayerId) return;

    const newEvt: Omit<MatchEvent, 'id'> = {
      match_id: selectedMatchId,
      type: eventType,
      team_id: eventTeamId,
      player_id: eventPlayerId,
      minute: Number(eventMinute)
    };

    setTempEvents([...tempEvents, newEvt]);
    
    // Auto-update match score if the event was a goal! This is extremely smart and convenient!
    if (eventType === 'goal') {
      if (eventTeamId === selectedMatch?.home_team_id) {
        setScoreHome(prev => prev + 1);
      } else {
        setScoreAway(prev => prev + 1);
      }
    }
  };

  const handleRemoveTempEvent = (index: number) => {
    const itemToRemove = tempEvents[index];
    setTempEvents(tempEvents.filter((_, idx) => idx !== index));
    
    // If we remove a goal, decrease score!
    if (itemToRemove.type === 'goal') {
      if (itemToRemove.team_id === selectedMatch?.home_team_id) {
        setScoreHome(prev => Math.max(0, prev - 1));
      } else {
        setScoreAway(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleSubmitSumulaForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    submitSumula(selectedMatchId, scoreHome, scoreAway, tempEvents);
    alert('Súmula enviada com sucesso! O placar e eventos estão aguardando aprovação dos donos de times.');
    setSelectedMatchId(null);
  };

  const getTeamName = (teamId: string) => {
    return teams.find(t => t.id === teamId)?.name || 'Time';
  };

  const getPlayerName = (playerId: string) => {
    return players.find(p => p.id === playerId)?.name || 'Atleta';
  };

  return (
    <div className="bg-[#16191F] rounded-2xl border border-[#2D3139] shadow-md overflow-hidden p-6">
      
      {/* Title */}
      <div className="mb-6 pb-4 border-b border-[#2D3139]">
        <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Award className="w-6 h-6 text-[#00FF87]" />
          Painel de Escala de Arbitragem
        </h2>
        <p className="text-[#8E9299] text-xs mt-0.5">
          Consulte suas escalas de arbitragem ativa e insira relatórios pós-partida para homologar as pontuações.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MATCHES LIST */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-1">
            <FileText className="w-4 h-4 text-[#00D1FF]" />
            Minhas Escalas Ativas
          </h3>

          {refereeMatches.length === 0 ? (
            <div className="text-center py-8 bg-[#1A1D23] border border-[#2D3139] rounded-2xl text-[#8E9299] text-xs">
              Você não está escalado como árbitro em nenhuma partida.
            </div>
          ) : (
            <div className="space-y-2.5">
              {refereeMatches.map(m => {
                const home = getTeamName(m.home_team_id);
                const away = getTeamName(m.away_team_id);
                const isSelected = selectedMatchId === m.id;

                return (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMatch(m)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-[#1A1D23]/80 border-[#00FF87]/40 ring-1 ring-[#00FF87]/20' 
                        : 'bg-[#1A1D23] hover:bg-[#1E222A] border-[#2D3139]'
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-[#8E9299] font-semibold mb-2">
                      <span className="bg-[#2D3139] text-[#E4E7EB] px-1.5 py-0.5 rounded uppercase">
                        Rodada {m.round}
                      </span>
                      <span>{m.date} - {m.time}</span>
                    </div>

                    <p className="font-bold text-white text-xs sm:text-sm">
                      {home} vs {away}
                    </p>
                    <p className="text-[11px] text-[#8E9299] mt-1">{m.location}</p>

                    <div className="mt-3 pt-2 border-t border-[#2D3139]/50 flex justify-between items-center text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-full ${
                        m.status === 'scheduled' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        m.status === 'awaiting_approval' ? 'bg-[#00D1FF]/10 text-[#00D1FF] border border-[#00D1FF]/20' : 'bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20'
                      }`}>
                        {m.status === 'scheduled' ? 'Partida Agendada' :
                         m.status === 'awaiting_approval' ? 'Em Aprovação' : 'Aprovado'}
                      </span>
                      
                      {m.status === 'scheduled' && (
                        <span className="text-[#00FF87] flex items-center gap-0.5">
                          Lançar Súmula <Plus className="w-3 h-3 text-[#00FF87]" />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVE FORM AREA */}
        <div className="lg:col-span-2">
          {!selectedMatchId || !selectedMatch ? (
            <div className="bg-[#1A1D23] border-2 border-dashed border-[#2D3139] rounded-2xl p-12 text-center text-[#8E9299]">
              <FileText className="w-12 h-12 text-[#2D3139] mx-auto mb-3 animate-pulse" />
              <h3 className="font-bold text-white">Selecione uma partida</h3>
              <p className="text-xs mt-1 max-w-xs mx-auto text-[#8E9299]/80">
                Clique em uma partida agendada na barra lateral para abrir a súmula online e logar lances e placar final.
              </p>
            </div>
          ) : (
            <div className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-5 space-y-5">
              
              {/* Match description banner */}
              <div className="bg-gradient-to-r from-[#16191F] to-[#20252D] border border-[#2D3139] text-white rounded-xl p-4">
                <p className="text-[10px] uppercase font-bold tracking-wider text-[#00D1FF]">
                  Formulário de Súmula Online de Campo
                </p>
                <h3 className="text-base sm:text-lg font-extrabold mt-1 text-white">
                  {getTeamName(selectedMatch.home_team_id)} vs {getTeamName(selectedMatch.away_team_id)}
                </h3>
                <p className="text-xs text-[#8E9299] font-light mt-0.5">
                  Estádio: {selectedMatch.location} | Data: {selectedMatch.date} às {selectedMatch.time}
                </p>
              </div>

              {selectedMatch.status !== 'scheduled' && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs p-3 rounded-xl">
                  ⚠️ <strong>Esta partida já possui súmula lançada!</strong> Você pode relançar os dados abaixo caso queira corrigir alguma informação do placar.
                </div>
              )}

              {/* End Score Inputs */}
              <form onSubmit={handleSubmitSumulaForm} className="space-y-5 text-xs sm:text-sm">
                
                <div className="bg-[#16191F] border border-[#2D3139] p-4 rounded-xl">
                  <h4 className="font-bold text-white text-xs uppercase mb-3 text-center">Placar Final</h4>
                  
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <label className="block text-[11px] font-bold text-[#8E9299] uppercase mb-1">{getTeamName(selectedMatch.home_team_id)}</label>
                      <input
                        type="number"
                        value={scoreHome}
                        onChange={(e) => setScoreHome(Number(e.target.value))}
                        min={0}
                        className="w-16 text-center text-xl font-bold bg-[#1A1D23] border border-[#2D3139] rounded-lg py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-[#00FF87]"
                        required
                      />
                    </div>

                    <span className="text-[#2D3139] font-bold text-xl">-</span>

                    <div className="text-center">
                      <label className="block text-[11px] font-bold text-[#8E9299] uppercase mb-1">{getTeamName(selectedMatch.away_team_id)}</label>
                      <input
                        type="number"
                        value={scoreAway}
                        onChange={(e) => setScoreAway(Number(e.target.value))}
                        min={0}
                        className="w-16 text-center text-xl font-bold bg-[#1A1D23] border border-[#2D3139] rounded-lg py-1.5 text-white focus:outline-none focus:ring-1 focus:ring-[#00FF87]"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Event Builder tool */}
                <div className="bg-[#16191F] border border-[#2D3139] p-4 rounded-xl space-y-3">
                  <h4 className="font-bold text-white text-xs uppercase border-b border-[#2D3139] pb-2">
                    Lançar Evento de Jogo (Gols, Cartões, Assistências)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-white">
                    
                    {/* Event Type */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Acontecimento</label>
                      <select
                        value={eventType}
                        onChange={(e: any) => setEventType(e.target.value)}
                        className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value="goal">⚽️ Gol</option>
                        <option value="assist">👟 Assistência</option>
                        <option value="yellow_card">🟨 Cartão Amarelo</option>
                        <option value="red_card">🟥 Cartão Vermelho</option>
                      </select>
                    </div>

                    {/* Team Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Equipe</label>
                      <select
                        value={eventTeamId}
                        onChange={(e) => {
                          setEventTeamId(e.target.value);
                          setEventPlayerId(''); // reset player selection
                        }}
                        className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-1.5 text-xs text-white"
                      >
                        <option value={selectedMatch.home_team_id}>[Mandante] {getTeamName(selectedMatch.home_team_id)}</option>
                        <option value={selectedMatch.away_team_id}>[Visitante] {getTeamName(selectedMatch.away_team_id)}</option>
                      </select>
                    </div>

                    {/* Athlete Selector */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Atleta Inscrito</label>
                      <select
                        value={eventPlayerId}
                        onChange={(e) => setEventPlayerId(e.target.value)}
                        className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-1.5 text-xs text-white"
                        required
                      >
                        <option value="">Selecione o jogador...</option>
                        {eventAvailablePlayers.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Minute */}
                    <div>
                      <label className="block text-[10px] font-bold text-[#8E9299] uppercase mb-1">Minuto do lance</label>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          value={eventMinute}
                          onChange={(e) => setEventMinute(Number(e.target.value))}
                          min={1}
                          max={90}
                          className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-lg p-1.5 text-xs text-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleAddTempEvent}
                          disabled={!eventPlayerId}
                          className="bg-[#00FF87] text-[#0F1115] font-black text-xs px-3 rounded-lg hover:bg-[#00FF87]/90 disabled:bg-[#2D3139] disabled:text-[#8E9299]/50 transition-colors cursor-pointer"
                        >
                          Ok
                        </button>
                      </div>
                    </div>

                  </div>

                  {eventAvailablePlayers.length === 0 && eventTeamId && (
                    <p className="text-[10px] text-red-400">
                      ⚠️ Nenhum atleta <strong>aprovado pelo sistema</strong> para este time. Inscreva e valide atletas primeiro!
                    </p>
                  )}
                </div>

                {/* Logged events visualizer */}
                <div className="bg-[#16191F] border border-[#2D3139] p-4 rounded-xl">
                  <h4 className="font-bold text-white text-xs uppercase mb-3">Linha do Tempo dos Lances Criados</h4>
                  
                  {tempEvents.length === 0 ? (
                    <p className="text-[#8E9299] font-mono text-[11px] text-center py-2">
                      Nenhum gol ou cartão foi adicionado à súmula ainda. Use a ferramenta acima.
                    </p>
                  ) : (
                    <div className="space-y-1.5 font-mono text-[11px] text-white">
                      {tempEvents.map((evt, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-[#1A1D23] p-2 rounded border border-[#2D3139]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#00FF87]">[{evt.minute}']</span>
                            <span className="capitalize font-bold text-white">
                              {evt.type === 'goal' ? '⚽️ GOL' : 
                               evt.type === 'assist' ? '👟 ASSIST' : 
                               evt.type === 'yellow_card' ? '🟨 CARTÃO AMARELO' : '🟥 CARTÃO VERMELHO'}
                            </span>
                            <span>- {getPlayerName(evt.player_id)} ({getTeamName(evt.team_id)})</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => handleRemoveTempEvent(idx)}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submission CTA */}
                <button
                  type="submit"
                  className="w-full bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black py-2.5 rounded-xl transition-all shadow-md shadow-[#00FF87]/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-[#0F1115]" />
                  Salvar e Enviar Súmula Oficial
                </button>

              </form>

            </div>
          )}
        </div>

      </div>

    </div>
  );
};
