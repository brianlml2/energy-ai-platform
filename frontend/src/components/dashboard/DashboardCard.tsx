import React from 'react';
import Link from 'next/link';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  badgeText: string;
  badgeClass: string;
  iconBgClass: string;
  href?: string;
  unit?: string;
}

export function DashboardCard({
  title,
  value,
  icon: Icon,
  badgeText,
  badgeClass,
  iconBgClass,
  href,
  unit,
}: DashboardCardProps) {
  const content = (
    <div className="bg-white border border-slate-200 shadow-2xs rounded p-6 flex flex-col justify-between hover:border-slate-300 transition-all group h-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate pr-2">{title}</span>
        <div className={`p-2 rounded ${iconBgClass} transition-colors shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-slate-900 font-mono">
          {value} {unit && <span className="text-xs font-normal text-slate-500 font-sans">{unit}</span>}
        </span>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded whitespace-nowrap shrink-0 ${badgeClass}`}>
          {badgeText}
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}
