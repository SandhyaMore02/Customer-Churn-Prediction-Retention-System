import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { OverviewPage } from "@/pages/OverviewPage";
import { CustomersPage } from "@/pages/CustomersPage";
import { PredictPage } from "@/pages/PredictPage";
import { ExplainPage } from "@/pages/ExplainPage";
import { RetentionPage } from "@/pages/RetentionPage";
import { PerformancePage } from "@/pages/PerformancePage";
import { InfoPage } from "@/pages/InfoPage";
import { SettingsPage } from "@/pages/SettingsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/explain" element={<ExplainPage />} />
        <Route path="/retention" element={<RetentionPage />} />
        <Route path="/performance" element={<PerformancePage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
