
import React from 'react';

interface ToggleGroupProps<T extends string> {
  options: readonly T[];
  selected: T;
  onChange: (value: T) => void;
}

export function ToggleGroup<T extends string>({ options, selected, onChange }: ToggleGroupProps<T>) {
  return (
    <div className="flex bg-primary rounded-lg p-1 space-x-1">
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onChange(option)}
          className={`w-full px-3 py-1 text-sm font-medium rounded-md transition-colors focus:outline-none ${
            selected === option
              ? 'bg-accent text-white shadow'
              : 'text-text-secondary hover:bg-gray-600'
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}