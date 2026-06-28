/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tournament, Team, Player, Match, MatchEvent, UserProfile, Invitation } from '../types';

export const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'org_pedro',
    email: 'pedro@auroratech.com',
    password: 'Admin1234',
    name: 'Pedro (Aurora Tech)',
    role: 'organizer',
    phone: '(11) 99283-5438',
    subscriptionStatus: 'active',
    subscriptionPlan: 'plan_3000',
    subscriptionExpiresAt: '2027-12-31',
    tournamentsPaidCount: 0
  },
  {
    id: 'org_1',
    email: 'organizador@torneio.com',
    password: '123',
    name: 'Carlos Silva (Organizador)',
    role: 'organizer',
    phone: '(11) 99999-1111',
    subscriptionStatus: 'active',
    subscriptionPlan: 'plan_3000',
    subscriptionExpiresAt: '2026-12-31',
    tournamentsPaidCount: 1
  },
  {
    id: 'ref_1',
    email: 'juiz_marcos@ref.com',
    password: '123',
    name: 'Marcos Oliveira (Árbitro)',
    role: 'referee',
    phone: '(11) 99999-2222'
  },
  {
    id: 'ref_2',
    email: 'juiz_roberto@ref.com',
    password: '123',
    name: 'Roberto Souza (Árbitro)',
    role: 'referee',
    phone: '(11) 99999-2233'
  },
  {
    id: 'owner_home',
    email: 'dono_flamengo@time.com',
    password: '123',
    name: 'Ricardo Gomes (Dono do Mengão FC)',
    role: 'team_owner',
    phone: '(11) 99999-3333'
  },
  {
    id: 'owner_away',
    email: 'dono_palmeiras@time.com',
    password: '123',
    name: 'Sandro Silva (Dono do Verdão FC)',
    role: 'team_owner',
    phone: '(11) 99999-4444'
  }
];

export const INITIAL_TOURNAMENTS: Tournament[] = [
  {
    id: 'tour_1',
    name: 'Copa Metropolitana de Futebol 2026',
    sport_name: 'Futebol de Campo',
    category: 'Adulto Livre',
    year: 2026,
    format: 'points_and_playoffs' as any, // fallback
    has_referees: true,
    status: 'active',
    creator_id: 'org_pedro',
    num_qualifiers: 4,
    logo_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=120',
    created_at: '2026-01-15'
  },
  {
    id: 'tour_2',
    name: 'Campeonato Futsal Sub-17 Paulista',
    sport_name: 'Futsal',
    category: 'Sub-17',
    year: 2026,
    format: 'points_only',
    has_referees: true,
    status: 'active',
    creator_id: 'org_pedro',
    num_qualifiers: 2,
    logo_url: 'https://images.unsplash.com/photo-1518063319789-7217e6706b04?auto=format&fit=crop&q=80&w=120',
    created_at: '2026-02-10'
  },
  {
    id: 'tour_3',
    name: 'Copa de Futebol Society Master',
    sport_name: 'Futebol Society',
    category: 'Master 40+',
    year: 2025,
    format: 'points_only',
    has_referees: false, // Sem arbitragem contratada para demonstrar o fluxo de criação sem arbitragem
    status: 'completed',
    creator_id: 'org_pedro',
    num_qualifiers: 1,
    logo_url: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&q=80&w=120',
    created_at: '2025-05-01'
  }
];

export const INITIAL_TEAMS: Team[] = [
  // Tour 1 Teams (Copa Metropolitana)
  {
    id: 'team_1',
    tournament_id: 'tour_1',
    name: 'Mengão FC',
    logo_url: '🔴⚫️',
    owner_id: 'owner_home',
    category: 'Adulto Livre',
    status: 'accepted'
  },
  {
    id: 'team_2',
    tournament_id: 'tour_1',
    name: 'Verdão FC',
    logo_url: '🟢⚪️',
    owner_id: 'owner_away',
    category: 'Adulto Livre',
    status: 'accepted'
  },
  {
    id: 'team_3',
    tournament_id: 'tour_1',
    name: 'Tricolor FC',
    logo_url: '🔴⚪️⚫️',
    owner_id: 'other_owner_1',
    category: 'Adulto Livre',
    status: 'accepted'
  },
  {
    id: 'team_4',
    tournament_id: 'tour_1',
    name: 'Alvinegro FC',
    logo_url: '⚫️⚪️',
    owner_id: 'other_owner_2',
    category: 'Adulto Livre',
    status: 'accepted'
  }
];

