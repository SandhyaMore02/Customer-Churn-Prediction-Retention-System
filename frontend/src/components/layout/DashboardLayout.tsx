import { useState, useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Check, ChevronRight, TrendingUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Header } from "@/components/layout/Header";
import { api, type HealthResponse } from "@/services/api";

interface DashboardLayoutProps {
  title: string;
  subtitle: string;
  children: (props: {
    search: string;
    notice: string;
    setNotice: (msg: string) => void;
  }) => ReactNode;
}

export function DashboardLayout({ title, subtitle, children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [backendHealth, setBackendHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    api.checkHealth().then((health) => setBackendHealth(health));
  }, []);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          backendHealth={backendHealth}
        />

        <div
          className={`min-w-0 flex-1 transition-[margin] duration-200 ${
            collapsed ? "lg:ml-[76px]" : "lg:ml-[256px]"
          }`}
        >
          <Header
            onToggleSidebar={() => setCollapsed(!collapsed)}
            globalSearch={globalSearch}
            onSearchChange={setGlobalSearch}
            dark={dark}
            onToggleDark={() => setDark(!dark)}
            backendHealth={backendHealth}
            onSetNotice={setNotice}
          />

          <main className="mx-auto max-w-[1440px] px-4 py-7 md:px-8 md:py-9">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ChurnIQ</span>
                  <ChevronRight className="size-3" />
                  <span className="text-foreground font-medium">{title}</span>
                </div>
                <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight">
                  {title}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Updated just now
                </span>
                <Button variant="outline" size="sm" onClick={() => setNotice("View refreshed")}>
                  Refresh <TrendingUp className="size-3.5" />
                </Button>
              </div>
            </div>

            {children({ search: globalSearch, notice, setNotice })}

            <footer className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[11px] text-muted-foreground">
              <span>© 2025 ChurnIQ Platform · Customer Intelligence & Retention</span>
              <div className="flex gap-4">
                <Link to="/info" className="hover:text-foreground">
                  Model documentation
                </Link>
                <a
                  href="https://churniq-analytics.lovable.app"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground text-primary font-medium"
                >
                  Live Lovable Deployment ↗
                </a>
                <span>Dataset: IBM Telco (7,043 rows)</span>
              </div>
            </footer>
          </main>
        </div>

        {notice && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-md border bg-popover px-4 py-3 text-sm shadow-xl animate-in fade-in slide-in-from-bottom-5"
          >
            <Check className="size-4 text-emerald-500" />
            {notice}
            <Button
              variant="ghost"
              size="icon"
              className="-mr-2 ml-2 size-6"
              aria-label="Dismiss"
              onClick={() => setNotice("")}
            >
              <X className="size-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
