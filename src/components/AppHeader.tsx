import { Link } from "@tanstack/react-router";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function AppHeader({
  title,
  subtitle,
  backTo,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
}) {
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-30 -mx-5 mb-4 bg-background/85 px-5 pb-3 pt-5 backdrop-blur">
      <div className="flex items-center gap-3">
        {backTo ? (
          <Link
            to={backTo}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-soft"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        ) : null}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold">{title}</h1>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label="Toggle dark mode"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-card text-foreground shadow-soft transition-colors hover:bg-muted"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
      </div>
    </header>
  );
}
