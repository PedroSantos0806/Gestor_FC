/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'organizer' | 'referee' | 'team_owner';

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  phone?: string;
  // SaaS Payment Info for organizers
  subscriptionStatus?: 'active' | 'inactive';
  subscriptionPlan?: 'plan_80' | 'plan_300' | 'plan_1500' | 'plan_3000';
  subscriptionExpiresAt?: string;
  tournamentsPaidCount?: number; // Tracks paid tournaments (first is free!)
}

export interface Tournament {
  id: string;
  name: string;
  sport_name: string; // e.g. Futebol de Campo, Futsal, Society
  category: string;    // e.g. Sub-15, Adulto, Master
  year: number;
  format: 'points_only' | 'groups_and_playoffs';
  has_referees: boolean;
  status: 'draft' | 'active' | 'completed';
  creator_id: string;
  num_qualifiers: number; // e.g., 4 qualify for semi-finals
  logo_url?: string;
  created_at: string;
  num_groups?: number;          // e.g. 4 groups
  teams_per_group?: number;     // e.g. 4 teams
  advancement_per_group?: number; // e.g. 2 advance from each group
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  logo_url: string;
  owner_id: string;
  category: string;
  status: 'pending' | 'accepted';
  group_name?: string; // e.g. 'Grupo A', 'Grupo B' for World Cup format
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  cpf: string;
  birth_date: string;
  photo_url?: string;
  validation_status: 'pending' | 'valid' | 'invalid';
  validation_notes?: string;
}

export interface Match {
  id: string;
  tournament_id: string;
  home_team_id: string;
  away_team_id: string;
  round: number;
  date: string;
  time: string;
  location: string; // Field name
  referee_id?: string;
  assistant_1_id?: string;
  assistant_2_id?: string;
  fourth_referee_id?: string;
  
  // Scores
  score_home?: number;
  score_away?: number;
  
  // Status flow: scheduled -> in_progress -> awaiting_approval -> approved
  status: 'scheduled' | 'in_progress' | 'awaiting_approval' | 'approved';
  
  // Match sheet approvals
  sumula_written: boolean;
  home_approved: boolean;
  away_approved: boolean;
  organizer_approved: boolean;

  // Ratings (1 to 5 stars)
  referee_rating_by_organizer?: number;
  referee_rating_by_home?: number;
  referee_rating_by_away?: number;
  
  field_rating_by_home?: number;
  field_rating_by_away?: number;
}

export interface MatchEvent {
  id: string;
  match_id: string;
  type: 'goal' | 'assist' | 'yellow_card' | 'red_card';
  player_id: string;
  team_id: string;
  minute: number;
}

export interface Invitation {
  id: string;
  tournament_id: string;
  email: string;
  role: 'referee' | 'team_owner';
  team_name?: string; // If inviting a team owner
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
}

// Payment packages info
export const PLANS_INFO = [
  {
    id: 'plan_80',
    name: 'Campeonato Único',
    price: 'R$ 80 / campeonato',
    description: 'Apenas um campeonato com tabela de classificação padrão',
    features: [
      '1 campeonato ativo',
      'Tabela de classificação inteligente',
      'Estatísticas básicas de jogos',
      '❌ Sem súmula online preenchida por árbitro',
      '❌ Sem avaliações de campos ou árbitros',
      '❌ Sem validação automática de CPF'
    ],
    link: 'https://mpago.la/2uzuD8e'
  },
  {
    id: 'plan_300',
    name: 'SaaS Gold',
    price: 'R$ 300 / mês',
    description: 'Súmula online oficial e validação de atletas de elite',
    features: [
      'Campeonatos simultâneos limitados',
      'Súmula online preenchida pelo árbitro',
      'Validação de CPF dos inscritos (Receita Federal)',
      'Avaliações de Juízes e de Campos de Jogo',
      'Suporte via e-mail e painel'
    ],
    link: 'https://mpago.la/1J1FJPp'
  },
  {
    id: 'plan_1500',
    name: 'SaaS Pro (Semestral)',
    price: 'R$ 1.500 / a cada 6 meses',
    description: 'Todos os recursos inclusos e opção de exportar dados',
    features: [
      'Todos os recursos do plano SaaS Gold',
      'Opção de exportar dados (Excel, CSV, JSON)',
      'Acesso semestral unificado (R$250/mês equivalente)',
      'Relatório analítico de atletas e cartões',
      'Suporte prioritário via WhatsApp'
    ],
    link: 'https://mpago.la/26XmcJN'
  },
  {
    id: 'plan_3000',
    name: 'League Master (Anual)',
    price: 'R$ 3.000 / por ano',
    description: 'SaaS ilimitado, benefícios completos e alertas via WhatsApp',
    features: [
      'Todos os benefícios do plano SaaS Pro',
      'Quantidade de campeonatos ILIMITADOS por ano',
      'Integração oficial com WhatsApp para alertas automáticos',
      'Suporte VIP 24h e assessoria da Aurora Tech'
    ],
    link: 'https://mpago.la/2WLyT5V'
  }
];

export const SINGLE_TOURNAMENT_PAYMENT = {
  price: 'R$ 80',
  link: 'https://mpago.la/2uzuD8e'
};
