/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { calculateStandings, calculateTopScorers, calculateTopAssists, calculateCards } from '../utils/stats';
import { 
  Trophy, Calendar, Users, Award, ShieldAlert, 
  ChevronRight, ArrowRight, Search, Filter, Info, Star 
} from 'lucide-react';

export const PublicStandings: React.FC = () => {
  const { tournaments, teams, players, matches, events } = useDatabase();

  // Filter States
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Sub-table/Tab selection inside the tournament view
  const [activeTab, setActiveTab] = useState<'standings' | 'scorers' | 'assists' | 'cards' | 'results'>('standings');
  const [selectedRound, setSelectedRound] = useState<number>(1);

  // Available Filter Options derived dynamically
  const sportsList = useMemo(() => {
    const list = new Set(tournaments.map(t => t.sport_name));
    return Array.from(list);
  }, [tournaments]);

  const yearsList = useMemo(() => {
    const list = new Set(tournaments.map(t => t.year.toString()));
    return Array.from(list);
  }, [tournaments]);

  // Filtered Tournaments based on Sport and Year
  const filteredTournaments = useMemo(() => {
    return tournaments.filter(t => {
      if (selectedSport !== 'all' && t.sport_name !== selectedSport) return false;
      if (selectedYear !== 'all' && t.year.toString() !== selectedYear) return false;
      return true;
    });
  }, [tournaments, selectedSport, selectedYear]);

  // Automatically select the first available tournament when filters change or initially
  useMemo(() => {
    if (filteredTournaments.length > 0) {
      // If currently selected is not in the filtered list, change it
      const exists = filteredTournaments.some(t => t.id === selectedTournamentId);
      if (!exists) {
        setSelectedTournamentId(filteredTournaments[0].id);
      }
    } else {
      setSelectedTournamentId('');
    }
  }, [filteredTournaments, selectedTournamentId]);

  // Selected Tournament Object
  const selectedTournament = useMemo(() => {
    return tournaments.find(t => t.id === selectedTournamentId) || null;
  }, [tournaments, selectedTournamentId]);

  // Category list based on selected tournament
  const categoriesList = useMemo(() => {
    if (!selectedTournament) return [];
    // For this prototype, tournaments contain categories, or we can look up from teams
    const list = new Set<string>();
    list.add(selectedTournament.category);
    
    // Also look up from registered teams for any sub-categories if any
    teams.filter(t => t.tournament_id === selectedTournamentId).forEach(t => {
      if (t.category) list.add(t.category);
    });
    
    return Array.from(list);
  }, [selectedTournament, teams, selectedTournamentId]);

  // Set default category to 'all' or first category when tournament changes
  useMemo(() => {
    setSelectedCategory('all');
  }, [selectedTournamentId]);

  // Compute standings stats
  const standingsData = useMemo(() => {
    if (!selectedTournamentId) return [];
    return calculateStandings(selectedTournamentId, teams, matches);
  }, [selectedTournamentId, teams, matches]);

  const topScorersData = useMemo(() => {
    if (!selectedTournamentId) return [];
    return calculateTopScorers(selectedTournamentId, teams, players, events, matches);
  }, [selectedTournamentId, teams, players, events, matches]);

  const topAssistsData = useMemo(() => {
    if (!selectedTournamentId) return [];
    return calculateTopAssists(selectedTournamentId, teams, players, events, matches);
  }, [selectedTournamentId, teams, players, events, matches]);

  const cardsData = useMemo(() => {
    if (!selectedTournamentId) return [];
    return calculateCards(selectedTournamentId, teams, players, events, matches);
  }, [selectedTournamentId, teams, players, events, matches]);

  // Round list for Results tab
  const tournamentRounds = useMemo(() => {
    if (!selectedTournamentId) return [1];
    const tourMatches = matches.filter(m => m.tournament_id === selectedTournamentId);
    if (tourMatches.length === 0) return [1];
    const rounds = Array.from(new Set(tourMatches.map(m => m.round)));
    return (rounds as number[]).sort((a, b) => a - b);
  }, [selectedTournamentId, matches]);

  // Filtered matches for the selected round
  const roundMatches = useMemo(() => {
    if (!selectedTournamentId) return [];
    return matches.filter(m => m.tournament_id === selectedTournamentId && m.round === selectedRound);
  }, [selectedTournamentId, selectedRound, matches]);

  // Helper to get Team details
  const getTeamDetails = (teamId: string) => {
    return teams.find(t => t.id === teamId) || { name: 'Time Desconhecido', logo_url: '⚽️' };
  };

  return (
    <div id="public-standings-section" className="bg-[#0F1115] py-10 border-t border-[#2D3139]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#00FF87] bg-[#00FF87]/10 px-3 py-1 rounded-full uppercase tracking-wider">
            Portal Público
          </span>
          <h2 className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            Tabelas e Estatísticas em Tempo Real
          </h2>
          <p className="text-[#8E9299] mt-2 text-sm sm:text-base font-light">
            Consulte a classificação, artilharia, cartões e resultados de qualquer campeonato ativo em nosso sistema sem precisar de conta.
          </p>
        </div>

        {/* Master Filter Panel */}
        <div className="bg-[#16191F] rounded-2xl shadow-md border border-[#2D3139] p-5 mb-8">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2D3139] text-white font-semibold text-sm">
            <Filter className="w-4 h-4 text-[#00FF87]" />
            Filtrar Competições
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Sport Filter */}
            <div>
              <label className="block text-xs font-bold text-[#8E9299] uppercase mb-1.5">Modalidade</label>
              <select
                id="filter-sport"
                value={selectedSport}
                onChange={(e) => setSelectedSport(e.target.value)}
                className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-xl px-3 py-2 text-sm text-[#E4E7EB] font-medium focus:outline-none focus:ring-2 focus:ring-[#00FF87]/50 transition-all"
              >
                <option value="all">Todas as Modalidades</option>
                {sportsList.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-xs font-bold text-[#8E9299] uppercase mb-1.5">Ano</label>
              <select
                id="filter-year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-[#1A1D23] border border-[#2D3139] rounded-xl px-3 py-2 text-sm text-[#E4E7EB] font-medium focus:outline-none focus:ring-2 focus:ring-[#00FF87]/50 transition-all"
              >
                <option value="all">Todos os Anos</option>
                {yearsList.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Tournament Selector */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#8E9299] uppercase mb-1.5">Nome do Campeonato</label>
              <select
                id="filter-tournament"
                value={selectedTournamentId}
                onChange={(e) => setSelectedTournamentId(e.target.value)}
                className="w-full bg-[#1A1D23] border border-[#00FF87]/30 rounded-xl px-3 py-2 text-sm text-[#00FF87] font-semibold focus:outline-none focus:ring-2 focus:ring-[#00FF87]/50 transition-all"
              >
                {filteredTournaments.length === 0 ? (
                  <option value="">Nenhum campeonato encontrado</option>
                ) : (
                  filteredTournaments.map(t => (
                    <option key={t.id} value={t.id}>
                      🏆 {t.name} ({t.sport_name})
                    </option>
                  ))
                )}
              </select>
            </div>

          </div>

          {selectedTournament && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-[#1A1D23] p-3.5 rounded-xl border border-[#2D3139] text-xs text-[#8E9299]">
              <div className="flex flex-wrap gap-4 items-center">
                <span className="font-semibold text-slate-200">
                  Categoria: <span className="bg-[#16191F] px-2 py-0.5 rounded border border-[#2D3139] font-normal text-[#E4E7EB] ml-1">{selectedTournament.category}</span>
                </span>
                <span className="font-semibold text-slate-200">
                  Formato: <span className="bg-[#16191F] px-2 py-0.5 rounded border border-[#2D3139] font-normal text-[#E4E7EB] ml-1">
                    {selectedTournament.format === 'points_only' ? 'Pontos Corridos' : 'Fase de Grupos + Playoffs'}
                  </span>
                </span>
                <span className="font-semibold text-slate-200">
                  Arbitragem contratada: <span className="bg-[#16191F] px-2 py-0.5 rounded border border-[#2D3139] font-normal text-[#E4E7EB] ml-1">
                    {selectedTournament.has_referees ? 'Sim' : 'Não (Mesa ou Várzea)'}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${selectedTournament.status === 'active' ? 'bg-[#00FF87] animate-pulse' : 'bg-[#8E9299]'}`} />
                <span className="font-semibold capitalize text-white">Status: {selectedTournament.status === 'active' ? 'Ativo' : 'Finalizado'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Tournament Table Viewer */}
        {!selectedTournamentId ? (
          <div className="bg-[#16191F] rounded-2xl border border-[#2D3139] p-12 text-center text-[#8E9299] shadow-md">
            <Trophy className="w-12 h-12 text-[#2D3139] mx-auto mb-4" />
            <h3 className="font-bold text-lg text-white">Nenhum Campeonato Selecionado</h3>
            <p className="text-sm mt-1 max-w-sm mx-auto">Altere os filtros acima para listar os campeonatos disponíveis para exibição pública.</p>
          </div>
        ) : (
          <div className="bg-[#16191F] rounded-2xl border border-[#2D3139] shadow-md overflow-hidden">
            
            {/* Table Navigation Tabs */}
            <div className="flex flex-wrap bg-[#1A1D23] border-b border-[#2D3139] p-1.5 gap-1">
              <button
                id="tab-standings"
                onClick={() => setActiveTab('standings')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'standings' 
                    ? 'bg-[#16191F] text-[#00FF87] shadow-md' 
                    : 'text-[#8E9299] hover:text-white hover:bg-[#16191F]/50'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Classificação
              </button>
              
              <button
                id="tab-scorers"
                onClick={() => setActiveTab('scorers')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'scorers' 
                    ? 'bg-[#16191F] text-[#00FF87] shadow-md' 
                    : 'text-[#8E9299] hover:text-white hover:bg-[#16191F]/50'
                }`}
              >
                <Award className="w-4 h-4" />
                Artilharia
              </button>
              
              <button
                id="tab-assists"
                onClick={() => setActiveTab('assists')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'assists' 
                    ? 'bg-[#16191F] text-[#00FF87] shadow-md' 
                    : 'text-[#8E9299] hover:text-white hover:bg-[#16191F]/50'
                }`}
              >
                <Users className="w-4 h-4" />
                Assistências
              </button>

              <button
                id="tab-cards"
                onClick={() => setActiveTab('cards')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'cards' 
                    ? 'bg-[#16191F] text-[#00FF87] shadow-md' 
                    : 'text-[#8E9299] hover:text-white hover:bg-[#16191F]/50'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                Cartões
              </button>

              <button
                id="tab-results"
                onClick={() => setActiveTab('results')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'results' 
                    ? 'bg-[#16191F] text-[#00FF87] shadow-md' 
                    : 'text-[#8E9299] hover:text-white hover:bg-[#16191F]/50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Resultados / Rodadas
              </button>
            </div>

            {/* TAB CONTENT: STANDINGS */}
            {activeTab === 'standings' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#1A1D23] border-b border-[#2D3139] text-[#8E9299] text-xs font-bold uppercase">
                      <th className="px-5 py-3 w-16 text-center">Pos</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-3 py-3 text-center w-12 bg-[#00FF87]/5 text-[#00FF87]">P</th>
                      <th className="px-3 py-3 text-center w-12">J</th>
                      <th className="px-3 py-3 text-center w-12">V</th>
                      <th className="px-3 py-3 text-center w-12">E</th>
                      <th className="px-3 py-3 text-center w-12">D</th>
                      <th className="px-3 py-3 text-center w-14">GP</th>
                      <th className="px-3 py-3 text-center w-14">GC</th>
                      <th className="px-3 py-3 text-center w-14">SG</th>
                      <th className="px-4 py-3 text-center w-16 font-mono">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D3139]/40 text-sm">
                    {standingsData.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 text-center text-[#8E9299]">
                          Nenhum time inscrito ou partidas homologadas ainda.
                        </td>
                      </tr>
                    ) : (
                      standingsData.map((row, idx) => {
                        const isQualifier = idx < (selectedTournament?.num_qualifiers || 0);
                        return (
                          <tr key={row.teamId} className={`hover:bg-[#1A1D23]/30 transition-colors ${isQualifier ? 'bg-[#00FF87]/5' : ''}`}>
                            {/* Position indicator */}
                            <td className="px-5 py-3.5 text-center font-bold">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                                  idx === 0 ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500' :
                                  idx === 1 ? 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-400' :
                                  idx === 2 ? 'bg-orange-500/20 text-orange-400 ring-1 ring-orange-500' :
                                  isQualifier ? 'bg-[#00FF87]/20 text-[#00FF87] ring-1 ring-[#00FF87]/40' : 'bg-[#1A1D23] text-[#8E9299] border border-[#2D3139]'
                                }`}>
                                  {idx + 1}
                                </span>
                              </div>
                            </td>
                            {/* Team Name */}
                            <td className="px-4 py-3.5 font-semibold text-white">
                              <div className="flex items-center gap-2">
                                <span className="text-xl" role="img" aria-label="Team Logo">
                                  {row.teamLogo}
                                </span>
                                <span>{row.teamName}</span>
                                {isQualifier && (
                                  <span className="text-[10px] text-[#00FF87] bg-[#00FF87]/10 px-2 py-0.5 rounded-full font-semibold border border-[#00FF87]/20">
                                    Classificado
                                  </span>
                                )}
                              </div>
                            </td>
                            {/* Stats */}
                            <td className="px-3 py-3.5 text-center font-bold bg-[#00FF87]/5 text-[#00FF87] border-l border-r border-[#2D3139]">{row.points}</td>
                            <td className="px-3 py-3.5 text-center text-[#E4E7EB]">{row.played}</td>
                            <td className="px-3 py-3.5 text-center text-[#E4E7EB] font-medium">{row.won}</td>
                            <td className="px-3 py-3.5 text-center text-[#8E9299]">{row.drawn}</td>
                            <td className="px-3 py-3.5 text-center text-[#8E9299]">{row.lost}</td>
                            <td className="px-3 py-3.5 text-center text-[#E4E7EB]">{row.goalsFor}</td>
                            <td className="px-3 py-3.5 text-center text-[#E4E7EB]">{row.goalsAgainst}</td>
                            <td className={`px-3 py-3.5 text-center font-semibold ${row.goalsDifference > 0 ? 'text-[#00FF87]' : row.goalsDifference < 0 ? 'text-red-450' : 'text-[#8E9299]'}`}>
                              {row.goalsDifference > 0 ? `+${row.goalsDifference}` : row.goalsDifference}
                            </td>
                            <td className="px-4 py-3.5 text-center font-mono text-xs text-[#8E9299]">{row.efficiency}%</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
                
                {/* Qualifying Format Instruction Panel */}
                {selectedTournament && (
                  <div className="p-4 bg-[#1A1D23] border-t border-[#2D3139] flex items-start gap-2.5 text-xs text-[#8E9299]">
                    <Info className="w-4 h-4 text-[#8E9299] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-[#E4E7EB]">Regulamento deste Torneio:</p>
                      <p className="mt-0.5">
                        Os <span className="font-bold text-[#00FF87]">{selectedTournament.num_qualifiers} melhores colocados</span> avançam diretamente para a fase eliminatória de mata-mata. 
                        Vitória soma 3 pontos, empate soma 1 ponto, e derrota não pontua. Critérios de desempate: Pontos &gt; Vitórias &gt; Saldo de Gols &gt; Gols Pró.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: SCORERS */}
            {activeTab === 'scorers' && (
              <div className="p-4">
                <h3 className="font-bold text-white text-sm mb-3">Tabela de Artilheiros (Gols Marcados)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#2D3139] text-[#8E9299] text-xs font-bold uppercase bg-[#1A1D23]">
                        <th className="px-4 py-2 text-center w-16">Rank</th>
                        <th className="px-4 py-2">Jogador</th>
                        <th className="px-4 py-2">Clube</th>
                        <th className="px-4 py-2 text-center w-24 text-[#00FF87] font-bold">Gols</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D3139]/40 text-sm">
                      {topScorersData.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#8E9299]">
                            Nenhum gol registrado no torneio até o momento.
                          </td>
                        </tr>
                      ) : (
                        topScorersData.map((scorer, index) => (
                          <tr key={scorer.playerId} className="hover:bg-[#1A1D23]/30 transition-colors">
                            <td className="px-4 py-3.5 text-center font-bold text-[#8E9299]">{index + 1}º</td>
                            <td className="px-4 py-3.5 font-semibold text-white">{scorer.playerName}</td>
                            <td className="px-4 py-3.5 text-[#E4E7EB]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg">{scorer.teamLogo}</span>
                                <span>{scorer.teamName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center font-extrabold text-[#00FF87] text-base bg-[#00FF87]/5">{scorer.goals}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ASSISTS */}
            {activeTab === 'assists' && (
              <div className="p-4">
                <h3 className="font-bold text-white text-sm mb-3">Ranking de Assistências</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#2D3139] text-[#8E9299] text-xs font-bold uppercase bg-[#1A1D23]">
                        <th className="px-4 py-2 text-center w-16">Rank</th>
                        <th className="px-4 py-2">Jogador</th>
                        <th className="px-4 py-2">Clube</th>
                        <th className="px-4 py-2 text-center w-28 text-[#00D1FF] font-bold">Assistências</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D3139]/40 text-sm">
                      {topAssistsData.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-[#8E9299]">
                            Nenhuma assistência registrada no torneio até o momento.
                          </td>
                        </tr>
                      ) : (
                        topAssistsData.map((assist, index) => (
                          <tr key={assist.playerId} className="hover:bg-[#1A1D23]/30 transition-colors">
                            <td className="px-4 py-3.5 text-center font-bold text-[#8E9299]">{index + 1}º</td>
                            <td className="px-4 py-3.5 font-semibold text-white">{assist.playerName}</td>
                            <td className="px-4 py-3.5 text-[#E4E7EB]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg">{assist.teamLogo}</span>
                                <span>{assist.teamName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center font-extrabold text-[#00D1FF] text-base bg-[#00D1FF]/5">{assist.assists}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: CARDS */}
            {activeTab === 'cards' && (
              <div className="p-4">
                <h3 className="font-bold text-white text-sm mb-3">Cartões Amarelos e Vermelhos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#2D3139] text-[#8E9299] text-xs font-bold uppercase bg-[#1A1D23]">
                        <th className="px-4 py-2 text-center w-16">Rank</th>
                        <th className="px-4 py-2">Jogador</th>
                        <th className="px-4 py-2">Clube</th>
                        <th className="px-4 py-2 text-center w-24 text-amber-400">Amarelo</th>
                        <th className="px-4 py-2 text-center w-24 text-red-500">Vermelho</th>
                        <th className="px-4 py-2 text-center w-24 font-bold text-[#E4E7EB]">Pontuação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D3139]/40 text-sm">
                      {cardsData.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-[#8E9299]">
                            Nenhum cartão disciplinar distribuído até o momento.
                          </td>
                        </tr>
                      ) : (
                        cardsData.map((card, index) => (
                          <tr key={card.playerId} className="hover:bg-[#1A1D23]/30 transition-colors">
                            <td className="px-4 py-3.5 text-center font-bold text-[#8E9299]">{index + 1}º</td>
                            <td className="px-4 py-3.5 font-semibold text-white">{card.playerName}</td>
                            <td className="px-4 py-3.5 text-[#E4E7EB]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-lg">{card.teamLogo}</span>
                                <span>{card.teamName}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-8 bg-amber-400/20 border border-amber-400/50 rounded text-amber-400 font-extrabold text-xs shadow-sm">
                                {card.yellowCards}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <span className="inline-flex items-center justify-center w-6 h-8 bg-red-600/20 border border-red-500/50 rounded text-red-400 font-extrabold text-xs shadow-sm">
                                {card.redCards}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-center font-mono text-[#8E9299] text-xs bg-[#1A1D23]/50">
                              {card.redCards * 3 + card.yellowCards} pts
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: RESULTS / ROUNDS */}
            {activeTab === 'results' && (
              <div className="p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h3 className="font-bold text-white text-sm">Controle de Rodadas</h3>
                    <p className="text-xs text-[#8E9299]">Selecione uma das rodadas para ver os placares e súmulas.</p>
                  </div>
                  
                  {/* Round selection buttons */}
                  <div className="flex flex-wrap gap-1 bg-[#1A1D23] p-1 rounded-xl border border-[#2D3139]">
                    {tournamentRounds.map(r => (
                      <button
                        key={r}
                        onClick={() => setSelectedRound(r)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          selectedRound === r 
                            ? 'bg-[#16191F] text-[#00FF87] shadow-sm' 
                            : 'text-[#8E9299] hover:text-white'
                        }`}
                      >
                        Rodada {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Matches layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roundMatches.length === 0 ? (
                    <div className="md:col-span-2 text-center py-10 text-[#8E9299] text-sm">
                      Nenhuma partida agendada para esta rodada.
                    </div>
                  ) : (
                    roundMatches.map(m => {
                      const home = getTeamDetails(m.home_team_id);
                      const away = getTeamDetails(m.away_team_id);
                      
                      return (
                        <div key={m.id} className="bg-[#1A1D23] border border-[#2D3139] rounded-2xl p-4 flex flex-col justify-between hover:border-[#00FF87]/30 transition-all shadow-md">
                          {/* Match Header */}
                          <div className="flex items-center justify-between text-[11px] text-[#8E9299] pb-2 border-b border-[#2D3139]/60 mb-3">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{m.date} às {m.time}</span>
                            </div>
                            <span className="font-semibold text-slate-200">{m.location}</span>
                          </div>

                          {/* Teams Grid */}
                          <div className="grid grid-cols-7 items-center justify-items-center mb-4">
                            {/* Home */}
                            <div className="col-span-3 text-center">
                              <span className="text-3xl block mb-1" role="img">{home.logo_url}</span>
                              <span className="font-bold text-xs sm:text-sm text-white line-clamp-1">{home.name}</span>
                            </div>

                            {/* Scoreboard or VS */}
                            <div className="col-span-1 flex items-center justify-center font-mono">
                              {m.status === 'scheduled' ? (
                                <span className="bg-[#16191F] border border-[#2D3139] text-[#8E9299] text-[10px] font-bold px-2 py-1 rounded-full uppercase">VS</span>
                              ) : (
                                <div className="flex items-center gap-1.5 text-lg font-extrabold text-[#00FF87] bg-[#16191F] border border-[#2D3139] px-3 py-1.5 rounded-lg shadow-md">
                                  <span>{m.score_home}</span>
                                  <span className="text-[#8E9299] text-xs">-</span>
                                  <span>{m.score_away}</span>
                                </div>
                              )}
                            </div>

                            {/* Away */}
                            <div className="col-span-3 text-center">
                              <span className="text-3xl block mb-1" role="img">{away.logo_url}</span>
                              <span className="font-bold text-xs sm:text-sm text-white line-clamp-1">{away.name}</span>
                            </div>
                          </div>

                          {/* Match Footer Status info */}
                          <div className="pt-2.5 border-t border-[#2D3139]/60 flex items-center justify-between text-xs">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              m.status === 'approved' 
                                ? 'bg-[#00FF87]/10 text-[#00FF87]' 
                                : m.status === 'awaiting_approval'
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'bg-[#16191F] text-[#8E9299] border border-[#2D3139]'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'approved' ? 'bg-[#00FF87]' : m.status === 'awaiting_approval' ? 'bg-amber-400' : 'bg-[#8E9299]'}`} />
                              {m.status === 'approved' ? 'Resultado Homologado' : m.status === 'awaiting_approval' ? 'Súmula em Análise' : 'Partida Agendada'}
                            </span>
                            
                            {m.status === 'approved' && (
                              <div className="flex gap-1 items-center">
                                {/* Referee rating if provided */}
                                {m.referee_rating_by_organizer && (
                                  <div className="flex items-center gap-0.5 text-amber-400" title="Avaliação do Árbitro">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span className="text-[10px] font-bold">{m.referee_rating_by_organizer}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