export const INITIAL_PLAYERS: Player[] = [
  // Mengão FC (Team 1)
  {
    id: 'play_1',
    team_id: 'team_1',
    name: 'Gabigol de Souza',
    cpf: '123.456.789-00',
    birth_date: '1996-08-30',
    photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=80',
    validation_status: 'valid'
  },
  {
    id: 'play_2',
    team_id: 'team_1',
    name: 'Bruno Henrique Alves',
    cpf: '234.567.890-11',
    birth_date: '1990-12-30',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80',
    validation_status: 'valid'
  },
  {
    id: 'play_3',
    team_id: 'team_1',
    name: 'Arrascaeta Silva',
    cpf: '345.678.901-22',
    birth_date: '1994-06-01',
    photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=80',
    validation_status: 'valid'
  },
  // Verdão FC (Team 2)
  {
    id: 'play_4',
    team_id: 'team_2',
    name: 'Rony Rústico',
    cpf: '456.789.012-33',
    birth_date: '1995-05-11',
    photo_url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=80',
    validation_status: 'valid'
  },
  {
    id: 'play_5',
    team_id: 'team_2',
    name: 'Raphael Veiga',
    cpf: '567.890.123-44',
    birth_date: '1995-06-19',
    photo_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=80',
    validation_status: 'valid'
  },
  {
    id: 'play_6',
    team_id: 'team_2',
    name: 'Estevão Willian (Gato)', // Invalid athlete to demonstrate CPF block!
    cpf: '000.000.000-99', // Invalid CPF pattern
    birth_date: '2007-04-24',
    photo_url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=80',
    validation_status: 'invalid',
    validation_notes: 'CPF não correspondente à Receita Federal ou Data de Nascimento inválida para a categoria.'
  },
  // Tricolor FC (Team 3)
  {
    id: 'play_7',
    team_id: 'team_3',
    name: 'Lucas Moura Cruz',
    cpf: '678.901.234-55',
    birth_date: '1992-08-13',
    photo_url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=80',
    validation_status: 'valid'
  },
  {
    id: 'play_8',
    team_id: 'team_3',
    name: 'Calleri Gol',
    cpf: '789.012.345-66',
    birth_date: '1993-09-23',
    photo_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=80',
    validation_status: 'valid'
  }
];

export const INITIAL_MATCHES: Match[] = [
  // Tour 1 Matches
  {
    id: 'match_1',
    tournament_id: 'tour_1',
    home_team_id: 'team_1',
    away_team_id: 'team_2',
    round: 1,
    date: '2026-06-20',
    time: '16:00',
    location: 'Estádio Arena Central',
    referee_id: 'ref_1',
    assistant_1_id: 'Assistente 1',
    assistant_2_id: 'Assistente 2',
    fourth_referee_id: 'Quarto Árbitro',
    score_home: 2,
    score_away: 1,
    status: 'approved',
    sumula_written: true,
    home_approved: true,
    away_approved: true,
    organizer_approved: true,
    referee_rating_by_organizer: 5,
    referee_rating_by_home: 4,
    referee_rating_by_away: 3,
    field_rating_by_home: 5,
    field_rating_by_away: 4
  },
  {
    id: 'match_2',
    tournament_id: 'tour_1',
    home_team_id: 'team_3',
    away_team_id: 'team_4',
    round: 1,
    date: '2026-06-21',
    time: '18:00',
    location: 'Estádio Arena Central',
    referee_id: 'ref_2',
    score_home: 0,
    score_away: 0,
    status: 'approved',
    sumula_written: true,
    home_approved: true,
    away_approved: true,
    organizer_approved: true
  },
  {
    // A Match awaiting approval from teams
    id: 'match_3',
    tournament_id: 'tour_1',
    home_team_id: 'team_1', // Mengão FC
    away_team_id: 'team_3', // Tricolor FC
    round: 2,
    date: '2026-06-24',
    time: '15:30',
    location: 'Campo da Vila Real',
    referee_id: 'ref_1',
    score_home: 3,
    score_away: 2,
    status: 'awaiting_approval',
    sumula_written: true,
    home_approved: false, // Needs Mengão owner (Ricardo) to approve
    away_approved: false, // Needs Tricolor owner to approve
    organizer_approved: false
  },
  {
    // Scheduled match that referee can fill sumula
    id: 'match_4',
    tournament_id: 'tour_1',
    home_team_id: 'team_2', // Verdão FC
    away_team_id: 'team_4', // Alvinegro FC
    round: 2,
    date: '2026-06-27',
    time: '10:00',
    location: 'Campo da Vila Real',
    referee_id: 'ref_1', // Assigned to referee Marcos
    status: 'scheduled',
    sumula_written: false,
    home_approved: false,
    away_approved: false,
    organizer_approved: false
  }
];

