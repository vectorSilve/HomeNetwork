import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "motion/react";
import { Cpu, LayoutDashboard, User } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1a1a1a] font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white transition-transform group-hover:scale-110">
              <Cpu size={18} />
            </div>
            <span className="text-lg font-semibold tracking-tight">Vector Sliver</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/" active={location.pathname === "/"}>
              <span className="hidden sm:inline">Portfolio</span>
              <span className="sm:hidden">Home</span>
            </NavLink>
            <NavLink to="/admin" active={location.pathname === "/admin"}>
              <LayoutDashboard size={16} className="sm:mr-1.5" />
              <span className="hidden sm:inline">Admin</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <Outlet />
        </motion.div>
      </main>

      <footer className="mt-auto border-t border-black/5 bg-white py-8">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Vector Sliver Portfolio. Built with precision.
          </p>
        </div>
      </footer>
    </div>
  );
}

function NavLink({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-black text-white"
          : "text-gray-600 hover:bg-black/5 hover:text-black"
      )}
    >
      {children}
    </Link>
  );
}
