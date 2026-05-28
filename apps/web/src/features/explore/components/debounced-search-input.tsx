import { Search } from "lucide-react";
import type { Ref } from "react";

type DebouncedSearchInputProps = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  debounceLabel?: string;
  inputRef?: Ref<HTMLInputElement>;
  onChange: (value: string) => void;
};

export function DebouncedSearchInput({
  id,
  label,
  value,
  placeholder,
  debounceLabel,
  inputRef,
  onChange,
}: DebouncedSearchInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-describedby={debounceLabel ? `${id}-debounce-help` : undefined}
          className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
        />
      </div>
      {debounceLabel ? (
        <p id={`${id}-debounce-help`} className="mt-1 text-xs text-slate-500">
          {debounceLabel}
        </p>
      ) : null}
    </div>
  );
}
