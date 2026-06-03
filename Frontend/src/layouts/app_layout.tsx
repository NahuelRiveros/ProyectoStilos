import type { ReactNode } from "react";
import Navbar from "../components/layout/navbar";
import Footer from "../components/layout/footer";
import { SessionGuard } from "../components/session_guard";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1">
        <SessionGuard />
        {children}
      </main>

      <Footer />
    </div>
  );
}
