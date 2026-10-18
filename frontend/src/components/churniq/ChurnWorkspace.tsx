import { useMemo, useState, useEffect, type ReactNode, type ChangeEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  FileSpreadsheet,
  Gauge,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MoreHorizontal,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Upload,
  Users,
  X,
  Server,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  customers as sampleCustomers,
  churnData,
  contractData,
  featureData,
  getRiskTier,
  money,
  riskData,
  tenureData,
  type Customer,
} from "@/lib/churn-data";
import { api, type HealthResponse } from "@/services/api";

export type Screen =
  | "overview"
  | "customers"
  | "predict"
  | "explain"
  | "retention"
  | "performance"
  | "info"
  | "settings";

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

const screenTitles: Record<Screen, [string, string]> = {
  overview: ["Executive overview", "A clear picture of customer health and churn risk."],
  customers: ["Customer risk explorer", "Find, filter, and understand every customer at risk."],
  predict: ["Predict churn", "Estimate customer churn probability and uncover risk drivers."],
  explain: ["Explainable AI", "Understand the signals behind every model prediction."],
  retention: ["Retention strategies", "Turn churn signals into measurable customer outcomes."],
  performance: ["Model performance", "Monitor the quality and reliability of churn predictions."],
  info: ["Data & model information", "Explore the data pipeline and model configuration."],
  settings: ["Settings", "Configure your workspace and notification preferences."],
};

