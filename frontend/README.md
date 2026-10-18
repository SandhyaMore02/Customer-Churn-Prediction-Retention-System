# ChurnIQ Frontend Application

The modern B2B SaaS React application for **ChurnIQ — Customer Churn Intelligence Platform**.

## Modular Architecture

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/             # Reusable domain components (MetricCard, RiskPill, Panel, FilterSelect)
│   │   ├── customer/           # Customer components (CustomerTable, CustomerDrawer)
│   │   ├── layout/             # Application layout shell (AppSidebar, Header, DashboardLayout)
│   │   └── ui/                 # Accessible Radix UI primitives (Button, Badge, Sheet, etc.)
│   ├── pages/                  # Dedicated page views for all 8 screens
│   │   ├── OverviewPage.tsx    # Screen 1: Executive Overview
│   │   ├── CustomersPage.tsx   # Screen 2: Customer Risk Explorer
│   │   ├── PredictPage.tsx     # Screen 3: Predict Churn (Single + Batch)
│   │   ├── ExplainPage.tsx     # Screen 4: Explainable AI (SHAP Waterfall)
│   │   ├── RetentionPage.tsx   # Screen 5: Retention Strategies Board
│   │   ├── PerformancePage.tsx # Screen 6: Model Performance & Curves
│   │   ├── InfoPage.tsx        # Screen 7: Data & Model Information
│   │   └── SettingsPage.tsx    # Screen 8: Settings & Threshold Preferences
│   ├── services/
│   │   └── api.ts              # Centralized API service with FastAPI proxy & offline fallback
│   ├── types/
│   │   └── churn.ts            # Shared TypeScript domain interfaces
│   ├── lib/
│   │   ├── churn-data.ts       # Accurate IBM Telco dataset fixtures
│   │   └── utils.ts            # Class name merging utility (clsx + tailwind-merge)
│   ├── App.tsx                 # Clean React Router declarations
│   ├── index.css               # Enterprise Tailwind CSS v4 design tokens (oklch)
│   └── main.tsx                # Application root entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Running the Frontend Locally

```bash
cd frontend
npm install
npm run dev
```
The app runs at [http://localhost:5173](http://localhost:5173).

## Production Build

```bash
npm run build
```
Generates the optimized static bundle in `frontend/dist/`.
