import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-foreground/90">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-input/60 px-4 py-3 text-sm",
        "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all",
        props.className,
      )}
    />
  );
}

export function Toggle<T extends string>({
  options, value, onChange,
}: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-2 rounded-xl border border-border bg-muted/40 p-1">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
            value === opt
              ? "bg-gradient-cyan text-primary-foreground glow-cyan"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function Slider({
  value, onChange, min, max, step = 1,
}: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <input
      type="range"
      min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none bg-muted accent-primary cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary
        [&::-webkit-slider-thumb]:shadow-[0_0_15px_var(--primary)]"
    />
  );
}

export function PillGroup<T extends string | number>({
  options, value, onChange,
}: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={String(opt)}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm font-medium transition-all",
            value === opt
              ? "border-primary bg-primary/15 text-primary glow-cyan"
              : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
