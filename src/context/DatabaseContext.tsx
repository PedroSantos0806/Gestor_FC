/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Tournament, Team, Player, Match, MatchEvent, UserProfile, Invitation, UserRole,
  PLANS_INFO, SINGLE_TOURNAMENT_PAYMENT
} from '../types';
import { 
  INITIAL_PROFILES, INITIAL_TOURNAMENTS, INITIAL_TEAMS, 
  INITIAL_PLAYERS, INITIAL_MATCHES, INITIAL_EVENTS, INITIAL_INVITATIONS 
} from '../data/mockData';

interface DatabaseContextType {
  profiles: UserProfile[];
  tournaments: Tournament[];
  teams: Team[];
  players: Player[];
  matches: Match[];
  events: MatchEvent[];
  invitations: Invitation[];
  currentUser: UserProfile | null;
  supabaseConfig: { url: string; anonKey: string; connected: boolean };
  
  // Actions
  loginWithPassword: (email: string, password?: string) => { success: boolean; message: string };
  registerUser: (name: string, email: string, role: UserRole, password?: string) => { success: boolean; message: string };
  logout: () => void;
  switchRole: (role: UserRole) => void;
  createTournament: (tournament: Omit<Tournament, 'id' | 'creator_id' | 'created_at' | 'status'>) => Tournament;
  sendInvitation: (invitation: Omit<Invitation, 'id' | 'status' | 'created_at'>) => Invitation;
  respondInvitation: (id: string, status: 'accepted' | 'declined') => void;
  registerTeam: (team: Omit<Team, 'id' | 'status' | 'owner_id'>) => Team;
  registerPlayer: (player: Omit<Player, 'id' | 'validation_status'>, category: string) => { player: Player; isValid: boolean; errorNotes?: string };
  submitSumula: (matchId: string, scoreHome: number, scoreAway: number, matchEvents: Omit<MatchEvent, 'id'>[]) => void;
  approveSumula: (matchId: string, teamId: string) => void;
  organizerApproveMatch: (matchId: string) => void;
  rateReferee: (matchId: string, rating: number, role: 'organizer' | 'home' | 'away') => void;
  rateField: (matchId: string, rating: number, side: 'home' | 'away') => void;
  
  // SaaS Payment Actions
  subscribeSaaS: (planId: 'plan_80' | 'plan_300' | 'plan_1500' | 'plan_3000') => void;
  payTournamentFee: (tournamentId: string) => void;
  
