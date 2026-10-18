import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ChurnWorkspace } from "@/components/churniq/ChurnWorkspace";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ChurnWorkspace screen="overview" />} />
        <Route path="/customers" element={<ChurnWorkspace screen="customers" />} />
        <Route path="/predict" element={<ChurnWorkspace screen="predict" />} />
        <Route path="/explain" element={<ChurnWorkspace screen="explain" />} />
        <Route path="/retention" element={<ChurnWorkspace screen="retention" />} />
        <Route path="/performance" element={<ChurnWorkspace screen="performance" />} />
        <Route path="/info" element={<ChurnWorkspace screen="info" />} />
        <Route path="/settings" element={<ChurnWorkspace screen="settings" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