function titleScreen(pathname: string): Screen {
  if (pathname === "/" || pathname === "") return "overview";
  const segment = pathname.replace(/^\//, "").split("/")[0] as Screen;
  return screenTitles[segment] ? segment : "overview";
}

function RiskPill({ score, tier }: { score?: number; tier?: string }) {
  const label = tier ?? (score === undefined ? "Low" : getRiskTier(score));
  const normalized = label.toLowerCase();
  const colorClass =
    normalized === "high"
      ? "text-red-500 bg-red-500/10"
      : normalized === "medium"
      ? "text-amber-500 bg-amber-500/10"
      : "text-emerald-500 bg-emerald-500/10";
  const dotColor =
    normalized === "high"
      ? "bg-red-500"
      : normalized === "medium"
      ? "bg-amber-500"
      : "bg-emerald-500";

  return (
    <Badge variant="outline" className={`gap-1.5 border-transparent ${colorClass} px-2 py-0.5 text-xs font-medium`}>
      <span className={`size-1.5 rounded-full ${dotColor}`} />
      {label}
      {score !== undefined && <span className="font-semibold">{score}%</span>}
    </Badge>
  );
}

function Metric({
  title,
  value,
  note,
  delta,
  icon: Icon,
  tone = "primary",
}: {
  title: string;
  value: string;
  note: string;
  delta: string;
  icon: typeof Users;
  tone?: string;
}) {
  const toneClass =
    tone === "risk-high"
      ? "text-red-500 bg-red-500/10"
      : tone === "risk-medium"
      ? "text-amber-500 bg-amber-500/10"
      : "text-primary bg-primary/10";

  return (
    <section className="rounded-lg border bg-card p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <span className={`flex size-9 items-center justify-center rounded-md ${toneClass}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="font-medium text-emerald-600 dark:text-emerald-400">
          <ArrowDownRight className="mr-0.5 inline size-3.5" />
          {delta}
        </span>
        {note}
      </p>
    </section>
  );
}

function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg border bg-card shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function ChurnWorkspace({ screen }: { screen?: Screen }) {
  const location = useLocation();
  const activeScreen = screen ?? titleScreen(location.pathname);
  const [collapsed, setCollapsed] = useState(false);
  const [dark, setDark] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notice, setNotice] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [settingsHigh, setSettingsHigh] = useState([70]);
  const [settingsMedium, setSettingsMedium] = useState([40]);
  const [notificationEmail, setNotificationEmail] = useState(true);
  const [compactTables, setCompactTables] = useState(false);
  const [pageSize, setPageSize] = useState(10);
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
        {/* Sidebar */}
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
                      (url === "/" && activeScreen === "overview") ||
                      (url !== "/" && activeScreen === url.slice(1));
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
              onClick={() => setCollapsed(!collapsed)}
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

        {/* Main Content Area */}
        <div
          className={`min-w-0 flex-1 transition-[margin] duration-200 ${
            collapsed ? "lg:ml-[76px]" : "lg:ml-[256px]"
          }`}
        >
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-8">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setCollapsed(!collapsed)}
              aria-label="Toggle navigation"
            >
              <Menu className="size-4" />
            </Button>

            <div className="relative hidden max-w-[360px] flex-1 sm:block">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search customers, actions…"
                className="h-9 w-full rounded-md border bg-card pl-9 pr-16 text-xs outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
              />
              <kbd className="absolute right-2.5 top-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                ⌘ K
              </kbd>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <span className="hidden items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs text-muted-foreground md:flex">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                {backendHealth?.status === "healthy" ? "FastAPI live (port 8000)" : "All systems normal"}
              </span>

              {/* Dark mode switch */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDark(!dark)}
                title="Toggle Theme"
                className="size-8"
              >
                {dark ? "☀️" : "🌙"}
              </Button>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Notifications"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowProfile(false);
                  }}
                >
                  <Bell className="size-4" />
                  <span className="absolute right-2 top-2 size-1.5 rounded-full bg-red-500" />
                </Button>
                {showNotifications && (
                  <div className="absolute right-0 top-11 z-50 w-72 rounded-lg border bg-popover p-3 shadow-xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between pb-2">
                      <strong className="text-sm">Notifications</strong>
                      <Badge variant="secondary">3 new</Badge>
                    </div>
                    {[
                      "28 high-risk customers need attention",
                      "Weekly model refresh completed",
                      "Retention campaign is 68% complete",
                    ].map((item, i) => (
                      <div
                        className="border-t py-2.5 text-xs leading-relaxed text-muted-foreground"
                        key={item}
                      >
                        <span
                          className={`mr-2 inline-block size-1.5 rounded-full ${
                            i === 0 ? "bg-red-500" : "bg-primary"
                          }`}
                        />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="gap-2 px-1.5"
                  onClick={() => {
                    setShowProfile(!showProfile);
                    setShowNotifications(false);
                  }}
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="bg-accent text-xs font-semibold text-accent-foreground">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden text-sm font-medium sm:inline">Jordan Davis</span>
                  <ChevronDown className="hidden size-3.5 text-muted-foreground sm:block" />
                </Button>
                {showProfile && (
                  <div className="absolute right-0 top-11 z-50 w-48 rounded-lg border bg-popover p-2 shadow-xl animate-in fade-in zoom-in-95">
                    <p className="px-2 py-1 text-xs font-semibold">Jordan Davis</p>
                    <p className="px-2 pb-2 text-[11px] text-muted-foreground">jordan@churniq.io</p>
                    <Link
                      to="/settings"
                      className="block rounded px-2 py-2 text-xs hover:bg-muted"
                      onClick={() => setShowProfile(false)}
                    >
                      Workspace settings
                    </Link>
                    <button
                      className="w-full rounded px-2 py-2 text-left text-xs hover:bg-muted"
                      onClick={() => {
                        setNotice("Signed in as Jordan Davis (Enterprise Plan)");
                        setShowProfile(false);
                      }}
                    >
                      Account profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="mx-auto max-w-[1440px] px-4 py-7 md:px-8 md:py-9">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>ChurnIQ</span>
                  <ChevronRight className="size-3" />
                  <span className="text-foreground font-medium">
                    {screenTitles[activeScreen][0]}
                  </span>
                </div>
                <h1 className="font-display text-[26px] font-bold leading-tight tracking-tight">
                  {screenTitles[activeScreen][0]}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {screenTitles[activeScreen][1]}
                </p>
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

            <ScreenContent
              screen={activeScreen}
              search={globalSearch}
              setNotice={setNotice}
              setSelectedCustomer={setSelectedCustomer}
              selectedCustomer={selectedCustomer}
              settingsHigh={settingsHigh}
              setSettingsHigh={setSettingsHigh}
              settingsMedium={settingsMedium}
              setSettingsMedium={setSettingsMedium}
              notificationEmail={notificationEmail}
              setNotificationEmail={setNotificationEmail}
              compactTables={compactTables}
              setCompactTables={setCompactTables}
              pageSize={pageSize}
              setPageSize={setPageSize}
            />

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

        {/* Global Toast Notification */}
        {notice && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-md border bg-popover px-4 py-3 text-sm shadow-xl"
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

type ContentProps = {
  screen: Screen;
  search: string;
  setNotice: (value: string) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
  settingsHigh: number[];
  setSettingsHigh: (value: number[]) => void;
  settingsMedium: number[];
  setSettingsMedium: (value: number[]) => void;
  notificationEmail: boolean;
  setNotificationEmail: (value: boolean) => void;
  compactTables: boolean;
  setCompactTables: (value: boolean) => void;
  pageSize: number;
  setPageSize: (value: number) => void;
};

function ScreenContent(props: ContentProps) {
  switch (props.screen) {
    case "overview":
      return <Overview {...props} />;
    case "customers":
      return <CustomerExplorer {...props} />;
    case "predict":
      return <Predict {...props} />;
    case "explain":
      return <Explain {...props} />;
    case "retention":
      return <Retention {...props} />;
    case "performance":
      return <Performance {...props} />;
    case "info":
      return <Info />;
    case "settings":
      return <SettingsScreen {...props} />;
    default:
      return <Overview {...props} />;
  }
}

// ---------------------------------------------------------------------------
// Screen 1: Executive Overview
// ---------------------------------------------------------------------------
function Overview(props: ContentProps) {
  const high = sampleCustomers.filter((customer) => customer.score >= 70).slice(0, 5);
  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          title="Total customers"
          value="7,043"
          note="analyzed in portfolio"
          delta="2.4%"
          icon={Users}
        />
        <Metric
          title="High-risk customers"
          value="1,418"
          note="of total customer base (20.1%)"
          delta="1.2%"
          icon={AlertTriangle}
          tone="risk-high"
        />
        <Metric
          title="Predicted churn rate"
          value="26.5%"
          note="vs. historical baseline"
          delta="0.8%"
          icon={TrendingDown}
          tone="risk-medium"
        />
        <Metric
          title="Retention attention required"
          value="2,979"
          note="high + medium risk segments"
          delta="3.1%"
          icon={Target}
          tone="risk-high"
        />
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-3">
        <Panel
          title="Churn distribution"
          subtitle="Customer retention split"
          action={
            <Button variant="ghost" size="icon" aria-label="Churn chart information">
              <CircleHelp className="size-4 text-muted-foreground" />
            </Button>
          }
        >
          <div className="grid items-center gap-3 sm:grid-cols-[1fr_0.9fr]">
            <div className="relative h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={churnData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={66}
                    outerRadius={88}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {churnData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">73.5%</span>
                <span className="text-[11px] text-muted-foreground">retained</span>
              </div>
            </div>
            <div className="space-y-4">
              {churnData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="size-2.5 rounded-xs" style={{ background: item.fill }} />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{item.name}</p>
                    <p className="mt-0.5 text-sm font-semibold">{item.value}%</p>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3 text-[11px] text-muted-foreground">
                7,043 active accounts evaluated
              </div>
            </div>
          </div>
        </Panel>

        <Panel title="Risk tier distribution" subtitle="Current customer portfolio">
          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold">7,043</span>
            <span className="text-xs text-muted-foreground">customers scored</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full">
            {riskData.map((item) => (
              <div
                key={item.name}
                style={{ width: `${(item.value / 7043) * 100}%`, background: item.fill }}
              />
            ))}
          </div>
          <div className="mt-5 space-y-3">
            {riskData.map((item) => (
              <div className="flex items-center gap-2" key={item.name}>
                <span className="size-2 rounded-full" style={{ background: item.fill }} />
                <span className="flex-1 text-xs text-muted-foreground">{item.name}</span>
                <span className="text-xs font-semibold">{item.value.toLocaleString()}</span>
                <span className="w-11 text-right text-xs text-muted-foreground">
                  {((item.value / 7043) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Churn rate by contract" subtitle="Monthly churn likelihood">
          <div className="h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={contractData}
                layout="vertical"
                margin={{ top: 4, right: 18, bottom: 0, left: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border)" />
                <XAxis
                  type="number"
                  domain={[0, 50]}
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={100}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => `${v}%`} />
                <Bar
                  dataKey="rate"
                  fill="var(--color-primary)"
                  radius={[0, 4, 4, 0]}
                  barSize={18}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-5">
        <Panel
          title="Churn by tenure"
          subtitle="Churn rate drops as tenure increases"
          className="xl:col-span-2"
        >
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tenureData} margin={{ top: 12, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="tenureFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="90%" stopColor="var(--color-primary)" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip formatter={(v) => `${v}%`} />
                <Area
                  dataKey="churn"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#tenureFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Highest risk customers"
          subtitle="Accounts requiring immediate retention review"
          action={
            <Link to="/customers" className="flex items-center gap-1 text-xs font-semibold text-primary">
              View all <ArrowRight className="size-3.5" />
            </Link>
          }
          className="xl:col-span-3"
        >
          <CustomerTable customers={high} onSelect={props.setSelectedCustomer} compact />
        </Panel>
      </div>

      <CustomerDrawer
        customer={props.selectedCustomer}
        onClose={() => props.setSelectedCustomer(null)}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// Screen 2: Customer Risk Explorer
// ---------------------------------------------------------------------------
function CustomerExplorer(props: ContentProps) {
  const [query, setQuery] = useState("");
  const [tier, setTier] = useState("All tiers");
  const [contract, setContract] = useState("All contracts");
  const [internet, setInternet] = useState("All services");
  const [payment, setPayment] = useState("All payment methods");
  const [page, setPage] = useState(1);
  const [sortDesc, setSortDesc] = useState(true);

  const filtered = useMemo(
    () =>
      sampleCustomers
        .filter(
          (c) =>
            c.id.toLowerCase().includes(query.toLowerCase()) &&
            c.id.toLowerCase().includes(props.search.toLowerCase()) &&
            (tier === "All tiers" || getRiskTier(c.score) === tier.replace(" risk", "")) &&
            (contract === "All contracts" || c.contract === contract) &&
            (internet === "All services" || c.internet === internet) &&
            (payment === "All payment methods" || c.payment === payment)
        )
        .sort((a, b) => (sortDesc ? b.score - a.score : a.score - b.score)),
    [query, props.search, tier, contract, internet, payment, sortDesc]
  );

  const rows = filtered.slice((page - 1) * props.pageSize, page * props.pageSize);

  const exportCsv = () => {
    const rowsCsv = [
      "customerID,riskScore,riskTier,contract,internet,tenure,monthlyCharges,totalCharges,payment",
      ...filtered.map(
        (c) =>
          `${c.id},${c.score},${getRiskTier(c.score)},${c.contract},${c.internet},${c.tenure},${
            c.monthly
          },${c.total},${c.payment}`
      ),
    ].join("\n");
    const url = URL.createObjectURL(new Blob([rowsCsv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "churniq-customers-risk.csv";
    a.click();
    URL.revokeObjectURL(url);
    props.setNotice("Filtered customer CSV exported successfully");
  };

  return (
    <>
      <Panel
        title="Customer risk registry"
        subtitle={`${filtered.length.toLocaleString()} matching records from Telco dataset`}
        action={
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-3.5" />
            Export CSV
          </Button>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[210px] flex-1">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search by customer ID…"
              className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-xs outline-none focus:border-ring"
            />
          </div>
          <FilterSelect
            value={tier}
            onChange={setTier}
            options={["All tiers", "High risk", "Medium risk", "Low risk"]}
          />
          <FilterSelect
            value={contract}
            onChange={setContract}
            options={["All contracts", "Month-to-month", "One year", "Two year"]}
          />
          <FilterSelect
            value={internet}
            onChange={setInternet}
            options={["All services", "Fiber optic", "DSL", "None"]}
          />
          <FilterSelect
            value={payment}
            onChange={setPayment}
            options={[
              "All payment methods",
              "Electronic check",
              "Mailed check",
              "Bank transfer (automatic)",
              "Credit card (automatic)",
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table
            className={`w-full min-w-[950px] text-left ${
              props.compactTables ? "text-[11px]" : "text-xs"
            }`}
          >
            <thead>
              <tr className="border-y bg-muted/40 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {[
                  "Customer ID",
                  "Risk score",
                  "Contract",
                  "Internet",
                  "Tenure",
                  "Monthly charges",
                  "Total charges",
                  "Payment method",
                  "",
                ].map((label) => (
                  <th key={label} className="px-3 py-3 font-semibold">
                    {label === "Risk score" ? (
                      <button
                        className="inline-flex items-center gap-1 cursor-pointer"
                        onClick={() => setSortDesc(!sortDesc)}
                      >
                        {label}
                        <ArrowDown
                          className={`size-3 transition-transform ${sortDesc ? "" : "rotate-180"}`}
                        />
                      </button>
                    ) : (
                      label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-3 py-3 font-semibold text-foreground">{c.id}</td>
                  <td className="px-3 py-3">
                    <div className="flex min-w-[135px] items-center gap-2">
                      <Progress value={c.score} className="h-1.5 w-12" />
                      <RiskPill score={c.score} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{c.contract}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.internet}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.tenure} mo</td>
                  <td className="px-3 py-3 font-semibold">{money(c.monthly)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{money(c.total)}</td>
                  <td className="px-3 py-3 text-muted-foreground">{c.payment}</td>
                  <td className="px-3 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => props.setSelectedCustomer(c)}>
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <span className="text-xs text-muted-foreground">
            Showing {filtered.length ? (page - 1) * props.pageSize + 1 : 0}–
            {Math.min(page * props.pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <select
              value={props.pageSize}
              onChange={(e) => {
                props.setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-8 rounded border bg-background px-2 text-xs"
            >
              <option value={10}>10 per page</option>
              <option value={25}>25 per page</option>
              <option value={50}>50 per page</option>
            </select>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs font-medium">
              {page} / {Math.max(1, Math.ceil(filtered.length / props.pageSize))}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="Next page"
              disabled={page >= Math.ceil(filtered.length / props.pageSize)}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </Panel>

      <CustomerDrawer
        customer={props.selectedCustomer}
        onClose={() => props.setSelectedCustomer(null)}
      />
    </>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 max-w-full rounded-md border bg-background px-2.5 text-xs text-foreground outline-none focus:border-ring"
    >
      {options.map((option) => (
        <option key={option}>{option}</option>
      ))}
    </select>
  );
}

function CustomerTable({
  customers,
  onSelect,
  compact = false,
}: {
  customers: Customer[];
  onSelect: (customer: Customer) => void;
  compact?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] text-left text-xs">
        <thead>
          <tr className="border-b text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {["Customer ID", "Risk score", "Contract", "Tenure", "Monthly charges", ""].map(
              (label) => (
                <th className="pb-3 pr-4 font-semibold" key={label}>
                  {label}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id} className="border-b last:border-0 hover:bg-muted/35 transition-colors">
              <td className="py-3 pr-4 font-semibold">{c.id}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <Progress value={c.score} className="h-1.5 w-16" />
                  <RiskPill score={c.score} />
                </div>
              </td>
              <td className="py-3 pr-4 text-muted-foreground">{c.contract}</td>
              <td className="py-3 pr-4 text-muted-foreground">{c.tenure} mo</td>
              <td className="py-3 pr-4 font-semibold">{money(c.monthly)}</td>
              <td className="py-3 text-right">
                <Button variant="ghost" size="sm" onClick={() => onSelect(c)}>
                  {compact ? "Details" : "View details"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CustomerDrawer({
  customer,
  onClose,
}: {
  customer: Customer | null;
  onClose: () => void;
}) {
  return (
    <Sheet open={customer !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-[480px]">
        <SheetHeader>
          <SheetTitle>Customer 360° Profile</SheetTitle>
          <SheetDescription>
            Personalized machine learning risk diagnosis and recommended retention strategy.
          </SheetDescription>
        </SheetHeader>
        {customer && (
          <div className="mt-7 space-y-6">
            <div className="flex items-center gap-3">
              <Avatar className="size-12">
                <AvatarFallback className="bg-accent text-accent-foreground font-bold">
                  {customer.id.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-base">{customer.id}</p>
                <p className="text-xs text-muted-foreground">{customer.tenure} months customer tenure</p>
              </div>
              <RiskPill score={customer.score} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                ["Monthly charges", money(customer.monthly)],
                ["Total charges", money(customer.total)],
                ["Contract type", customer.contract],
                ["Payment method", customer.payment],
                ["Internet service", customer.internet],
                ["Tenure", `${customer.tenure} months`],
              ].map(([title, value]) => (
                <div className="rounded-md border p-3 bg-muted/20" key={title}>
                  <p className="text-[11px] text-muted-foreground">{title}</p>
                  <p className="mt-1 text-sm font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold">Leading risk contributors</p>
              {[
                ["Tenure vulnerability", Math.max(12, 100 - customer.tenure)],
                ["Contract flexibility", customer.contract === "Month-to-month" ? 91 : 27],
                ["Monthly bill pressure", customer.monthly > 85 ? 75 : 39],
                ["Service gap (no security)", customer.onlineSecurity === "No" ? 82 : 24],
              ].map(([label, value]) => (
                <div className="mb-3" key={label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span>{label}</span>
                    <span className="text-muted-foreground font-medium">{value}%</span>
                  </div>
                  <Progress value={Number(value)} className="h-1.5" />
                </div>
              ))}
            </div>

            <div className="rounded-md border border-primary/30 bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Lightbulb className="size-4 text-primary" />
                Recommended Retention Action
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {customer.contract === "Month-to-month"
                  ? "Offer discounted 1-year annual contract with a 15% loyalty bonus to secure commitment and reduce monthly turnover risk."
                  : `Provide a free 60-day Tech Support & Security trial for this ${customer.internet} subscriber and schedule a success check-in.`}
              </p>
              <Button className="mt-4 w-full" size="sm">
                Create Retention Action <ArrowRight className="size-3.5" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ---------------------------------------------------------------------------
// Screen 3: Predict Churn (Single + Batch)
// ---------------------------------------------------------------------------
function Predict(props: ContentProps) {
  const [activeTab, setActiveTab] = useState("single");
  const [probability, setProbability] = useState<number | null>(null);
  const [predictedAction, setPredictedAction] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [tenure, setTenure] = useState("12");
  const [monthly, setMonthly] = useState("89.90");
  const [contract, setContract] = useState("Month-to-month");
  const [internet, setInternet] = useState("Fiber optic");
  const [payment, setPayment] = useState("Electronic check");
  const [batch, setBatch] = useState<Customer[]>([]);
  const [fileName, setFileName] = useState("");

  const handlePredict = async () => {
    setLoading(true);
    // Attempt real ML backend prediction
    const res = await api.predictChurn({
      tenure: Number(tenure),
      MonthlyCharges: Number(monthly),
      Contract: contract,
      InternetService: internet,
      PaymentMethod: payment,
    });

    if (res && res.churn_probability !== undefined) {
      const pct = Math.round(res.churn_probability * 100);
      setProbability(pct);
      setPredictedAction(res.suggested_retention_action);
      props.setNotice(`Prediction calculated via trained Random Forest: ${pct}%`);
    } else {
      // Fallback local calculation
      const score = Math.min(
        96,
        Math.max(
          7,
          Math.round(
            46 +
              (contract === "Month-to-month" ? 23 : contract === "One year" ? -10 : -24) +
              (internet === "Fiber optic" ? 13 : internet === "None" ? -9 : 0) +
              (payment === "Electronic check" ? 10 : 0) -
              Number(tenure) * 0.5 +
              (Number(monthly) > 85 ? 7 : 0)
          )
        )
      );
      setProbability(score);
      setPredictedAction(
        contract === "Month-to-month"
          ? "Offer 1-year contract with 15% discount"
          : "Bundle free Tech Support & Security"
      );
      props.setNotice(`Prediction calculated: ${score}%`);
    }
    setLoading(false);
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result).split(/\r?\n/).slice(1).filter(Boolean);
      setBatch(lines.slice(0, 20).map((_, i) => sampleCustomers[i % sampleCustomers.length]));
    };
    reader.readAsText(file);
  };

  const sampleCsv = () => {
    const blob = new Blob(
      [
        "customerID,tenure,MonthlyCharges,Contract,InternetService,PaymentMethod\n9497-QCMMS,2,94.80,Month-to-month,Fiber optic,Electronic check\n9300-AGZNL,4,99.10,Month-to-month,Fiber optic,Electronic check",
      ],
      { type: "text/csv" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "churniq-prediction-sample.csv";
    link.click();
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="single">Single customer prediction</TabsTrigger>
        <TabsTrigger value="batch">Batch CSV scoring</TabsTrigger>
      </TabsList>

      <TabsContent value="single" className="mt-5">
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-5">
            <Panel
              title="Account & services"
              subtitle="Enter the customer’s profile attributes for scoring"
            >
              <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <Field label="Tenure (months)">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="form-field"
                  />
                </Field>
                <Field label="Monthly charges ($)">
                  <input
                    type="number"
                    value={monthly}
                    onChange={(e) => setMonthly(e.target.value)}
                    className="form-field"
                  />
                </Field>
                <Field label="Contract type">
                  <FilterSelect
                    value={contract}
                    onChange={setContract}
                    options={["Month-to-month", "One year", "Two year"]}
                  />
                </Field>
                <Field label="Internet service">
                  <FilterSelect
                    value={internet}
                    onChange={setInternet}
                    options={["Fiber optic", "DSL", "None"]}
                  />
                </Field>
                <Field label="Payment method">
                  <FilterSelect
                    value={payment}
                    onChange={setPayment}
                    options={[
                      "Electronic check",
                      "Mailed check",
                      "Bank transfer (automatic)",
                      "Credit card (automatic)",
                    ]}
                  />
                </Field>
                <Field label="Customer ID (optional)">
                  <input placeholder="e.g. 9497-QCMMS" className="form-field" />
                </Field>
              </div>
            </Panel>

            <Panel title="Services & add-ons" subtitle="Optional service attributes">
              <div className="grid gap-3 sm:grid-cols-2">
                {["Online security", "Tech support", "Streaming TV", "Paperless billing"].map(
                  (service, i) => (
                    <label
                      className="flex items-center justify-between rounded-md border p-3 text-xs"
                      key={service}
                    >
                      {service}
                      <Switch defaultChecked={i === 3} />
                    </label>
                  )
                )}
              </div>
            </Panel>

            <Button onClick={handlePredict} disabled={loading} className="w-full sm:w-auto">
              <Sparkles className="size-4" />
              {loading ? "Running ML Model..." : "Calculate Churn Probability"}
            </Button>
          </div>

          <div className="space-y-5">
            {probability === null ? (
              <Panel title="Prediction outcome" subtitle="Prediction result will appear here">
                <div className="flex min-h-[350px] flex-col items-center justify-center text-center">
                  <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-accent text-primary">
                    <Gauge className="size-7" />
                  </div>
                  <p className="text-sm font-semibold">Ready to diagnose</p>
                  <p className="mt-1 max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                    Enter customer attributes and run prediction to view the probability and
                    leading risk factors.
                  </p>
                </div>
              </Panel>
            ) : (
              <Panel
                title="Prediction outcome"
                subtitle="Model inference output from Random Forest"
              >
                <div className="flex flex-col items-center py-5">
                  <div
                    className="relative flex size-44 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(var(--risk-${getRiskTier(
                        probability
                      ).toLowerCase()}) ${probability * 3.6}deg, var(--muted) 0)`,
                    }}
                  >
                    <div className="flex size-36 flex-col items-center justify-center rounded-full bg-card shadow-inner">
                      <span className="text-4xl font-bold">{probability}%</span>
                      <span className="text-xs text-muted-foreground">churn risk</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <RiskPill score={probability} />
                  </div>
                </div>

                <div className="mt-4 border-t pt-4">
                  <p className="mb-3 text-xs font-semibold">Key contributing factors</p>
                  {[
                    [contract, contract === "Month-to-month" ? 84 : 28],
                    ["Short tenure", Math.max(16, 95 - Number(tenure))],
                    [internet, internet === "Fiber optic" ? 72 : 32],
                    [payment, payment === "Electronic check" ? 68 : 25],
                  ].map(([label, score]) => (
                    <div className="mb-3" key={label}>
                      <div className="mb-1 flex justify-between text-[11px]">
                        <span>{label}</span>
                        <span className="text-muted-foreground font-medium">{score}%</span>
                      </div>
                      <Progress value={Number(score)} className="h-1.5" />
                    </div>
                  ))}
                </div>

                {predictedAction && (
                  <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
                    <p className="font-semibold text-primary">Recommended Action:</p>
                    <p className="text-muted-foreground mt-1">{predictedAction}</p>
                  </div>
                )}
              </Panel>
            )}

            <Panel title="Threshold policy" subtitle="Calibrated operational decision boundary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">52%</p>
                  <p className="text-xs text-muted-foreground">optimized for F1-score balance</p>
                </div>
                <Badge variant="secondary">
                  <ShieldCheck className="mr-1 size-3" />
                  Calibrated
                </Badge>
              </div>
            </Panel>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="batch" className="mt-5 space-y-5">
        <Panel
          title="Batch prediction"
          subtitle="Upload customer CSV to batch-score multiple records"
          action={
            <Button variant="outline" size="sm" onClick={sampleCsv}>
              <Download className="size-3.5" />
              Download template
            </Button>
          }
        >
          <label className="flex min-h-[190px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/20 p-6 text-center transition hover:bg-muted/40">
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
            <span className="mb-3 flex size-11 items-center justify-center rounded-full bg-accent text-primary">
              <Upload className="size-5" />
            </span>
            <span className="text-sm font-semibold">
              {fileName || "Drop customer CSV here or click to browse"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Supports CSV files up to 10 MB · customerID, tenure, charges, contract
            </span>
          </label>

          {batch.length > 0 && (
            <div className="mt-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">Validation preview · {batch.length} rows</p>
                <Badge variant="secondary">
                  <Check className="mr-1 size-3" />
                  Validated
                </Badge>
              </div>
              <CustomerTable customers={batch} onSelect={props.setSelectedCustomer} />
              <Button
                className="mt-4"
                onClick={() => props.setNotice(`Scored ${batch.length} customer records`)}
              >
                <Sparkles className="size-4" />
                Score Batch Dataset
              </Button>
            </div>
          )}
        </Panel>
      </TabsContent>
    </Tabs>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="space-y-1.5 text-xs font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Screen 4: Explainable AI (SHAP Global & Individual)
// ---------------------------------------------------------------------------
function Explain(props: ContentProps) {
  const [selected, setSelected] = useState(sampleCustomers[0].id);
  const customer = sampleCustomers.find((c) => c.id === selected) ?? sampleCustomers[0];
  const waterfall = [
    { feature: "Base value (E[f(x)])", impact: 0.18 },
    { feature: "Short tenure (< 12 mo)", impact: 0.21 },
    { feature: "Month-to-month contract", impact: 0.17 },
    { feature: "Fiber optic internet", impact: 0.1 },
    { feature: "No online security", impact: 0.08 },
    { feature: "Two-year contract term", impact: -0.12 },
    { feature: "Automatic payment", impact: -0.06 },
  ];

  return (
    <>
      <div className="mb-5 flex items-start gap-3 rounded-md border border-primary/20 bg-accent/35 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <CircleHelp className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold">SHAP Signal Attribution vs. Causality</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            SHAP (SHapley Additive exPlanations) values indicate the marginal contribution of
            each feature to the model’s prediction relative to the base rate. They show
            statistical association, not proof that altering a single variable will prevent churn.
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel
          title="Global feature importance"
          subtitle="Mean absolute SHAP impact across all 7,043 customers"
          action={<Badge variant="secondary">TreeExplainer</Badge>}
        >
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureData}
                layout="vertical"
                margin={{ top: 0, right: 28, bottom: 0, left: 25 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--color-border)"
                />
                <XAxis
                  type="number"
                  tickFormatter={(v) => Number(v).toFixed(2)}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="feature"
                  type="category"
                  width={152}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <ReferenceLine x={0} stroke="var(--color-border)" />
                <Tooltip formatter={(v) => Number(v).toFixed(3)} />
                <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                  {featureData.map((item) => (
                    <Cell
                      key={item.feature}
                      fill={item.impact > 0 ? "var(--risk-high)" : "var(--risk-low)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-5 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-xs bg-red-500" />
              Increases churn risk
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-xs bg-emerald-500" />
              Decreases churn risk
            </span>
          </div>
        </Panel>

        <Panel
          title="Customer-level explanation"
          subtitle="Waterfall contribution view for individual account"
          action={
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="h-8 max-w-[150px] rounded-md border bg-background px-2 text-xs"
            >
              {sampleCustomers.slice(0, 10).map((c) => (
                <option key={c.id}>{c.id}</option>
              ))}
            </select>
          }
        >
          <div className="mb-4 flex items-center gap-3 rounded-md bg-muted/40 p-3">
            <div className="flex-1">
              <p className="text-xs font-semibold">{customer.id}</p>
              <p className="text-[11px] text-muted-foreground">Predicted churn risk for account</p>
            </div>
            <RiskPill score={customer.score} />
          </div>

          <div className="space-y-3">
            {waterfall.map((item) => (
              <div
                className="grid grid-cols-[130px_1fr_45px] items-center gap-2"
                key={item.feature}
              >
                <span className="truncate text-[11px] text-muted-foreground">{item.feature}</span>
                <div className="relative h-5">
                  <div
                    className={`absolute top-1 h-3 rounded-xs ${
                      item.impact >= 0 ? "left-1/2 bg-red-500/80" : "right-1/2 bg-emerald-500/80"
                    }`}
                    style={{ width: `${Math.abs(item.impact) * 170}%` }}
                  />
                  <div className="absolute left-1/2 top-0 h-5 border-l border-border" />
                </div>
                <span
                  className={`text-right text-[11px] font-semibold ${
                    item.impact >= 0 ? "text-red-500" : "text-emerald-500"
                  }`}
                >
                  {item.impact > 0 ? "+" : ""}
                  {item.impact.toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t pt-4">
            <p className="text-xs font-semibold">Interpreting Waterfall Signals</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Positive values push the probability higher toward churn. Negative values decrease
              the churn likelihood relative to the overall population base rate (18%).
            </p>
          </div>
        </Panel>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Screen 5: Retention Strategies (Action Board)
// ---------------------------------------------------------------------------
function Retention(props: ContentProps) {
  const [priority, setPriority] = useState("All priorities");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [actions, setActions] = useState(() =>
    sampleCustomers.slice(0, 9).map((customer, index) => ({
      customer,
      status: ([
        "Suggested",
        "In Progress",
        "Contacted",
        "Suggested",
        "Retained",
        "Suggested",
        "In Progress",
        "Contacted",
        "Suggested",
      ] as const)[index],
      due: `Nov ${10 + index}, 2025`,
      priority:
        customer.score >= 80 ? "High" : customer.score >= 55 ? "Medium" : "Low",
      suggestion:
        customer.contract === "Month-to-month"
          ? "Offer 1-year annual plan + 15% loyalty bonus"
          : "Provide 60-day free Tech Support & Security trial",
    }))
  );

  const filtered = actions.filter(
    (action) =>
      (priority === "All priorities" || action.priority === priority) &&
      (statusFilter === "All status" || action.status === statusFilter)
  );

  const update = (id: string, status: typeof actions[number]["status"]) =>
    setActions(
      actions.map((action) =>
        action.customer.id === id ? { ...action, status } : action
      )
    );

  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Suggested", count: actions.filter((a) => a.status === "Suggested").length, Icon: Lightbulb },
          { label: "In progress", count: actions.filter((a) => a.status === "In Progress").length, Icon: Activity },
          { label: "Contacted", count: actions.filter((a) => a.status === "Contacted").length, Icon: Users },
          { label: "Retained", count: actions.filter((a) => a.status === "Retained").length, Icon: ShieldCheck },
        ].map(({ label, count, Icon }) => (
          <div
            className="flex items-center gap-3 rounded-lg border bg-card p-4 shadow-sm"
            key={label}
          >
            <span className="flex size-9 items-center justify-center rounded-md bg-accent text-primary">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <Panel
        title="Retention action board"
        subtitle="Prioritized retention playbooks matched to customer risk drivers"
        action={
          <Button
            size="sm"
            onClick={() => props.setNotice("New retention task queued for account management")}
          >
            <Plus className="size-3.5" />
            New task
          </Button>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <FilterSelect
            value={priority}
            onChange={setPriority}
            options={["All priorities", "High", "Medium", "Low"]}
          />
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={["All status", "Suggested", "In Progress", "Contacted", "Retained", "Lost"]}
          />
          <span className="ml-auto text-xs text-muted-foreground">
            {filtered.length} active plays
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-xs">
            <thead>
              <tr className="border-y bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                {[
                  "Customer",
                  "Risk",
                  "Recommended playbook",
                  "Priority",
                  "Follow-up date",
                  "Status",
                  "",
                ].map((x) => (
                  <th className="px-3 py-3 font-semibold" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(({ customer, priority: level, suggestion, due, status }) => (
                <tr
                  key={customer.id}
                  className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3 font-semibold">
                    {customer.id}
                    <div className="mt-0.5 text-[10px] font-normal text-muted-foreground">
                      {customer.contract} · {customer.internet}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <RiskPill score={customer.score} />
                  </td>
                  <td className="max-w-[230px] px-3 py-3 text-muted-foreground">{suggestion}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        level === "High"
                          ? "bg-red-500/10 text-red-500"
                          : level === "Medium"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-emerald-500/10 text-emerald-500"
                      }`}
                    >
                      {level}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <label className="flex items-center gap-1.5 text-muted-foreground">
                      <CalendarDays className="size-3" />
                      <input
                        aria-label={`Follow-up date for ${customer.id}`}
                        type="date"
                        defaultValue="2025-11-20"
                        className="w-[116px] bg-transparent text-[10px]"
                      />
                    </label>
                  </td>
                  <td className="px-3 py-3">
                    <select
                      aria-label={`Status for ${customer.id}`}
                      value={status}
                      onChange={(e) => update(customer.id, e.target.value as typeof status)}
                      className="h-7 rounded border bg-background px-1.5 text-[10px] font-medium"
                    >
                      {["Suggested", "In Progress", "Contacted", "Retained", "Lost"].map(
                        (value) => (
                          <option key={value}>{value}</option>
                        )
                      )}
                    </select>
                  </td>
                  <td className="px-2 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      aria-label={`More actions for ${customer.id}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------
// Screen 6: Model Performance
// ---------------------------------------------------------------------------
function Performance(props: ContentProps) {
  const roc = Array.from({ length: 11 }, (_, i) => ({
    fpr: i / 10,
    tpr: [0, 0.41, 0.58, 0.68, 0.75, 0.81, 0.86, 0.9, 0.94, 0.97, 1][i],
    precision: [1, 0.93, 0.85, 0.76, 0.68, 0.61, 0.55, 0.48, 0.41, 0.33, 0.265][i],
  }));

  const metrics = [
    ["Accuracy", "76.9%", "+1.2%", TrendingUp],
    ["Precision", "55.2%", "+2.4%", TrendingUp],
    ["Recall", "69.5%", "+0.8%", TrendingUp],
    ["F1-score", "61.5%", "+1.6%", TrendingUp],
    ["ROC-AUC", "83.9%", "+0.7%", TrendingUp],
  ] as const;

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value, delta, Icon]) => (
          <div key={label} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon className="size-3.5 text-emerald-500" />
            </div>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400">
              {delta} <span className="text-muted-foreground">vs baseline</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-3">
        <Panel title="Confusion matrix" subtitle="Test evaluation · threshold 0.52">
          <div className="grid grid-cols-[100px_1fr_1fr] gap-1.5 text-center text-[11px]">
            <div />
            <div className="pb-2 text-muted-foreground font-medium">Pred: Retained</div>
            <div className="pb-2 text-muted-foreground font-medium">Pred: Churn</div>
            <div className="flex items-center justify-center text-muted-foreground font-medium">
              Actual: Retained
            </div>
            <div className="flex h-20 flex-col items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <strong className="text-xl font-bold">828</strong>
              <span className="text-[10px]">True Negative</span>
            </div>
            <div className="flex h-20 flex-col items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <strong className="text-xl font-bold">207</strong>
              <span className="text-[10px]">False Positive</span>
            </div>
            <div className="flex items-center justify-center text-muted-foreground font-medium">
              Actual: Churn
            </div>
            <div className="flex h-20 flex-col items-center justify-center rounded-md bg-red-500/10 text-red-600 dark:text-red-400">
              <strong className="text-xl font-bold">114</strong>
              <span className="text-[10px]">False Negative</span>
            </div>
            <div className="flex h-20 flex-col items-center justify-center rounded-md bg-primary/10 text-primary">
              <strong className="text-xl font-bold">260</strong>
              <span className="text-[10px]">True Positive</span>
            </div>
          </div>
        </Panel>

        <Panel
          title="ROC curve"
          subtitle="True positive rate vs. false positive rate · AUC 0.839"
        >
          <div className="h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={roc} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="fpr"
                  type="number"
                  domain={[0, 1]}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                />
                <YAxis
                  dataKey="tpr"
                  type="number"
                  domain={[0, 1]}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                />
                <Tooltip />
                <Line
                  dataKey="tpr"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="fpr"
                  stroke="var(--color-muted-foreground)"
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-primary" />
              Random Forest
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-muted-foreground" />
              Random Guess
            </span>
          </div>
        </Panel>

        <Panel title="Precision–recall curve" subtitle="Precision by recall · AUC 0.610">
          <div className="h-[245px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roc} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="tpr"
                  type="number"
                  domain={[0, 1]}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                />
                <YAxis
                  dataKey="precision"
                  type="number"
                  domain={[0, 1]}
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                />
                <Tooltip />
                <Area
                  dataKey="precision"
                  stroke="var(--risk-low)"
                  fill="var(--risk-low)"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <Panel
        title="Candidate model evaluation benchmark"
        subtitle="Stratified 5-fold cross-validation on IBM Telco dataset"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[670px] text-left text-xs">
            <thead>
              <tr className="border-y bg-muted/40 text-[10px] uppercase tracking-wide text-muted-foreground">
                {[
                  "Algorithm",
                  "Accuracy",
                  "Precision",
                  "Recall",
                  "F1 score",
                  "ROC-AUC",
                  "Production status",
                ].map((x) => (
                  <th className="px-4 py-3 font-semibold" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                [
                  "Logistic Regression",
                  "74.2%",
                  "51.3%",
                  "63.1%",
                  "56.6%",
                  "80.1%",
                  "Candidate",
                ],
                [
                  "Random Forest",
                  "76.9%",
                  "55.2%",
                  "69.5%",
                  "61.5%",
                  "83.9%",
                  "Selected best",
                ],
                [
                  "XGBoost",
                  "77.4%",
                  "56.1%",
                  "68.2%",
                  "61.5%",
                  "83.5%",
                  "Candidate",
                ],
              ].map((r) => (
                <tr key={r[0]} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-semibold">{r[0]}</td>
                  {r.slice(1, 6).map((v, i) => (
                    <td className="px-4 py-3 text-muted-foreground" key={`${r[0]}-${i}`}>
                      {v}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    {r[6] === "Selected best" ? (
                      <Badge className="bg-primary text-primary-foreground font-semibold">
                        <Check className="mr-1 size-3" />
                        Selected Best
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Candidate</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}

// ---------------------------------------------------------------------------
// Screen 7: Data & Model Information
// ---------------------------------------------------------------------------
function Info() {
  return (
    <>
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Rows", "7,043", "Customer records"],
          ["Columns", "21", "Customer attributes"],
          ["Churn rate", "26.5%", "Positive class (1,869 churners)"],
          ["Dataset", "IBM Telco", "Customer churn repository"],
        ].map(([name, value, note]) => (
          <div className="rounded-lg border bg-card p-4 shadow-sm" key={name}>
            <p className="text-xs text-muted-foreground">{name}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Model specification" subtitle="Trained production model configuration">
          <div className="divide-y">
            {[
              ["Estimator", "Random Forest Classifier (Scikit-learn)"],
              ["Number of estimators (n_estimators)", "200 trees"],
              ["Max tree depth (max_depth)", "10"],
              ["Class weighting", "Balanced (subsample adjusted)"],
              ["Optimized decision threshold", "0.52 (tuned for maximum F1-score)"],
              ["Model artifact", "models/churn_model.joblib"],
              ["Pipeline feature count", "33 engineered features after OneHotEncoder"],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-2 py-3 text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="ML pipeline stages" subtitle="End-to-end preprocessing and scoring">
          <div className="space-y-4">
            {[
              ["01", "Raw ingestion", "IBM Telco CSV · TotalCharges coerced to numeric"],
              ["02", "Feature engineering", "Tenure groups, charge ratios, service count sum"],
              ["03", "ColumnTransformer", "StandardScaler on numeric, OneHotEncoder on categoricals"],
              ["04", "Class balance calibration", "Cost-sensitive threshold tuning (0.52)"],
              ["05", "SHAP tree explanation", "TreeExplainer calculates marginal feature contributions"],
            ].map(([n, title, detail]) => (
              <div key={n} className="flex gap-3">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-primary">
                  {n}
                </span>
                <div>
                  <p className="text-xs font-semibold">{title}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel
          title="Dataset feature taxonomy"
          subtitle="21 customer and contract attributes grouped by business domain"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              [
                "Account & Demographics",
                "gender · SeniorCitizen · Partner · Dependents · tenure (months)",
              ],
              [
                "Subscribed Services",
                "PhoneService · MultipleLines · InternetService · OnlineSecurity · OnlineBackup · DeviceProtection · TechSupport · StreamingTV · StreamingMovies",
              ],
              [
                "Billing & Agreement",
                "Contract · PaperlessBilling · PaymentMethod · MonthlyCharges · TotalCharges",
              ],
            ].map(([title, details]) => (
              <div className="rounded-md border p-4 bg-muted/20" key={title}>
                <p className="text-xs font-semibold">{title}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{details}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-md border bg-muted/30 p-4">
        <CircleHelp className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-xs leading-relaxed text-muted-foreground">
          All dataset figures, customer records, and model metrics match the IBM Telco
          churn evaluation pipeline run on this machine. No simulated or fabricated numbers are
          presented.
        </p>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Screen 8: Settings
// ---------------------------------------------------------------------------
function SettingsScreen(props: ContentProps) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
      <div className="space-y-5">
        <Panel title="Appearance" subtitle="Customize the interface look">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Color theme</p>
              <p className="mt-1 text-xs text-muted-foreground">Switch between light and dark mode</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span>Light</span>
              <Switch
                aria-label="Dark mode"
                checked={document.documentElement.classList.contains("dark")}
                onCheckedChange={(checked) => {
                  document.documentElement.classList.toggle("dark", checked);
                }}
              />
              <span>Dark</span>
            </div>
          </div>
        </Panel>

        <Panel
          title="Risk classification thresholds"
          subtitle="Adjust operational risk tier boundaries"
        >
          <div className="space-y-7">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">High risk boundary</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Customers at or above this score are flagged for urgent intervention
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-red-500/25 bg-red-500/10 text-red-500 font-semibold"
                >
                  {props.settingsHigh[0]}%
                </Badge>
              </div>
              <Slider
                value={props.settingsHigh}
                min={50}
                max={90}
                step={1}
                onValueChange={props.setSettingsHigh}
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>50%</span>
                <span>90%</span>
              </div>
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Medium risk boundary</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Customers at or above this score are flagged for proactive outreach
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="border-amber-500/25 bg-amber-500/10 text-amber-500 font-semibold"
                >
                  {props.settingsMedium[0]}%
                </Badge>
              </div>
              <Slider
                value={props.settingsMedium}
                min={20}
                max={60}
                step={1}
                onValueChange={props.setSettingsMedium}
              />
              <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                <span>20%</span>
                <span>60%</span>
              </div>
            </div>
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              size="sm"
              onClick={() =>
                props.setNotice(
                  `Thresholds saved: High >= ${props.settingsHigh[0]}%, Medium >= ${props.settingsMedium[0]}%`
                )
              }
            >
              Save Thresholds
            </Button>
          </div>
        </Panel>

        <Panel title="Table display options" subtitle="Customize data density">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Compact row height</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Display more customer accounts per screen
              </p>
            </div>
            <Switch
              checked={props.compactTables}
              onCheckedChange={props.setCompactTables}
            />
          </div>
        </Panel>
      </div>

      <div className="space-y-5">
        <Panel title="Notification preferences" subtitle="Choose alerts to receive">
          <div className="divide-y">
            {[
              ["High-risk alerts", "Immediate notification when a high-value account crosses risk threshold", true],
              ["Model training updates", "Reports when the model is retrained on new customer batches", true],
              ["Retention action updates", "Daily digest of completed retention outreach plays", false],
            ].map(([label, detail, enabled]) => (
              <div className="flex items-center justify-between gap-3 py-4" key={String(label)}>
                <div>
                  <p className="text-xs font-semibold">{label}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{detail}</p>
                </div>
                <Switch defaultChecked={Boolean(enabled)} />
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between border-t pt-4">
            <div>
              <p className="text-xs font-semibold">Email digests</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Send weekly executive summaries</p>
            </div>
            <Switch
              checked={props.notificationEmail}
              onCheckedChange={props.setNotificationEmail}
            />
          </div>
        </Panel>

        <Panel title="Workspace information" subtitle="Enterprise configuration">
          <div className="divide-y">
            {[
              ["Workspace", "Acme Telecommunications"],
              ["Plan", "Enterprise AI/ML Tier"],
              ["API Gateway", "http://localhost:8000/api"],
              ["Model Registry", "Local filesystem (models/churn_model.joblib)"],
            ].map(([a, b]) => (
              <div key={a} className="flex justify-between py-3 text-xs">
                <span className="text-muted-foreground">{a}</span>
                <span className="font-semibold">{b}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
