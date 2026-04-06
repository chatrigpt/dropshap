import React from 'react';
import { cn } from '../lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatsCard({ label, value, icon, trend, className }: StatsCardProps) {
  return (
    <div className={cn("bg-dark-card border border-white/5 rounded-2xl p-6 shadow-xl flex items-start justify-between", className)}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
        <h3 className="text-2xl font-black font-display text-white tracking-tight">{value}</h3>
        {trend && (
          <p className={cn(
            "text-xs font-bold mt-2 flex items-center gap-1",
            trend.isPositive ? "text-green-400" : "text-red-400"
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}
            <span className="text-gray-500">vs mois dernier</span>
          </p>
        )}
      </div>
      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
        {icon}
      </div>
    </div>
  );
}