export const INITIAL_EVENTS: MatchEvent[] = [
  // Events for Match 1 (Mengão 2x1 Verdão)
  {
    id: 'ev_1',
    match_id: 'match_1',
    type: 'goal',
    player_id: 'play_1', // Gabigol
    team_id: 'team_1',
    minute: 12
  },
  {
    id: 'ev_2',
    match_id: 'match_1',
    type: 'assist',
    player_id: 'play_3', // Arrascaeta
    team_id: 'team_1',
    minute: 12
  },
  {
    id: 'ev_3',
    match_id: 'match_1',
    type: 'goal',
    player_id: 'play_5', // Raphael Veiga
    team_id: 'team_2',
    minute: 45
  },
  {
    id: 'ev_4',
    match_id: 'match_1',
    type: 'goal',
    player_id: 'play_1', // Gabigol
    team_id: 'team_1',
    minute: 88
  },
  {
    id: 'ev_5',
    match_id: 'match_1',
    type: 'assist',
    player_id: 'play_2', // Bruno Henrique
    team_id: 'team_1',
    minute: 88
  },
  {
    id: 'ev_6',
    match_id: 'match_1',
    type: 'yellow_card',
    player_id: 'play_4', // Rony
    team_id: 'team_2',
    minute: 60
  },
  {
    id: 'ev_7',
    match_id: 'match_1',
    type: 'yellow_card',
    player_id: 'play_2', // Bruno Henrique
    team_id: 'team_1',
    minute: 72
  },

  // Events for Match 3 (Mengão 3x2 Tricolor) awaiting approval
  {
    id: 'ev_8',
    match_id: 'match_3',
    type: 'goal',
    player_id: 'play_1', // Gabigol
    team_id: 'team_1',
    minute: 4
  },
  {
    id: 'ev_9',
    match_id: 'match_3',
    type: 'goal',
    player_id: 'play_8', // Calleri
    team_id: 'team_3',
    minute: 22
  },
  {
    id: 'ev_10',
    match_id: 'match_3',
    type: 'goal',
    player_id: 'play_2', // Bruno Henrique
    team_id: 'team_1',
    minute: 55
  },
  {
    id: 'ev_11',
    match_id: 'match_3',
    type: 'goal',
    player_id: 'play_7', // Lucas Moura
    team_id: 'team_3',
    minute: 70
  },
  {
    id: 'ev_12',
    match_id: 'match_3',
    type: 'goal',
    player_id: 'play_1', // Gabigol
    team_id: 'team_1',
    minute: 90
  },
  {
    id: 'ev_13',
    match_id: 'match_3',
    type: 'red_card',
    player_id: 'play_7', // Lucas Moura
    team_id: 'team_3',
    minute: 85
  }
];

export const INITIAL_INVITATIONS: Invitation[] = [
  {
    id: 'inv_1',
    tournament_id: 'tour_1',
    email: 'outro_dono@time.com',
    role: 'team_owner',
    team_name: 'Galo da Colina FC',
    status: 'pending',
    created_at: '2026-06-24'
  },
  {
    id: 'inv_2',
    tournament_id: 'tour_1',
    email: 'juiz_marcos@ref.com',
    role: 'referee',
    status: 'accepted',
    created_at: '2026-06-10'
  }
];
