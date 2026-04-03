import { useState } from 'react';
import { Header } from '@/components/Header';
import { EquipeTab } from '@/components/tabs/EquipeTab';
import { DinamicaTab } from '@/components/tabs/DinamicaTab';
import { OrcamentoTab } from '@/components/tabs/OrcamentoTab';
import { NoticiasTab } from '@/components/tabs/NoticiasTab';
import { PulseCheckTab } from '@/components/tabs/PulseCheckTab';
import { EmployeeSidebar } from '@/components/EmployeeSidebar';
import { CPOPanel } from '@/components/CPOPanel';
import { Employee } from '@/data/employees';
import { useIsMobile } from '@/hooks/use-mobile';
import { Users, Zap, DollarSign, Bell, BarChart3 } from 'lucide-react';

type Tab = 'equipe' | 'dinamica' | 'orcamento' | 'noticias' | 'pulse';

const tabs: { id: Tab; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'equipe', label: 'Equipe', icon: <Users className="w-4 h-4" />, description: 'Ver colaboradores' },
  { id: 'pulse', label: 'Pulse Check', icon: <BarChart3 className="w-4 h-4" />, description: 'Engajamento' },
  { id: 'dinamica', label: 'Dinâmica', icon: <Zap className="w-4 h-4" />, description: 'Alertas e clima' },
  { id: 'orcamento', label: 'Orçamento', icon: <DollarSign className="w-4 h-4" />, description: 'Custos e contratos' },
  { id: 'noticias', label: 'Notícias', icon: <Bell className="w-4 h-4" />, description: 'Atualizações' },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('equipe');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [cpoEmployee, setCpoEmployee] = useState<Employee | null>(null);
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main navigation — large, clear tabs with icons */}
      <div className="bg-card border-b border-border">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-3 ${
                activeTab === tab.id
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex overflow-hidden">
        <div className={`flex-1 overflow-auto p-4 ${selectedEmployee ? 'pr-0' : ''}`}>
          {activeTab === 'equipe' && (
            <EquipeTab 
              onSelectEmployee={setSelectedEmployee} 
              selectedEmployee={selectedEmployee}
            />
          )}
          {activeTab === 'dinamica' && <DinamicaTab activeSubTab="Alertas" />}
          {activeTab === 'orcamento' && <OrcamentoTab activeSubTab="Visão Geral" />}
          {activeTab === 'noticias' && <NoticiasTab />}
          {activeTab === 'pulse' && <PulseCheckTab activeSubTab="Semanal" />}
        </div>

        {/* Employee detail sidebar */}
        {selectedEmployee && !cpoEmployee && (
          <EmployeeSidebar
            employee={selectedEmployee}
            onClose={() => setSelectedEmployee(null)}
            onCPO={(emp) => { setCpoEmployee(emp); setSelectedEmployee(null); }}
          />
        )}
      </div>

      {/* CPO Panel */}
      {cpoEmployee && (
        <CPOPanel
          employee={cpoEmployee}
          onClose={() => setCpoEmployee(null)}
        />
      )}
    </div>
  );
};

export default Index;
