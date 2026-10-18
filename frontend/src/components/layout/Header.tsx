import { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, ChevronDown, Menu, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HealthResponse } from "@/services/api";

interface HeaderProps {
  onToggleSidebar: () => void;
  globalSearch: string;
  onSearchChange: (value: string) => void;
  dark: boolean;
  onToggleDark: () => void;
  backendHealth: HealthResponse | null;
  onSetNotice: (msg: string) => void;
}

export function Header({
  onToggleSidebar,
  globalSearch,
  onSearchChange,
  dark,
  onToggleDark,
  backendHealth,
  onSetNotice,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur md:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onToggleSidebar}
        aria-label="Toggle navigation"
      >
        <Menu className="size-4" />
      </Button>

      <div className="relative hidden max-w-[360px] flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={globalSearch}
          onChange={(e) => onSearchChange(e.target.value)}
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
          onClick={onToggleDark}
          title="Toggle Theme"
          className="size-8 cursor-pointer"
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
            className="gap-2 px-1.5 cursor-pointer"
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
                className="w-full rounded px-2 py-2 text-left text-xs hover:bg-muted cursor-pointer"
                onClick={() => {
                  onSetNotice("Signed in as Jordan Davis (Enterprise Plan)");
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
  );
}
