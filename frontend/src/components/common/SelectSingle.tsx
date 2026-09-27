'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  label: string;
  value: string;
}

interface SelectSingleProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SelectSingle({
  options,
  value,
  onChange,
  placeholder,
  className = '',
}: SelectSingleProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded px-3.5 py-2 pr-8 text-xs font-semibold text-slate-900 focus:outline-none focus:border-slate-400 cursor-pointer w-full shadow-2xs"
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}