  // DB Reset
  resetDatabase: () => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) throw new Error('useDatabase must be used within a DatabaseProvider');
  return context;
};

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Hardcoded credentials for showcase
  const [supabaseConfig] = useState({
    url: 'https://rknyiklwjrhlwjqrarpf.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', // Public key
    connected: true
  });

  // Load from LocalStorage or fallback to Mock Data
  useEffect(() => {
    const localProfiles = localStorage.getItem('fc_profiles');
    const localTournaments = localStorage.getItem('fc_tournaments');
    const localTeams = localStorage.getItem('fc_teams');
    const localPlayers = localStorage.getItem('fc_players');
    const localMatches = localStorage.getItem('fc_matches');
    const localEvents = localStorage.getItem('fc_events');
    const localInvitations = localStorage.getItem('fc_invitations');
    const localCurrentUser = localStorage.getItem('fc_current_user');

    if (localProfiles) {
      let parsedProfiles: UserProfile[] = JSON.parse(localProfiles);
      // Ensure pedro@auroratech.com always exists with plan_3000
      const hasPedro = parsedProfiles.some(p => p.email.toLowerCase() === 'pedro@auroratech.com');
      if (!hasPedro) {
        const pedroProfile: UserProfile = {
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
        };
        parsedProfiles = [pedroProfile, ...parsedProfiles];
      } else {
        parsedProfiles = parsedProfiles.map(p => {
          if (p.email.toLowerCase() === 'pedro@auroratech.com') {
            return {
              ...p,
              password: 'Admin1234',
              role: 'organizer' as const,
              subscriptionStatus: 'active' as const,
              subscriptionPlan: 'plan_3000' as const
            };
          }
          return p;
        });
      }
      
      setProfiles(parsedProfiles);
      let parsedTournaments: Tournament[] = JSON.parse(localTournaments || '[]');
      parsedTournaments = parsedTournaments.map(t => {
        if (t.creator_id === 'org_1') {
          return { ...t, creator_id: 'org_pedro' };
        }
        return t;
      });
      setTournaments(parsedTournaments);
      setTeams(JSON.parse(localTeams || '[]'));
      setPlayers(JSON.parse(localPlayers || '[]'));
      setMatches(JSON.parse(localMatches || '[]'));
      setEvents(JSON.parse(localEvents || '[]'));
      setInvitations(JSON.parse(localInvitations || '[]'));
      
      const loadedUser = localCurrentUser ? JSON.parse(localCurrentUser) : null;
      // If pedro was the previous user, ensure his roles and plans are active
      if (loadedUser && loadedUser.email.toLowerCase() === 'pedro@auroratech.com') {
        const updatedPedro = parsedProfiles.find(p => p.email.toLowerCase() === 'pedro@auroratech.com') || loadedUser;
        setCurrentUser(updatedPedro);
      } else {
        setCurrentUser(loadedUser);
      }
      
      localStorage.setItem('fc_profiles', JSON.stringify(parsedProfiles));
    } else {
      // First time initialization
      setProfiles(INITIAL_PROFILES);
      setTournaments(INITIAL_TOURNAMENTS);
      setTeams(INITIAL_TEAMS);
      setPlayers(INITIAL_PLAYERS);
      setMatches(INITIAL_MATCHES);
      setEvents(INITIAL_EVENTS);
      setInvitations(INITIAL_INVITATIONS);
      setCurrentUser(INITIAL_PROFILES[0]); // Pedro (Aurora Tech) is INITIAL_PROFILES[0]
      
      saveToLocal(
        INITIAL_PROFILES,
        INITIAL_TOURNAMENTS,
        INITIAL_TEAMS,
        INITIAL_PLAYERS,
        INITIAL_MATCHES,
        INITIAL_EVENTS,
        INITIAL_INVITATIONS,
        INITIAL_PROFILES[0]
      );
    }
  }, []);

  const saveToLocal = (
    p: UserProfile[], t: Tournament[], tm: Team[], pl: Player[], m: Match[], e: MatchEvent[], inv: Invitation[], u: UserProfile | null
  ) => {
    localStorage.setItem('fc_profiles', JSON.stringify(p));
    localStorage.setItem('fc_tournaments', JSON.stringify(t));
    localStorage.setItem('fc_teams', JSON.stringify(tm));
    localStorage.setItem('fc_players', JSON.stringify(pl));
    localStorage.setItem('fc_matches', JSON.stringify(m));
    localStorage.setItem('fc_events', JSON.stringify(e));
    localStorage.setItem('fc_invitations', JSON.stringify(inv));
    localStorage.setItem('fc_current_user', JSON.stringify(u));
  };

  // Helper to trigger save with current state values
  const persist = (
    updatedProfiles = profiles,
    updatedTournaments = tournaments,
    updatedTeams = teams,
    updatedPlayers = players,
    updatedMatches = matches,
    updatedEvents = events,
    updatedInvitations = invitations,
    updatedUser = currentUser
  ) => {
    saveToLocal(updatedProfiles, updatedTournaments, updatedTeams, updatedPlayers, updatedMatches, updatedEvents, updatedInvitations, updatedUser);
  };

  // Professional Email & Password Auth System
  const loginWithPassword = (email: string, password?: string): { success: boolean; message: string } => {
    const found = profiles.find(p => p.email.toLowerCase() === email.trim().toLowerCase());
    if (!found) {
      return { success: false, message: 'Usuário não cadastrado. Cadastre uma nova conta.' };
    }
    const expectedPassword = found.password || '123';
    if (password && expectedPassword !== password) {
      return { success: false, message: 'Senha incorreta. Verifique suas credenciais.' };
    }
    setCurrentUser(found);
    persist(profiles, tournaments, teams, players, matches, events, invitations, found);
    return { success: true, message: 'Login realizado com sucesso!' };
  };

  const registerUser = (name: string, email: string, role: UserRole, password?: string): { success: boolean; message: string } => {
    const emailLower = email.trim().toLowerCase();
    const exists = profiles.some(p => p.email.toLowerCase() === emailLower);
    if (exists) {
      return { success: false, message: 'Este e-mail já está em uso por outro usuário.' };
    }

    const newProfile: UserProfile = {
      id: 'usr_' + Date.now(),
      email: emailLower,
      password: password || '123',
      name: name.trim(),
      role,
      subscriptionStatus: 'inactive'
    };

    const updated = [...profiles, newProfile];
    setProfiles(updated);
    setCurrentUser(newProfile);
    persist(updated, tournaments, teams, players, matches, events, invitations, newProfile);
    return { success: true, message: 'Cadastro realizado com sucesso!' };
  };

  const logout = () => {
    setCurrentUser(null);
    persist(profiles, tournaments, teams, players, matches, events, invitations, null);
  };

  const switchRole = (role: UserRole) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, role };
    const updatedProfiles = profiles.map(p => p.id === currentUser.id ? updatedUser : p);
    setProfiles(updatedProfiles);
    setCurrentUser(updatedUser);
    persist(updatedProfiles, tournaments, teams, players, matches, events, invitations, updatedUser);
  };

  const createTournament = (tournamentData: Omit<Tournament, 'id' | 'creator_id' | 'created_at' | 'status'>) => {
    if (!currentUser) throw new Error('Not authenticated');
    
    // SaaS Plan limits check:
    const myExistingTournaments = tournaments.filter(t => t.creator_id === currentUser.id);
    const plan = currentUser.subscriptionPlan || 'plan_80';
    const isBasicPlan = plan === 'plan_80';

    if (isBasicPlan && myExistingTournaments.length >= 1) {
      throw new Error('Limite Excedido: O plano de Campeonato Único (R$ 80) permite criar apenas 1 campeonato. Faça upgrade para os planos corporativos para liberar torneios adicionais.');
    }
    
    // R$ 80 allows points_only format with no automated referees/súmula online
    const finalFormat = isBasicPlan ? 'points_only' : tournamentData.format;
    const finalHasReferees = isBasicPlan ? false : tournamentData.has_referees;

    const newTournament: Tournament = {
      ...tournamentData,
      format: finalFormat,
      has_referees: finalHasReferees,
      id: 'tour_' + Date.now(),
      creator_id: currentUser.id,
      status: 'active', // starts active
      created_at: new Date().toISOString().split('T')[0]
    };

    // Auto-deduct or register pricing
    const isFirstTournament = myExistingTournaments.length === 0;
    const updatedUser = {
      ...currentUser,
      tournamentsPaidCount: (currentUser.tournamentsPaidCount || 0) + (isFirstTournament ? 0 : 1)
    };

    const updatedTournaments = [...tournaments, newTournament];
    const updatedProfiles = profiles.map(p => p.id === currentUser.id ? updatedUser : p);
    
    setTournaments(updatedTournaments);
    setProfiles(updatedProfiles);
    setCurrentUser(updatedUser);
    
    // Automatically generate double round-robin matches for teams when they join, or pre-create placeholder matches
    persist(updatedProfiles, updatedTournaments, teams, players, matches, events, invitations, updatedUser);
    return newTournament;
  };

  const sendInvitation = (invitationData: Omit<Invitation, 'id' | 'status' | 'created_at'>) => {
    const newInv: Invitation = {
      ...invitationData,
      id: 'inv_' + Date.now(),
      status: 'pending',
      created_at: new Date().toISOString().split('T')[0]
    };
    
    // Check if the invited person already exists in profiles. If not, auto-create a profile to make the simulation seamless
    let updatedProfiles = [...profiles];
    const userExists = profiles.some(p => p.email.toLowerCase() === invitationData.email.toLowerCase());
    if (!userExists) {
      updatedProfiles.push({
        id: 'usr_' + Date.now() + '_auto',
        email: invitationData.email,
        name: invitationData.team_name || invitationData.email.split('@')[0],
        role: invitationData.role
      });
    }

    const updatedInvitations = [...invitations, newInv];
    setInvitations(updatedInvitations);
    setProfiles(updatedProfiles);
    persist(updatedProfiles, tournaments, teams, players, matches, events, updatedInvitations);
    return newInv;
  };

  const respondInvitation = (id: string, status: 'accepted' | 'declined') => {
    const updatedInvitations = invitations.map(inv => inv.id === id ? { ...inv, status } : inv);
    setInvitations(updatedInvitations);
    
    const invitation = invitations.find(inv => inv.id === id);
    if (invitation && status === 'accepted' && currentUser) {
      if (invitation.role === 'team_owner') {
        // Auto-register team
        const newTeam: Team = {
          id: 'team_' + Date.now(),
          tournament_id: invitation.tournament_id,
          name: invitation.team_name || 'Meu Time FC',
          logo_url: '⚽️',
          owner_id: currentUser.id,
          category: 'Adulto Livre', // default
          status: 'accepted'
        };
        const updatedTeams = [...teams, newTeam];
        setTeams(updatedTeams);
        
        // Let's generate a match structure if tournament has enough teams (e.g., automatically schedule matches)
        generateSchedulesForTournament(invitation.tournament_id, updatedTeams);
      }
    }
    persist(profiles, tournaments, teams, players, matches, events, updatedInvitations);
  };

  // Helper to schedule matches when teams are added or registered
  const generateSchedulesForTournament = (tournamentId: string, currentTeams: Team[]) => {
    const tourTeams = currentTeams.filter(t => t.tournament_id === tournamentId && t.status === 'accepted');
    if (tourTeams.length < 2) return; // Need at least 2 teams

    // Clear existing matches for this tournament to generate a fresh calendar
    const otherMatches = matches.filter(m => m.tournament_id !== tournamentId);
    const newMatches: Match[] = [];

    // Simple Round Robin generator
    let matchCounter = 1;
    for (let i = 0; i < tourTeams.length; i++) {
      for (let j = i + 1; j < tourTeams.length; j++) {
        // Round 1
        newMatches.push({
          id: `match_${tournamentId}_${matchCounter++}`,
          tournament_id: tournamentId,
          home_team_id: tourTeams[i].id,
          away_team_id: tourTeams[j].id,
          round: 1,
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days from now
          time: '16:00',
          location: 'Arena Central de Esportes',
          referee_id: 'ref_1', // Assign default referee marcos
          status: 'scheduled',
          sumula_written: false,
          home_approved: false,
          away_approved: false,
          organizer_approved: false
        });

        // Round 2 (Return match)
        newMatches.push({
          id: `match_${tournamentId}_${matchCounter++}`,
          tournament_id: tournamentId,
          home_team_id: tourTeams[j].id,
          away_team_id: tourTeams[i].id,
          round: 2,
          date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 9 days from now
          time: '18:00',
          location: 'Arena Central de Esportes',
          referee_id: 'ref_2', // Assign referee roberto
          status: 'scheduled',
          sumula_written: false,
          home_approved: false,
          away_approved: false,
          organizer_approved: false
        });
      }
    }

    const updatedMatches = [...otherMatches, ...newMatches];
    setMatches(updatedMatches);
    persist(profiles, tournaments, teams, players, updatedMatches, events, invitations);
  };

  const registerTeam = (teamData: Omit<Team, 'id' | 'status' | 'owner_id'>) => {
    if (!currentUser) throw new Error('Not authenticated');
    const newTeam: Team = {
      ...teamData,
      id: 'team_' + Date.now(),
      owner_id: currentUser.id,
      status: 'accepted'
    };
    const updatedTeams = [...teams, newTeam];
    setTeams(updatedTeams);
    generateSchedulesForTournament(teamData.tournament_id, updatedTeams);
    return newTeam;
  };

  const registerPlayer = (playerData: Omit<Player, 'id' | 'validation_status'>, tournamentCategory: string) => {
    // Government CPF verification mock-up check:
    // 1. Name cannot be blank or contain fake names
    // 2. CPF check: Must be a valid 11 digit format
    // 3. Category match check: If category is a youth category (e.g. Sub-17) and the birth year is too old, it blocks!
    let isValid = true;
    let errorNotes = '';

    const playerTeam = teams.find(t => t.id === playerData.team_id);
    const tournament = tournaments.find(t => t.id === playerTeam?.tournament_id);
    const creator = profiles.find(p => p.id === tournament?.creator_id);
    const creatorPlan = creator?.subscriptionPlan || 'plan_300'; // Default mock profiles are plan_300 or higher

    // Check if plan supports automatic CPF check (Requires plan_300, plan_1500 or plan_3000)
    const isBasicPlan = creatorPlan === 'plan_80';

    // Check 1: CPF Clean-up
    const cpfClean = playerData.cpf.replace(/\D/g, '');
    if (cpfClean.length !== 11) {
      isValid = false;
      errorNotes += 'CPF inválido: Deve possuir exatamente 11 dígitos numéricos. ';
    }
    if (/^(\d)\1{10}$/.test(cpfClean)) {
      isValid = false;
      errorNotes += 'CPF inválido: Sequência repetida de números. ';
    }

    // Check 2: Fake/Mock CPF Block
    if (cpfClean === '00000000099' || cpfClean === '12345678910') {
      isValid = false;
      errorNotes += 'CPF bloqueado pela Receita Federal: Cadastro inexistente ou irregular. ';
    }

    // Check 3: Age checking for Categories
    const birthYear = new Date(playerData.birth_date).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;

    if (tournamentCategory.toLowerCase().includes('sub-15') && age > 15) {
      isValid = false;
      errorNotes += `Idade (${age} anos) excede o limite máximo para a categoria Sub-15. `;
    } else if (tournamentCategory.toLowerCase().includes('sub-17') && age > 17) {
      isValid = false;
      errorNotes += `Idade (${age} anos) excede o limite máximo para a categoria Sub-17. `;
    } else if (tournamentCategory.toLowerCase().includes('master') && age < 40) {
      isValid = false;
      errorNotes += `Idade (${age} anos) é inferior ao mínimo de 40 anos exigido para a categoria Master. `;
    }

    // Determine validation status based on plan capability
    let finalStatus: 'pending' | 'valid' | 'invalid' = 'valid';
    if (!isValid) {
      finalStatus = 'invalid';
    } else if (isBasicPlan) {
      finalStatus = 'pending';
      errorNotes = '⚠️ Validação automática de CPF indisponível no plano de R$80 do organizador. Requer upgrade para SaaS Gold R$300/mês para consultar a Receita Federal.';
    }

    const newPlayer: Player = {
      ...playerData,
      id: 'play_' + Date.now(),
      validation_status: finalStatus,
      validation_notes: errorNotes ? errorNotes : undefined
    };

    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    persist(profiles, tournaments, teams, updatedPlayers, matches, events, invitations);
    
    return { player: newPlayer, isValid, errorNotes };
  };

  const submitSumula = (matchId: string, scoreHome: number, scoreAway: number, matchEvents: Omit<MatchEvent, 'id'>[]) => {
    // 1. Add all events
    const cleanEvents = events.filter(e => e.match_id !== matchId);
    const newEvents: MatchEvent[] = matchEvents.map((evt, i) => ({
      ...evt,
      id: `ev_${matchId}_${Date.now()}_${i}`
    }));
    
    const updatedEvents = [...cleanEvents, ...newEvents];
    setEvents(updatedEvents);

    // 2. Update Match
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          score_home: scoreHome,
          score_away: scoreAway,
          status: 'awaiting_approval' as const,
          sumula_written: true,
          home_approved: false,
          away_approved: false,
          organizer_approved: false
        };
      }
      return m;
    });

    setMatches(updatedMatches);
    persist(profiles, tournaments, teams, players, updatedMatches, updatedEvents, invitations);
  };

  const approveSumula = (matchId: string, teamId: string) => {
    const match = matches.find(m => m.id === matchId);
    if (!match) return;

    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        const isHome = m.home_team_id === teamId;
        const isAway = m.away_team_id === teamId;
        return {
          ...m,
          home_approved: isHome ? true : m.home_approved,
          away_approved: isAway ? true : m.away_approved,
        };
      }
      return m;
    });

    setMatches(updatedMatches);
    persist(profiles, tournaments, teams, players, updatedMatches, events, invitations);
  };

  const organizerApproveMatch = (matchId: string) => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          organizer_approved: true,
          status: 'approved' as const
        };
      }
      return m;
    });

    setMatches(updatedMatches);
    persist(profiles, tournaments, teams, players, updatedMatches, events, invitations);
  };

  const rateReferee = (matchId: string, rating: number, role: 'organizer' | 'home' | 'away') => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          referee_rating_by_organizer: role === 'organizer' ? rating : m.referee_rating_by_organizer,
          referee_rating_by_home: role === 'home' ? rating : m.referee_rating_by_home,
          referee_rating_by_away: role === 'away' ? rating : m.referee_rating_by_away,
        };
      }
      return m;
    });
    setMatches(updatedMatches);
    persist(profiles, tournaments, teams, players, updatedMatches, events, invitations);
  };

  const rateField = (matchId: string, rating: number, side: 'home' | 'away') => {
    const updatedMatches = matches.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          field_rating_by_home: side === 'home' ? rating : m.field_rating_by_home,
          field_rating_by_away: side === 'away' ? rating : m.field_rating_by_away,
        };
      }
      return m;
    });
    setMatches(updatedMatches);
    persist(profiles, tournaments, teams, players, updatedMatches, events, invitations);
  };

  const subscribeSaaS = (planId: 'plan_80' | 'plan_300' | 'plan_1500' | 'plan_3000') => {
    if (!currentUser) return;
    const expires = new Date();
    expires.setMonth(expires.getMonth() + 1);
    
    const updatedUser: UserProfile = {
      ...currentUser,
      subscriptionStatus: 'active',
      subscriptionPlan: planId,
      subscriptionExpiresAt: expires.toISOString().split('T')[0]
    };

    const updatedProfiles = profiles.map(p => p.id === currentUser.id ? updatedUser : p);
    setProfiles(updatedProfiles);
    setCurrentUser(updatedUser);
    persist(updatedProfiles, tournaments, teams, players, matches, events, invitations, updatedUser);
  };

  const payTournamentFee = (tournamentId: string) => {
    if (!currentUser) return;
    const updatedUser = {
      ...currentUser,
      tournamentsPaidCount: (currentUser.tournamentsPaidCount || 0) + 1
    };
    const updatedProfiles = profiles.map(p => p.id === currentUser.id ? updatedUser : p);
    setProfiles(updatedProfiles);
    setCurrentUser(updatedUser);
    persist(updatedProfiles, tournaments, teams, players, matches, events, invitations, updatedUser);
  };

  const resetDatabase = () => {
    localStorage.removeItem('fc_profiles');
    localStorage.removeItem('fc_tournaments');
    localStorage.removeItem('fc_teams');
    localStorage.removeItem('fc_players');
    localStorage.removeItem('fc_matches');
    localStorage.removeItem('fc_events');
    localStorage.removeItem('fc_invitations');
    localStorage.removeItem('fc_current_user');
    
    setProfiles(INITIAL_PROFILES);
    setTournaments(INITIAL_TOURNAMENTS);
    setTeams(INITIAL_TEAMS);
    setPlayers(INITIAL_PLAYERS);
    setMatches(INITIAL_MATCHES);
    setEvents(INITIAL_EVENTS);
    setInvitations(INITIAL_INVITATIONS);
    setCurrentUser(INITIAL_PROFILES[0]);
    
    saveToLocal(
      INITIAL_PROFILES,
      INITIAL_TOURNAMENTS,
      INITIAL_TEAMS,
      INITIAL_PLAYERS,
      INITIAL_MATCHES,
      INITIAL_EVENTS,
      INITIAL_INVITATIONS,
      INITIAL_PROFILES[0]
    );
  };

  return (
    <DatabaseContext.Provider value={{
      profiles,
      tournaments,
      teams,
      players,
      matches,
      events,
      invitations,
      currentUser,
      supabaseConfig,
      loginWithPassword,
      registerUser,
      logout,
      switchRole,
      createTournament,
      sendInvitation,
      respondInvitation,
      registerTeam,
      registerPlayer,
      submitSumula,
      approveSumula,
      organizerApproveMatch,
      rateReferee,
      rateField,
      subscribeSaaS,
      payTournamentFee,
      resetDatabase
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};
