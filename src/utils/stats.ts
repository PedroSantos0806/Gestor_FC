/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Match, Team, Player, MatchEvent } from '../types';

export interface StandingRow {
  teamId: string;
  teamName: string;
  teamLogo: string;
  points: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalsDifference: number;
  efficiency: number; // percentage
}

export interface ScorerRow {
  playerId: string;
  playerName: string;
  teamName: string;
  teamLogo: string;
  goals: number;
}

export interface AssistRow {
  playerId: string;
  playerName: string;
  teamName: string;
  teamLogo: string;
  assists: number;
}

export interface CardRow {
  playerId: string;
  playerName: string;
  teamName: string;
  teamLogo: string;
  yellowCards: number;
  redCards: number;
}

/**
 * Calculate full standing rows for a specific tournament.
 * Only 'approved' matches count.
 */
export function calculateStandings(tournamentId: string, teams: Team[], matches: Match[]): StandingRow[] {
  const tourTeams = teams.filter(t => t.tournament_id === tournamentId && t.status === 'accepted');
  const tourMatches = matches.filter(m => m.tournament_id === tournamentId && m.status === 'approved');

  const rows: { [teamId: string]: StandingRow } = {};

  // Initialize
  tourTeams.forEach(t => {
    rows[t.id] = {
      teamId: t.id,
      teamName: t.name,
      teamLogo: t.logo_url || '⚽️',
      points: 0,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalsDifference: 0,
      efficiency: 0
    };
  });

  // Calculate scores
  tourMatches.forEach(m => {
    const hId = m.home_team_id;
    const aId = m.away_team_id;
    const hScore = m.score_home ?? 0;
    const aScore = m.score_away ?? 0;

    if (!rows[hId] || !rows[aId]) return; // Guard against missing team records

    rows[hId].played += 1;
    rows[aId].played += 1;
    rows[hId].goalsFor += hScore;
    rows[hId].goalsAgainst += aScore;
    rows[aId].goalsFor += aScore;
    rows[aId].goalsAgainst += hScore;

    if (hScore > aScore) {
      rows[hId].points += 3;
      rows[hId].won += 1;
      rows[aId].lost += 1;
    } else if (aScore > hScore) {
      rows[aId].points += 3;
      rows[aId].won += 1;
      rows[hId].lost += 1;
    } else {
      rows[hId].points += 1;
      rows[aId].points += 1;
      rows[hId].drawn += 1;
      rows[aId].drawn += 1;
    }
  });

  // Final math updates
  return Object.values(rows).map(row => {
    row.goalsDifference = row.goalsFor - row.goalsAgainst;
    const maxPoints = row.played * 3;
    row.efficiency = maxPoints > 0 ? Math.round((row.points / maxPoints) * 100) : 0;
    return row;
  }).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.won !== a.won) return b.won - a.won;
    if (b.goalsDifference !== a.goalsDifference) return b.goalsDifference - a.goalsDifference;
    return b.goalsFor - a.goalsFor;
  });
}

/**
 * Calculates top scorers for a tournament
 */
export function calculateTopScorers(tournamentId: string, teams: Team[], players: Player[], events: MatchEvent[], matches: Match[]): ScorerRow[] {
  const approvedMatchIds = new Set(matches.filter(m => m.tournament_id === tournamentId && m.status === 'approved').map(m => m.id));
  const tourTeams = teams.filter(t => t.tournament_id === tournamentId);
  const teamMap = new Map(tourTeams.map(t => [t.id, t]));
  const playerMap = new Map(players.map(p => [p.id, p]));

  const goalCounts: { [playerId: string]: number } = {};

  events.forEach(e => {
    if (e.type === 'goal' && approvedMatchIds.has(e.match_id)) {
      goalCounts[e.player_id] = (goalCounts[e.player_id] || 0) + 1;
    }
  });

  return Object.entries(goalCounts)
    .map(([playerId, goals]) => {
      const player = playerMap.get(playerId);
      const team = player ? teamMap.get(player.team_id) : null;
      return {
        playerId,
        playerName: player ? player.name : 'Jogador Desconhecido',
        teamName: team ? team.name : 'Sem Time',
        teamLogo: team ? team.logo_url : '⚽️',
        goals
      };
    })
    .sort((a, b) => b.goals - a.goals);
}

/**
 * Calculates assists rankings
 */
export function calculateTopAssists(tournamentId: string, teams: Team[], players: Player[], events: MatchEvent[], matches: Match[]): AssistRow[] {
  const approvedMatchIds = new Set(matches.filter(m => m.tournament_id === tournamentId && m.status === 'approved').map(m => m.id));
  const tourTeams = teams.filter(t => t.tournament_id === tournamentId);
  const teamMap = new Map(tourTeams.map(t => [t.id, t]));
  const playerMap = new Map(players.map(p => [p.id, p]));

  const assistCounts: { [playerId: string]: number } = {};

  events.forEach(e => {
    if (e.type === 'assist' && approvedMatchIds.has(e.match_id)) {
      assistCounts[e.player_id] = (assistCounts[e.player_id] || 0) + 1;
    }
  });

  return Object.entries(assistCounts)
    .map(([playerId, assists]) => {
      const player = playerMap.get(playerId);
      const team = player ? teamMap.get(player.team_id) : null;
      return {
        playerId,
        playerName: player ? player.name : 'Jogador Desconhecido',
        teamName: team ? team.name : 'Sem Time',
        teamLogo: team ? team.logo_url : '⚽️',
        assists
      };
    })
    .sort((a, b) => b.assists - a.assists);
}

/**
 * Calculates card violations
 */
export function calculateCards(tournamentId: string, teams: Team[], players: Player[], events: MatchEvent[], matches: Match[]): CardRow[] {
  const approvedMatchIds = new Set(matches.filter(m => m.tournament_id === tournamentId && m.status === 'approved').map(m => m.id));
  const tourTeams = teams.filter(t => t.tournament_id === tournamentId);
  const teamMap = new Map(tourTeams.map(t => [t.id, t]));
  const playerMap = new Map(players.map(p => [p.id, p]));

  const cardCounts: { [playerId: string]: { yellow: number; red: number } } = {};

  events.forEach(e => {
    if (!approvedMatchIds.has(e.match_id)) return;

    if (e.type === 'yellow_card' || e.type === 'red_card') {
      if (!cardCounts[e.player_id]) {
        cardCounts[e.player_id] = { yellow: 0, red: 0 };
      }
      if (e.type === 'yellow_card') {
        cardCounts[e.player_id].yellow += 1;
      } else {
        cardCounts[e.player_id].red += 1;
      }
    }
  });

  return Object.entries(cardCounts)
    .map(([playerId, counts]) => {
      const player = playerMap.get(playerId);
      const team = player ? teamMap.get(player.team_id) : null;
      return {
        playerId,
        playerName: player ? player.name : 'Jogador Desconhecido',
        teamName: team ? team.name : 'Sem Time',
        teamLogo: team ? team.logo_url : '⚽️',
        yellowCards: counts.yellow,
        redCards: counts.red
      };
    })
    .sort((a, b) => (b.redCards * 3 + b.yellowCards) - (a.redCards * 3 + a.yellowCards));
}
