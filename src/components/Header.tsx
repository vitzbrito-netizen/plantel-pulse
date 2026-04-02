import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { employees, teamStats } from '@/data/employees';
import { ChevronDown, Users, TrendingUp, Heart, Settings, FileText, Calendar, Bell, HelpCircle, Search, ArrowLeft, LogOut } from 'lucide-react';

interface DropdownProps {
  label: string;
  items: { label: string; icon?: React.ReactNode; shortcut?: string }[];
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

function Dropdown({ label, items, isOpen, onToggle, onClose }: DropdownProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={onToggle}
        className={`flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium transition-colors ${
          isOpen ? 'bg-[#1a1a2e] text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-[#1a1a2e]'
        }`}
      >
        {label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-0.5 min-w-[200px] fm-dropdown rounded z-50">
          {items.map((item, i) => (
            <button
              key={i}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 text-xs text-left fm-dropdown-item text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <span className="flex items-center gap-2">
                {item.icon}
                {item.label}
              </span>
              {item.shortcut && (
                <span className="text-[10px] text-muted-foreground/50">{item.shortcut}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleToggle = (id: string) => {
    setOpenDropdown(prev => prev === id ? null : id);
  };

  const dropdowns = [
    {
      id: 'laboratorio',
      label: 'Laboratório',
      items: [
        { label: 'Visão Geral', icon: <Search className="w-3 h-3" /> },
        { label: 'Configurações', icon: <Settings className="w-3 h-3" /> },
        { label: 'Relatórios', icon: <FileText className="w-3 h-3" /> },
      ]
    },
    {
      id: 'equipe',
      label: 'Equipe',
      items: [
        { label: 'Quadro de Pessoal', icon: <Users className="w-3 h-3" />, shortcut: 'F1' },
        { label: 'Estrutura Hierárquica', icon: <Users className="w-3 h-3" /> },
        { label: 'Buscar Colaborador', icon: <Search className="w-3 h-3" />, shortcut: 'Ctrl+F' },
      ]
    },
    {
      id: 'gestao',
      label: 'Gestão',
      items: [
        { label: 'Calendário', icon: <Calendar className="w-3 h-3" /> },
        { label: 'Contratos', icon: <FileText className="w-3 h-3" /> },
        { label: 'Orçamento', icon: <TrendingUp className="w-3 h-3" /> },
      ]
    },
    {
      id: 'ajuda',
      label: 'Ajuda',
      items: [
        { label: 'Manual do Gestor', icon: <HelpCircle className="w-3 h-3" /> },
        { label: 'Suporte', icon: <Bell className="w-3 h-3" /> },
      ]
    },
  ];

  return (
    <header className="bg-header border-b border-border">
      {/* Top bar with lab name and stats */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-4">
          {/* Back + Lab badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/portal')}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Portal
            </button>
            <div className="h-6 w-px bg-border" />
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">LE</span>
            </div>
            <div>
              <h1 className="text-[16px] font-bold tracking-tight text-foreground">LABORATÓRIO EXCELÊNCIA</h1>
              <p className="text-[12px] text-muted-foreground">Brasília, DF - Divisão Diagnóstica</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-1">
          <StatBadge icon={<TrendingUp className="w-3 h-3" />} label="OVR" value={teamStats.avgOvr} />
          <StatBadge icon={<Heart className="w-3 h-3" />} label="Moral" value={teamStats.avgMorale} color={teamStats.avgMorale >= 75 ? 'text-morale-high' : teamStats.avgMorale >= 60 ? 'text-morale-mid' : 'text-morale-low'} />
          <StatBadge icon={<Users className="w-3 h-3" />} label="Equipe" value={teamStats.headcount} />
          <div className="h-6 w-px bg-border mx-2" />
          <div className="text-[13px] text-muted-foreground">
            <span>Março 2026</span>
          </div>
        </div>
      </div>

      {/* Menu bar */}
      <div className="flex items-center px-2">
        {dropdowns.map(dd => (
          <Dropdown
            key={dd.id}
            label={dd.label}
            items={dd.items}
            isOpen={openDropdown === dd.id}
            onToggle={() => handleToggle(dd.id)}
            onClose={() => setOpenDropdown(null)}
          />
        ))}
      </div>
    </header>
  );
}

function StatBadge({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 bg-card/50 border border-border rounded px-2.5 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <div className="text-right">
        <p className="text-[11px] text-muted-foreground uppercase">{label}</p>
        <p className={`text-[20px] font-bold font-mono leading-none ${color || 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );
}
