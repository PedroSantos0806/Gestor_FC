/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { PLANS_INFO, SINGLE_TOURNAMENT_PAYMENT } from '../types';
import { 
  Trophy, Shield, Calendar, Users, Star, 
  CheckCircle, ArrowRight, Sparkles, CreditCard, ChevronRight 
} from 'lucide-react';

interface LandingPageProps {
  onStartCreating: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartCreating }) => {
  const { tournaments, currentUser } = useDatabase();

  return (
    <div id="landing-page" className="bg-[#0F1115] text-[#E4E7EB]">
      
      {/* Hero Banner Section */}
      <div className="relative bg-[#0F1115] text-white overflow-hidden py-20 sm:py-28 px-4 sm:px-6 border-b border-[#2D3139]">
        
        {/* Abstract Background Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_-20%,rgba(0,255,135,0.12),rgba(15,17,21,0))]" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20 mb-6 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Nova Geração de Gestão de Futebol Amador
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none bg-gradient-to-r from-white via-[#E4E7EB] to-[#00D1FF] bg-clip-text text-transparent">
            Seu Campeonato de Futebol,<br />
            Gerenciado como Profissional.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#8E9299] max-w-2xl mx-auto font-light leading-relaxed">
            Plataforma SaaS completa para organizar copas, campeonatos de várzea, ligas escolares e torneios de futsal. 
            Súmula em tempo real, validação automática de CPF e controle financeiro integrado.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <button
              id="btn-hero-create"
              onClick={onStartCreating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] font-black rounded-xl shadow-lg hover:shadow-[#00FF87]/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Criar Campeonato Grátis
              <ArrowRight className="w-5 h-5 text-[#0F1115]" />
            </button>
            <a
              href="#public-standings-section"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#16191F] hover:bg-[#1A1D23] text-white font-bold rounded-xl border border-[#2D3139] transition-all"
            >
              Ver Campeonatos Ativos
            </a>
          </div>

          {/* Key Statistics Summary */}
          <div className="mt-16 pt-8 border-t border-[#2D3139] grid grid-cols-2 sm:grid-cols-4 gap-6 text-center max-w-3xl mx-auto">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#00FF87]">R$ 0</p>
              <p className="text-xs text-[#8E9299] font-semibold uppercase mt-1">Primeiro Torneio</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">{tournaments.length}</p>
              <p className="text-xs text-[#8E9299] font-semibold uppercase mt-1">Torneios Ativos</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">100%</p>
              <p className="text-xs text-[#8E9299] font-semibold uppercase mt-1">Validação CPF Govt</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-[#00D1FF]">Ref / Club</p>
              <p className="text-xs text-[#8E9299] font-semibold uppercase mt-1">Súmula Digital</p>
            </div>
          </div>

        </div>
      </div>

      {/* Featured Competitions Section (Landing Page requested) */}
      <div id="landing-tournaments" className="bg-[#0F1115] py-14 border-b border-[#2D3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold text-[#00FF87] bg-[#00FF87]/10 px-3 py-1 rounded-full uppercase tracking-wider">
                COMPETIÇÕES ATIVAS
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
                Principais Campeonatos no Nosso App
              </h2>
              <p className="text-[#8E9299] text-sm mt-1">
                Ligas e competições em andamento que confiam no nosso sistema para gerenciar súmulas e elencos.
              </p>
            </div>
            <a
              href="#public-standings-section"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#00FF87] hover:text-[#00FF87]/80 transition-colors"
            >
              Explorar tabela de todos os campeonatos <ChevronRight className="w-4 h-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tournaments.map(tour => (
              <div 
                key={tour.id} 
                className="bg-[#16191F] rounded-2xl border border-[#2D3139] p-5 hover:border-[#00FF87]/30 hover:shadow-[0_0_20px_rgba(0,255,135,0.03)] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#1A1D23] border border-[#2D3139] flex items-center justify-center text-2xl shadow-sm">
                      ⚽️
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      tour.status === 'active' 
                        ? 'bg-[#00FF87]/10 text-[#00FF87] border border-[#00FF87]/20' 
                        : 'bg-[#2D3139]/30 text-[#8E9299] border border-[#2D3139]'
                    }`}>
                      {tour.status === 'active' ? 'Ativo' : 'Finalizado'}
                    </span>
                  </div>
                  
                  <h3 className="font-extrabold text-white text-base sm:text-lg group-hover:text-[#00FF87] transition-colors">
                    {tour.name}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-[#8E9299]">
                    <div>
                      <span className="text-[10px] font-bold text-[#8E9299] block opacity-65">MODALIDADE</span>
                      <span className="font-semibold text-slate-200">{tour.sport_name}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-[#8E9299] block opacity-65">CATEGORIA</span>
                      <span className="font-semibold text-slate-200">{tour.category}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#2D3139] flex items-center justify-between text-xs">
                  <span className="font-medium text-[#8E9299]">Ano: {tour.year}</span>
                  <button
                    onClick={() => {
                      const element = document.getElementById('public-standings-section');
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                        const selectEl = document.getElementById('filter-tournament') as HTMLSelectElement;
                        if (selectEl) {
                          selectEl.value = tour.id;
                          const evt = new Event('change', { bubbles: true });
                          selectEl.dispatchEvent(evt);
                        }
                      }
                    }}
                    className="inline-flex items-center gap-1 font-bold text-[#00FF87] hover:text-[#00FF87]/80"
                  >
                    Ver Classificação <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing SAAS Plans Section */}
      <div id="pricing-section" className="bg-[#0F1115] py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-[#00FF87] bg-[#00FF87]/10 px-3 py-1 rounded-full uppercase tracking-wider">
              SAAS MENSALIDADE & TAXAS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold mt-3 tracking-tight text-white">
              Preços Transparentes para Organizadores
            </h2>
            <p className="text-[#8E9299] text-sm sm:text-base mt-2">
              Seja dono de uma liga inteira. O primeiro campeonato criado é inteiramente <span className="text-[#00FF87] font-bold">gratuito</span>!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            
            {/* Single payment details */}
            <div className="bg-[#16191F] border border-[#2D3139] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#00FF87] bg-[#00FF87]/10 px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Taxa Única
                </span>
                <h3 className="text-lg font-bold mt-2 text-white">Por Campeonato</h3>
                <p className="text-xs text-[#8E9299] mt-1">Cobrado por campeonato ativo criado (primeiro campeonato grátis!)</p>
                <div className="mt-5 mb-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">{SINGLE_TOURNAMENT_PAYMENT.price}</span>
                  <span className="text-[#8E9299] text-xs">/ taxa</span>
                </div>
                <p className="text-[10px] text-[#8E9299] mb-6">Exclusivo para criar novos campeonatos fora do plano de assinatura recorrente.</p>
              </div>

              <a
                href={SINGLE_TOURNAMENT_PAYMENT.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-[#1A1D23] hover:bg-[#2D3139] border border-[#2D3139] text-[#E4E7EB] text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
              >
                Pagar Taxa Única (R$ 80)
              </a>
            </div>

            {/* Monthly subscription */}
            <div className="bg-[#16191F] border border-[#2D3139] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#00D1FF] bg-[#00D1FF]/10 px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Assinatura Recorrente
                </span>
                <h3 className="text-lg font-bold mt-2 text-white">Mensal Básico</h3>
                <p className="text-xs text-[#8E9299] mt-1">Plataforma SaaS ativa para 1 mês.</p>
                <div className="mt-5 mb-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">R$ 300</span>
                  <span className="text-[#8E9299] text-xs">/ mês</span>
                </div>
                <ul className="text-xs text-[#8E9299] space-y-2 mb-6">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Súmula Online Árbitro</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Validação CPF Governo</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Avaliações Juiz e Campo</li>
                </ul>
              </div>

              <a
                href="https://mpago.la/1J1FJPp"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0F1115] text-xs font-extrabold py-2.5 px-4 rounded-xl transition-all shadow-md"
              >
                Assinar Plano Mensal
              </a>
            </div>

            {/* 6 months subscription */}
            <div className="bg-[#16191F] border-2 border-[#00FF87] rounded-2xl p-6 flex flex-col justify-between relative shadow-[0_0_30px_rgba(0,255,135,0.08)]">
              <span className="absolute -top-3 right-4 bg-[#00FF87] text-[#0F1115] font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Popular (Economize 15%)
              </span>
              <div>
                <span className="text-xs font-bold text-[#00FF87] bg-[#00FF87]/10 px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Assinatura Recorrente
                </span>
                <h3 className="text-lg font-bold mt-2 text-white">Plano Semestral</h3>
                <p className="text-xs text-[#8E9299] mt-1">Plataforma SaaS ativa para 6 meses.</p>
                <div className="mt-5 mb-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">R$ 1.500</span>
                  <span className="text-[#8E9299] text-xs">/ 6 meses</span>
                </div>
                <ul className="text-xs text-[#8E9299] space-y-2 mb-6">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Todos os recursos inclusos</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Atendimento Prioritário</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Exportação de dados</li>
                </ul>
              </div>

              <a
                href="https://mpago.la/26XmcJN"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-[#00FF87] hover:bg-[#00FF87]/90 text-[#0F1115] text-xs font-black py-2.5 px-4 rounded-xl transition-all shadow-md"
              >
                Assinar Plano 6 Meses
              </a>
            </div>

            {/* 12 months subscription */}
            <div className="bg-[#16191F] border border-[#2D3139] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-[#00D1FF] bg-[#00D1FF]/10 px-2.5 py-0.5 rounded uppercase tracking-wider">
                  Assinatura Recorrente
                </span>
                <h3 className="text-lg font-bold mt-2 text-white">Plano Anual</h3>
                <p className="text-xs text-[#8E9299] mt-1">Plataforma SaaS ativa para 12 meses.</p>
                <div className="mt-5 mb-2 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-white">R$ 3.000</span>
                  <span className="text-[#8E9299] text-xs">/ ano</span>
                </div>
                <ul className="text-xs text-[#8E9299] space-y-2 mb-6">
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Melhor custo benefício</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Customização de marca</li>
                  <li className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-[#00FF87] shrink-0" /> Sem limites de árbitros</li>
                </ul>
              </div>

              <a
                href="https://mpago.la/2WLyT5V"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center bg-[#1A1D23] hover:bg-[#2D3139] border border-[#2D3139] text-[#E4E7EB] text-xs font-bold py-2.5 px-4 rounded-xl transition-colors"
              >
                Assinar Plano Anual
              </a>
            </div>

          </div>

          {/* Checkout note warning safety */}
          <p className="text-center text-[10px] text-[#8E9299] max-w-xl mx-auto mt-8">
            Os links de pagamento acima direcionam diretamente ao ambiente seguro do Mercado Pago. 
            Em caso de dúvidas de integração, consulte as configurações do painel de administração do campeonato.
          </p>

        </div>
      </div>

    </div>
  );
};

