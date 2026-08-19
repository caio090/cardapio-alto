import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | Cardápio Alto",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f4f4f2] text-[#1a1a1a]">{children}</div>;
}
