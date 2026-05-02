import API from "../services/api";
import { useEffect, useState } from "react";
import InfoTooltip from "../components/InfoTooltip";
import { METRIC_INFO } from "../constants/metricsInfo";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function Dashboard() {
  const [data, setData] = useState({});
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [insurerRevenue, setInsurerRevenue] = useState([]);
  const [commissionTrend, setCommissionTrend] = useState([]);
  const [agentRevenue, setAgentRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const [overviewRes, monthlyRes, insurerRes, commissionTrendRes, agentRevenueRes] = await Promise.all([
          API.get("/analytics/overview"),
          API.get("/analytics/monthly"),
          API.get("/analytics/insurer"),
          API.get("/analytics/commission-trend"),
          API.get("/analytics/agent-revenue"),
        ]);

        setData(overviewRes.data || {});

        const monthlyRows = Object.entries(monthlyRes.data || {}).map(([month, value]) => ({
          month,
          value,
        }));
        setMonthlyRevenue(monthlyRows);

        const insurerRows = Object.entries(insurerRes.data || {}).map(([name, value]) => ({
          name,
          value,
        }));
        setInsurerRevenue(insurerRows);

        setCommissionTrend(commissionTrendRes.data || []);
        setAgentRevenue(agentRevenueRes.data || null);
      } catch {
        setError("Unable to load dashboard metrics.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 animate-pulse rounded-2xl border border-slate-800/70 bg-slate-900/50"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Total Premium" value={data.total_premium} info={METRIC_INFO.totalPremium} />
        <Card title="Active Policies" value={data.active_policies} info={METRIC_INFO.activePolicies} />
        <Card title="Lapsed Policies" value={data.lapsed_policies} info={METRIC_INFO.lapsedPolicies} />
      </div>

      {agentRevenue?.totals && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            title="Projected Agent Revenue"
            value={agentRevenue.totals.projected}
            info={METRIC_INFO.projectedRevenue}
          />
          <Card
            title="Collected Revenue (Cycle)"
            value={agentRevenue.totals.collected}
            info={METRIC_INFO.collectedCycle}
          />
          <Card title="Potential Revenue" value={agentRevenue.totals.potential} info={METRIC_INFO.potentialCeiling} />
        </div>
      )}

      {agentRevenue?.totals && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            title="Collected This Month"
            value={agentRevenue.totals.collected_current_month}
            info={METRIC_INFO.collectedThisMonth}
          />
          <Card
            title="Collected Lifetime"
            value={agentRevenue.totals.collected_lifetime}
            info={METRIC_INFO.collectedLifetime}
          />
          <Card title="Payments Logged" value={agentRevenue.totals.payments_count} info={METRIC_INFO.paymentsLogged} />
        </div>
      )}

      {agentRevenue?.totals &&
        agentRevenue.totals.collected_current_month === agentRevenue.totals.collected_lifetime &&
        agentRevenue.totals.payments_count > 0 && (
          <div className="rounded-xl border border-slate-700/70 bg-slate-800/70 px-4 py-3 text-xs text-slate-300">
            இந்த மாத வருவாய் (Collected This Month) மற்றும் மொத்த வருவாய் (Collected Lifetime) ஒரே மாதிரி
            இருக்கிறது, ஏனெனில் பதிவான அனைத்து payment entries-மும் தற்போது ஒரே மாதத்தில் உள்ளன.
          </div>
        )}

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Monthly Revenue Trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#22d3ee" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Insurer">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={insurerRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#38bdf8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Agent Revenue Trend">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={commissionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="base"
                name="Base Revenue"
                stroke="#22d3ee"
                strokeWidth={2.5}
              />
              <Line
                type="monotone"
                dataKey="potential"
                name="Potential Revenue"
                stroke="#fbbf24"
                strokeWidth={2.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Policy Health Split">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={[
                  { name: "Active", value: data.active_policies || 0 },
                  { name: "Lapsed", value: data.lapsed_policies || 0 },
                ]}
                dataKey="value"
                innerRadius={64}
                outerRadius={92}
                paddingAngle={4}
              >
                <Cell fill="#22d3ee" />
                <Cell fill="#fb7185" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {agentRevenue?.trend?.length > 0 && (
        <ChartCard title="Collected vs Projected Agent Revenue">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={agentRevenue.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="collected"
                name="Collected"
                stroke="#34d399"
                strokeWidth={2.5}
              />
              <Line
                type="monotone"
                dataKey="projected"
                name="Projected"
                stroke="#38bdf8"
                strokeWidth={2.5}
              />
              <Line
                type="monotone"
                dataKey="potential"
                name="Potential"
                stroke="#fbbf24"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function Card({ title, value, info }) {
  return (
    <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-5 shadow-[0_8px_30px_rgba(2,6,23,0.45)]">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-slate-400">{title}</h4>
        {info && <InfoTooltip title={info.title} en={info.en} ta={info.ta} />}
      </div>
      <p className="mt-3 text-3xl font-semibold text-slate-100">{value || 0}</p>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <section className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-5 shadow-[0_8px_30px_rgba(2,6,23,0.45)]">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-slate-300">{title}</h3>
      {children}
    </section>
  );
}
