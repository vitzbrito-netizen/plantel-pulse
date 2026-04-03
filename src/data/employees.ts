export type Tier = 'Líder' | 'Influente' | 'Promessa';
export type Turno = 'Diurno' | 'Noturno' | 'Integral';

export interface Skills {
  tecnica: number;
  comunicacao: number;
  lideranca: number;
  disciplina: number;
  trabalhoEmEquipe: number;
  atendimento?: number;
}

export interface Employee {
  clientId: string;
  id: string;
  name: string;
  role: string;
  tier: Tier;
  ovr: number;
  morale: number;
  salary: number;
  contractEnd: string;
  turno: Turno;
  skills: Skills;
  fitness: number;
  form: number;
  afinidades: string[];
  tensoes: string[];
  flightRisk: boolean;
  notes?: string;
  birthday?: string;
  /** Campos ainda não confirmados com dados reais */
  pendingFields?: string[];
}

export const employees: Employee[] = [
  {
    id: '1', clientId: 'excelencia', name: 'Regiane Aparecida de Souza', role: 'Gerente', tier: 'Líder',
    ovr: 85, morale: 82, salary: 8500, contractEnd: '2027-12-31', turno: 'Diurno',
    skills: { tecnica: 88, comunicacao: 82, lideranca: 85, disciplina: 90, trabalhoEmEquipe: 80 },
    fitness: 90, form: 85, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1986-09-18',
    notes: 'Solteira. 2 filhos (aniversários: 17/02 e 02/06). Corinthians. Reconhecimento preferido: folga.',
  },
  {
    id: '2', clientId: 'excelencia', name: 'Paulo Cardoso', role: 'Técnico de Laboratório', tier: 'Líder',
    ovr: 88, morale: 75, salary: 15000, contractEnd: '2026-06-30', turno: 'Diurno',
    skills: { tecnica: 92, comunicacao: 78, lideranca: 88, disciplina: 85, trabalhoEmEquipe: 75 },
    fitness: 82, form: 78, afinidades: ['Sabrina de Souza Andrade'], tensoes: [], flightRisk: false,
    birthday: '1986-03-02',
    notes: 'Casado com Sabrina (17/09/2021). 3 filhos: Kauan, João, Mellyna. Palmeiras. Quer ser analista. Especialidade: análise de urina. Reconhecimento: folga.',
  },
  {
    id: '3', clientId: 'excelencia', name: 'Adilene Dias de Souza', role: 'Técnico de Laboratório', tier: 'Líder',
    ovr: 83, morale: 88, salary: 7200, contractEnd: '2027-06-30', turno: 'Diurno',
    skills: { tecnica: 80, comunicacao: 88, lideranca: 85, disciplina: 82, trabalhoEmEquipe: 86 },
    fitness: 88, form: 90, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1982-06-27',
    notes: 'Solteira. 2 filhos. Corinthians. Especialidade: coleta RN (recém-nascido). Reconhecimento: folga.',
  },
  {
    id: '4', clientId: 'excelencia', name: 'Irani de Souza Anjos', role: 'Técnico de Laboratório', tier: 'Influente',
    ovr: 78, morale: 72, salary: 5800, contractEnd: '2026-11-30', turno: 'Diurno',
    skills: { tecnica: 80, comunicacao: 72, lideranca: 65, disciplina: 78, trabalhoEmEquipe: 75 },
    fitness: 78, form: 74, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1980-09-11',
    notes: 'Solteira. Sem filhos. Flamengo. Comida favorita: estrogonofe. Reconhecimento: folga.',
  },
  {
    id: '5', clientId: 'excelencia', name: 'Robert Bispo Meneses', role: 'Técnico de Laboratório', tier: 'Influente',
    ovr: 76, morale: 68, salary: 5500, contractEnd: '2026-08-31', turno: 'Noturno',
    skills: { tecnica: 78, comunicacao: 70, lideranca: 60, disciplina: 75, trabalhoEmEquipe: 72 },
    fitness: 75, form: 70, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1998-09-16',
    notes: 'Solteiro. Sem filhos. Hobbies: jogos, cinema, cachoeira. Reconhecimento: folga.',
  },
  {
    id: '6', clientId: 'excelencia', name: 'Nayara Cristina', role: 'Técnico de Laboratório', tier: 'Influente',
    ovr: 75, morale: 65, salary: 6200, contractEnd: '2026-12-31', turno: 'Noturno',
    skills: { tecnica: 80, comunicacao: 68, lideranca: 70, disciplina: 72, trabalhoEmEquipe: 65 },
    fitness: 72, form: 68, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1994-09-17',
    notes: 'Solteira. 1 filha. Academia e leitura. Conquista: carro próprio. Reconhecimento: folga.',
  },
  {
    id: '7', clientId: 'excelencia', name: 'Sabrina de Souza Andrade', role: 'Recepcionista', tier: 'Influente',
    ovr: 74, morale: 70, salary: 4800, contractEnd: '2026-07-31', turno: 'Diurno',
    skills: { tecnica: 78, comunicacao: 72, lideranca: 58, disciplina: 74, trabalhoEmEquipe: 68, atendimento: 80 },
    fitness: 80, form: 72, afinidades: ['Paulo Cardoso'], tensoes: [], flightRisk: false,
    birthday: '1999-09-20',
    notes: 'Casada com Paulo (17/09/2021). Filha: Mellyna (07/07/2024). Flamengo. Reconhecimento: folga.',
  },
  {
    id: '8', clientId: 'excelencia', name: 'Gabriela Helena Santos', role: 'Técnico de Laboratório', tier: 'Influente',
    ovr: 74, morale: 78, salary: 5900, contractEnd: '2026-05-31', turno: 'Diurno',
    skills: { tecnica: 78, comunicacao: 70, lideranca: 62, disciplina: 76, trabalhoEmEquipe: 74 },
    fitness: 82, form: 76, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1998-01-20',
    notes: 'Casada (27/06/2023). 2 filhos. Artesanato e animais. Não precisa de reconhecimento formal.',
  },
  {
    id: '9', clientId: 'excelencia', name: 'Djandira Nascimento dos Santos', role: 'Técnico de Laboratório', tier: 'Influente',
    ovr: 72, morale: 70, salary: 5200, contractEnd: '2026-08-31', turno: 'Diurno',
    skills: { tecnica: 74, comunicacao: 65, lideranca: 55, disciplina: 72, trabalhoEmEquipe: 68 },
    fitness: 70, form: 65, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1970-07-04',
    notes: 'Solteira. Sem filhos. Reconhecimento: folga.',
  },
  {
    id: '10', clientId: 'excelencia', name: 'Rielia Avan Pereira Lobo', role: 'Técnico de Laboratório', tier: 'Influente',
    ovr: 71, morale: 80, salary: 5000, contractEnd: '2026-10-31', turno: 'Diurno',
    skills: { tecnica: 75, comunicacao: 72, lideranca: 60, disciplina: 70, trabalhoEmEquipe: 74 },
    fitness: 78, form: 74, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1993-01-07',
    notes: 'União estável (jun/2024). Sem filhos. Leitura. Coletadora excelente. Ensina: coleta infantil e libras. Reconhecimento: elogio público.',
  },
  {
    id: '11', clientId: 'excelencia', name: 'Bianca Cardoso', role: 'Recepcionista', tier: 'Influente',
    ovr: 70, morale: 75, salary: 3800, contractEnd: '2027-01-31', turno: 'Diurno',
    skills: { tecnica: 60, comunicacao: 78, lideranca: 50, disciplina: 72, trabalhoEmEquipe: 74, atendimento: 78 },
    fitness: 82, form: 78, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1998-08-18',
    notes: 'Casada (out/2021). 1 filho. Reconhecimento: folga.',
  },
  {
    id: '12', clientId: 'excelencia', name: 'Willow Albuquerque Santos Costa', role: 'Técnico de Laboratório', tier: 'Influente',
    ovr: 69, morale: 50, salary: 5100, contractEnd: '2026-06-30', turno: 'Noturno',
    skills: { tecnica: 72, comunicacao: 58, lideranca: 48, disciplina: 65, trabalhoEmEquipe: 55 },
    fitness: 68, form: 60, afinidades: [], tensoes: [], flightRisk: true,
    birthday: '1994-05-20',
    notes: 'Mora junto. 2 filhos. Flamengo. Jogos, esporte, família. Reconhecimento: elogio público. RISCO DE FUGA.',
  },
  {
    id: '13', clientId: 'excelencia', name: 'Lorraine Cristina Alves Ferreira', role: 'Técnico de Laboratório Jr', tier: 'Promessa',
    ovr: 64, morale: 80, salary: 3500, contractEnd: '2026-05-31', turno: 'Diurno',
    skills: { tecnica: 65, comunicacao: 68, lideranca: 50, disciplina: 62, trabalhoEmEquipe: 70 },
    fitness: 88, form: 82, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '2001-01-01',
    notes: 'Solteira. Sem filhos. Flamengo. Conquista: graduação. Reconhecimento: folga.',
  },
  {
    id: '14', clientId: 'excelencia', name: 'Maria Eduarda Bodas', role: 'Técnico de Laboratório Jr', tier: 'Promessa',
    ovr: 62, morale: 75, salary: 3200, contractEnd: '2026-04-30', turno: 'Noturno',
    skills: { tecnica: 62, comunicacao: 58, lideranca: 45, disciplina: 65, trabalhoEmEquipe: 68 },
    fitness: 85, form: 78, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1998-06-27',
    notes: 'Solteira. Sem filhos. Vasco. Academia, natação, séries. Conquista: analista de laboratório. Reconhecimento: folga.',
  },
  {
    id: '15', clientId: 'excelencia', name: 'Erick Vinicius Aragão Guerra', role: 'Técnico de Laboratório Jr', tier: 'Promessa',
    ovr: 61, morale: 85, salary: 3000, contractEnd: '2027-06-30', turno: 'Diurno',
    skills: { tecnica: 60, comunicacao: 65, lideranca: 48, disciplina: 68, trabalhoEmEquipe: 72 },
    fitness: 90, form: 85, afinidades: [], tensoes: [], flightRisk: false,
    birthday: '1996-03-01',
    notes: 'Casado (mar/2021). Sem filhos. Flamengo. Trilha, cachoeira, churrasco. Reconhecimento: folga.',
  },
  {
    id: '16', clientId: 'excelencia', name: 'Colaborador 16', role: 'Recepcionista Jr', tier: 'Promessa',
    ovr: 58, morale: 70, salary: 2800, contractEnd: '2026-09-30', turno: 'Diurno',
    skills: { tecnica: 48, comunicacao: 72, lideranca: 40, disciplina: 60, trabalhoEmEquipe: 68, atendimento: 70 },
    fitness: 92, form: 88, afinidades: [], tensoes: [], flightRisk: false,
    notes: 'Dados pendentes.',
  },
];

