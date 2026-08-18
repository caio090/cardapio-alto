import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <Logo size={28} />
          <p className="text-sm font-medium text-ink">
            Cardápio <span className="text-ink-accent">Alto</span>
          </p>
        </div>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Cardápio Alto
        </p>
      </div>
    </footer>
  );
}
