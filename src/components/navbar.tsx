import { Moon, Sun, Vault, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/" as const, label: "Home" },
  { to: "/" as const, label: "Apply Now", hash: "apply" },
  { to: "/emi" as const, label: "EMI Calculator" },
  { to: "/compare" as const, label: "Compare" },
  { to: "/dashboard" as const, label: "Dashboard" },
  { to: "/history" as const, label: "History" },
];

export function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4">
      <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl glass px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-cyan glow-cyan">
            <Vault className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="leading-tight">
            <span className="block text-lg font-bold tracking-tight">
              <span className="text-foreground">Vault</span><span className="text-gradient-cyan">IQ</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              Smart · Secure · Certain
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex gap-6 text-sm text-muted-foreground">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} hash={n.hash}
              className="hover:text-foreground transition-colors"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: true }}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card hover:bg-accent transition-colors">
            {theme === "dark" ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
          </button>
          <button onClick={() => setOpen(!open)} aria-label="Menu"
            className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card lg:hidden">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={cn("lg:hidden mx-auto max-w-6xl overflow-hidden transition-all", open ? "max-h-96 mt-2" : "max-h-0")}>
        <div className="glass rounded-2xl p-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.label} to={n.to} hash={n.hash} onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2.5 text-sm hover:bg-accent transition-colors">
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
