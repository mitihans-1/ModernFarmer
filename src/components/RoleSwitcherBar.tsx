import React from 'react';
import { User, Language } from '../types';
import { UserCheck, Store, ShoppingBag, Shield } from 'lucide-react';
import { TRANSLATIONS } from '../i18n/translations';

interface RoleSwitcherBarProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (userId: string) => void;
  language: Language;
}

export const RoleSwitcherBar: React.FC<RoleSwitcherBarProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  language,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const roleIcons = {
    FARMER: <UserCheck className="w-4 h-4 text-emerald-400" />,
    SUPPLIER: <Store className="w-4 h-4 text-amber-400" />,
    BUYER: <ShoppingBag className="w-4 h-4 text-blue-400" />,
    ADMIN: <Shield className="w-4 h-4 text-purple-400" />,
  };

  return (
    <div className="bg-[#0F172A] border-b border-slate-800 px-4 py-2 text-white">
      <div className="w-full max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {t.switchRole}:
          </span>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            (Quick demo personas)
          </span>
        </div>

        {/* Persona Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1 max-w-3xl">
          {allUsers.map((u) => {
            const isSelected = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => onSelectUser(u.id)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all text-left truncate cursor-pointer ${
                  isSelected
                    ? 'bg-[#2563EB] text-white border border-blue-400 shadow-sm'
                    : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                {roleIcons[u.role] || <UserCheck className="w-4 h-4" />}
                <div className="truncate">
                  <div className="font-semibold truncate">{u.fullName.split(' ')[0]} ({u.role})</div>
                  <div className="text-[10px] text-slate-300 truncate opacity-85">
                    {u.woreda.split(' ')[0]}, {u.region}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Current Active Persona Summary Badge */}
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
          <div className="w-2 h-2 rounded-full bg-[#3B82F6]" />
          <span className="text-white font-medium">{currentUser.fullName}</span>
          <span className="text-slate-500">·</span>
          <span className="text-blue-400 font-medium">
            {currentUser.cooperativeName ? currentUser.cooperativeName : `${currentUser.woreda}`}
          </span>
        </div>
      </div>
    </div>
  );
};