export function getInitials(name: string): string {
  return name.split(' ').filter(p => !['Dr.', 'de', 'da', 'do', 'dos'].includes(p)).map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

export function getMoraleColor(morale: number): string {
  if (morale >= 75) return 'hsl(var(--morale-high))';
  if (morale >= 55) return 'hsl(var(--morale-mid))';
  return 'hsl(var(--morale-low))';
}

export function getMoraleLabel(morale: number): string {
  if (morale >= 85) return 'Excelente';
  if (morale >= 75) return 'Bom';
  if (morale >= 60) return 'Regular';
  if (morale >= 45) return 'Baixo';
  return 'Crítico';
}

export function getTierColor(tier: Tier): string {
  switch (tier) {
    case 'Líder': return 'hsl(var(--tier-lider))';
    case 'Influente': return 'hsl(var(--tier-influente))';
    case 'Promessa': return 'hsl(var(--tier-promessa))';
  }
}

export function getTierBg(tier: Tier): string {
  switch (tier) {
    case 'Líder': return 'bg-tier-lider';
    case 'Influente': return 'bg-tier-influente';
    case 'Promessa': return 'bg-tier-promessa';
  }
}

export function isContractExpiring(contractEnd: string, days: number): boolean {
  const end = new Date(contractEnd);
  const now = new Date();
  const diff = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff <= days && diff >= 0;
}

export function daysUntilExpiry(contractEnd: string): number {
  const end = new Date(contractEnd);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function isFlightRisk(emp: Employee): boolean {
  return emp.morale < 55 && isContractExpiring(emp.contractEnd, 90);
}

export const teamStats = {
  avgOvr: Math.round(employees.reduce((a, e) => a + e.ovr, 0) / employees.length),
  avgMorale: Math.round(employees.reduce((a, e) => a + e.morale, 0) / employees.length),
  headcount: employees.length,
  folhaMensal: employees.reduce((a, e) => a + e.salary, 0),
  climaScore: 8,
};
