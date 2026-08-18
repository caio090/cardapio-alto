import { contact } from "@/lib/contact";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-sm font-medium text-ink">
          Cárdapio <span className="text-primary">Alto</span>
        </p>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-muted">
          <a href={`mailto:${contact.email}`} className="hover:text-ink">
            {contact.email}
          </a>
          <a
            href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink"
          >
            {contact.instagram}
          </a>
        </div>
        <p className="text-sm text-muted">
          © {new Date().getFullYear()} Cárdapio Alto
        </p>
      </div>
    </footer>
  );
}
