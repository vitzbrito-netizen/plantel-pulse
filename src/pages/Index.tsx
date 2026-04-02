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
import { Users, Zap, DollarSign, Bell, BarChart3 } from 'lucide-react';

type Tab = 'equipe' | 'dinamica' | 'orcamento' | 'noticias' | 'pulse';

const tabs: { id: Tab; label: string; icon: React.ReactNode; subTabs?: string[] }[] = [
  { id: 'equipe', label: 'Equipe', icon: <Users className="w-3.5 h-3.5" />, subTabs: ['Quadro', 'Por Setor', 'Por Turno', 'Comparar'] },
  { id: 'dinamica', label: 'Dinâmica', icon: <Zap className="w-3.5 h-3.5" />, subTabs: ['Alertas', 'Hierarquia', 'Relacionamentos', 'Clima'] },
  { id: 'orcamento', label: 'Orçamento', icon: <DollarSign className="w-3.5 h-3.5" />, subTabs: ['Visão Geral', 'Contratos', 'Projeções'] },
  { id: 'noticias', label: 'Notícias', icon: <Bell className="w-3.5 h-3.5" /> },
  { id: 'pulse', label: 'Pulse Check', icon: <BarChart3 className="w-3.5 h-3.5" />, subTabs: ['Semanal', 'Tendências', 'Histórico'] },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>('equipe');
  const [activeSubTab, setActiveSubTab] = useState<string>('Quadro');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [cpoEmployee, setCpoEmployee] = useState<Employee | null>(null);

  const currentTabConfig = tabs.find(t => t.id === activeTab);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    const tab = tabs.find(t => t.id === tabId);
    if (tab?.subTabs) {
      setActiveSubTab(tab.subTabs[0]);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      {/* Main navigation tabs - FM style */}
      <div className="bg-card border-b border-border">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sub-navigation - FM style */}
      {currentTabConfig?.subTabs && (
        <div className="fm-subnav">
          <div className="flex px-2">
            {currentTabConfig.subTabs.map(subTab => (
              <button
                key={subTab}
                onClick={() => setActiveSubTab(subTab)}
                className={`fm-subnav-item ${activeSubTab === subTab ? 'active' : ''}`}
              >
                {subTab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content area with optional sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className={`flex-1 overflow-auto p-4 ${selectedEmployee ? 'pr-0' : ''}`}>
          {activeTab === 'equipe' && (
            <EquipeTab 
              onSelectEmployee={setSelectedEmployee} 
              selectedEmployee={selectedEmployee}
              activeSubTab={activeSubTab}
            />
          )}
          {activeTab === 'dinamica' && <DinamicaTab activeSubTab={activeSubTab} />}
          {activeTab === 'orcamento' && <OrcamentoTab activeSubTab={activeSubTab} />}
          {activeTab === 'noticias' && <NoticiasTab />}
          {activeTab === 'pulse' && <PulseCheckTab activeSubTab={activeSubTab} />}
        </div>

        {/* Right sidebar for employee details - FM style */}
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
