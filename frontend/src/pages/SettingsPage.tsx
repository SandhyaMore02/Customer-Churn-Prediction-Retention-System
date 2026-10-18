import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Panel } from "@/components/common/Panel";

export function SettingsPage() {
  const [settingsHigh, setSettingsHigh] = useState([70]);
  const [settingsMedium, setSettingsMedium] = useState([40]);
  const [compactTables, setCompactTables] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState(true);

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Configure your workspace and notification preferences."
    >
      {({ setNotice }) => (
        <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr]">
          <div className="space-y-5">
            <Panel title="Appearance" subtitle="Customize the interface look">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Color theme</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Switch between light and dark mode
                  </p>
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
                      {settingsHigh[0]}%
                    </Badge>
                  </div>
                  <Slider
                    value={settingsHigh}
                    min={50}
                    max={90}
                    step={1}
                    onValueChange={setSettingsHigh}
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
                      {settingsMedium[0]}%
                    </Badge>
                  </div>
                  <Slider
                    value={settingsMedium}
                    min={20}
                    max={60}
                    step={1}
                    onValueChange={setSettingsMedium}
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
                    setNotice(
                      `Thresholds saved: High >= ${settingsHigh[0]}%, Medium >= ${settingsMedium[0]}%`
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
                  checked={compactTables}
                  onCheckedChange={setCompactTables}
                />
              </div>
            </Panel>
          </div>

          <div className="space-y-5">
            <Panel title="Notification preferences" subtitle="Choose alerts to receive">
              <div className="divide-y">
                {[
                  [
                    "High-risk alerts",
                    "Immediate notification when a high-value account crosses risk threshold",
                    true,
                  ],
                  [
                    "Model training updates",
                    "Reports when the model is retrained on new customer batches",
                    true,
                  ],
                  [
                    "Retention action updates",
                    "Daily digest of completed retention outreach plays",
                    false,
                  ],
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
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Send weekly executive summaries
                  </p>
                </div>
                <Switch
                  checked={notificationEmail}
                  onCheckedChange={setNotificationEmail}
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
      )}
    </DashboardLayout>
  );
}
