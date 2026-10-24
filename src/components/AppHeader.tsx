import { Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-state";

export function AppHeader() {
  const { t, lang, setLang } = useApp();
  const link = "rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground";
  const active = "bg-secondary text-secondary-foreground font-medium";
  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="font-display text-2xl text-primary">نبرة</span>
          <span className="hidden text-sm font-semibold tracking-wide sm:inline">Nabra</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link to="/" className={link} activeProps={{ className: active }} activeOptions={{ exact: true }}>{t.nav_write}</Link>
          <Link to="/result" className={link} activeProps={{ className: active }}>{t.nav_result}</Link>
          <Link to="/dashboard" className={link} activeProps={{ className: active }}>{t.nav_dash}</Link>
        </nav>
        <button
          onClick={() => setLang(lang === "en" ? "ar" : "en")}
          className="rounded-full border px-3 py-1.5 text-sm font-medium hover:bg-secondary"
        >
          {lang === "en" ? "عربي" : "EN"}
        </button>
      </div>
    </header>
  );
}
