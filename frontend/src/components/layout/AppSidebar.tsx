import { Link, useLocation } from "react-router-dom";
import {
  Activity,
  FileSpreadsheet,
  LayoutDashboard,
  Lightbulb,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HealthResponse } from "@/services/api";

const navGroups = [
  {
    label: "WORKSPACE",
    items: [
      { title: "Overview", url: "/", icon: LayoutDashboard },
      { title: "Customers", url: "/customers", icon: Users, badge: "1,418" },
      { title: "Predict churn", url: "/predict", icon: Target },
    ],
  },
  {
    label: "INTELLIGENCE",
    items: [
      { title: "Explainable AI", url: "/explain", icon: Sparkles },
      { title: "Retention", url: "/retention", icon: Lightbulb, badge: "28" },
      { title: "Model performance", url: "/performance", icon: Activity },
    ],
  },
  {
    label: "MANAGE",
    items: [
      { title: "Data & model info", url: "/info", icon: FileSpreadsheet },
      { title: "Settings", url: "/settings", icon: Settings },
    ],
  },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  backendHealth: HealthResponse | null;
}

export function AppSidebar({ collapsed, onToggle, backendHealth }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r bg-card transition-[width] duration-200 lg:flex ${
        collapsed ? "w-[76px]" : "w-[256px]"
      }`}
    >
      <div
        className={`flex h-16 items-center border-b px-5 ${
          collapsed ? "justify-center px-0" : "gap-3"
        }`}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
          <Activity className="size-4" />
        </div>
        {!collapsed && (
          <>
            <span className="font-display text-[17px] font-bold tracking-tight">ChurnIQ</span>
            <Badge variant="secondary" className="ml-auto text-[10px] font-semibold">
              PRO
            </Badge>
          </>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-5">
        {navGroups.map((group) => (
          <div className="mb-6" key={group.label}>
            {!collapsed && (
              <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.12em] text-muted-foreground">
                {group.label}
              </p>
            )}
            <nav className="space-y-1">
              {group.items.map(({ title, url, icon: Icon, badge }) => {
                const isActive =
                  (url === "/" && location.pathname === "/") ||
                  (url !== "/" && location.pathname.startsWith(url));
                return (
                  <Link
                    key={url}
                    to={url}
                    className={`group flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors ${
                      isActive
                        ? "bg-accent font-semibold text-accent-foreground shadow-xs"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="size-4 shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{title}</span>
                        {badge && (
                          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      {!collapsed && (
        <div className="m-3 rounded-md border bg-muted/40 p-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span
              className={`size-2 rounded-full ${
                backendHealth?.status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-emerald-500"
              }`}
            />
            <span className="text-xs font-semibold">
              {backendHealth?.status === "healthy" ? "API Live Connected" : "Model Operational"}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Random Forest v2.4 · 7,043 customers
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">ROC-AUC</span>
            <span className="font-semibold text-primary">0.839</span>
          </div>
        </div>
      )}

      <div className="border-t p-3">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={onToggle}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <>
              <PanelLeftClose className="size-4" />
              <span>Collapse sidebar</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
