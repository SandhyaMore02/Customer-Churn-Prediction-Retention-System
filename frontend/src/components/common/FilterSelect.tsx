interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}

export function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 max-w-full rounded-md border bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring cursor-pointer"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}
