import { useEffect, useState } from "react";
import API from "../services/api";
import InfoTooltip from "../components/InfoTooltip";
import { METRIC_INFO } from "../constants/metricsInfo";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

export default function Analytics() {
  const [monthly, setMonthly] = useState([]);
  const [insurer, setInsurer] = useState([]);
  const [overview, setOverview] = useState(null);
  const [commission, setCommission] = useState(null);
  const [commissionTrend, setCommissionTrend] = useState([]);
  const [agentRevenue, setAgentRevenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [
          monthlyResponse,
          insurerResponse,
          overviewResponse,
          commissionResponse,
          commissionTrendResponse,
          agentRevenueResponse,
        ] = await Promise.all([
          API.get("/analytics/monthly"),
          API.get("/analytics/insurer"),
          API.get("/analytics/overview"),
          API.get("/analytics/commission"),
          API.get("/analytics/commission-trend"),
          API.get("/analytics/agent-revenue"),
        ]);

        const monthlyFormatted = Object.entries(monthlyResponse.data).map(
          ([month, value]) => ({
            month,
            value,
          }),
        );

        const insurerFormatted = Object.entries(insurerResponse.data).map(
          ([name, value]) => ({
            name,
            value,
          }),
        );

        setMonthly(monthlyFormatted);
        setInsurer(insurerFormatted);
        setOverview(overviewResponse.data);
        setCommission(commissionResponse.data);
        setCommissionTrend(commissionTrendResponse.data || []);
        setAgentRevenue(agentRevenueResponse.data || null);
      } catch {
        setError("Unable to load analytics data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-6 text-slate-300">Loading analytics...</div>;
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
      <h2 className="text-2xl font-semibold text-slate-100">Analytics Dashboard</h2>

      {overview && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Total Premium" value={overview.total_premium} info={METRIC_INFO.totalPremium} />
          <Card title="Active Policies" value={overview.active_policies} info={METRIC_INFO.activePolicies} />
          <Card title="Lapsed Policies" value={overview.lapsed_policies} info={METRIC_INFO.lapsedPolicies} />
        </div>
      )}

      {commission && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Agent Earnings (Base)" value={commission.base_total} info={METRIC_INFO.earningsBase} />
          <Card
            title="Agent Earnings (Potential)"
            value={commission.potential_total}
            info={METRIC_INFO.earningsPotential}
          />
          <Card title="Policies in Calc" value={commission.active_policies_count} info={METRIC_INFO.activePolicies} />
        </div>
      )}

      {agentRevenue?.totals && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card title="Projected Revenue" value={agentRevenue.totals.projected} info={METRIC_INFO.projectedRevenue} />
          <Card
            title="Collected Revenue (Cycle)"
            value={agentRevenue.totals.collected}
            info={METRIC_INFO.collectedCycle}
          />
          <Card title="Potential Ceiling" value={agentRevenue.totals.potential} info={METRIC_INFO.potentialCeiling} />
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
          <Card title="Payment Entries" value={agentRevenue.totals.payments_count} info={METRIC_INFO.paymentsLogged} />
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

      {commissionTrend.length > 0 && (
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)]">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Agent Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={commissionTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="base"
                name="Base Revenue"
                stroke="#22d3ee"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="potential"
                name="Potential Revenue"
                stroke="#fbbf24"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {agentRevenue?.trend?.length > 0 && (
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)]">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Agent Revenue (Collected vs Projected)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={agentRevenue.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="collected"
                name="Collected Revenue"
                stroke="#34d399"
                strokeWidth={2.5}
              />
              <Line
                type="monotone"
                dataKey="projected"
                name="Projected Revenue"
                stroke="#38bdf8"
                strokeWidth={2.5}
              />
              <Line
                type="monotone"
                dataKey="potential"
                name="Potential Ceiling"
                stroke="#fbbf24"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)]">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Monthly Revenue</h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)]">
          <h3 className="mb-3 text-base font-semibold text-slate-200">Revenue by Insurer</h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insurer}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#0ea5e9" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-900/65 p-4 shadow-[0_8px_30px_rgba(2,6,23,0.45)]">
        <h3 className="mb-3 text-base font-semibold text-slate-200">Policy Status</h3>

        {overview && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: "Active", value: overview.active_policies },
                  { name: "Lapsed", value: overview.lapsed_policies },
                ]}
                dataKey="value"
                outerRadius={100}
                label
              >
                <Cell fill="#0ea5e9" />
                <Cell fill="#f97316" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {commission && (
        <p className="text-xs text-slate-400">
          Agent earnings assumptions: LIC Year1 20-35%, Year2-3 7.5%, Year4+ 5%. Star Health base 15%, potential up to 45%.
          தமிழ்: Agent வருவாய் கணக்கீடு LIC மற்றும் Star Health கமிஷன் slabs அடிப்படையில் மதிப்பிடப்படுகிறது.
        </p>
      )}

      {agentRevenue?.totals && (
        <p className="text-xs text-slate-400">
          Note: Cycle values compare projected active-policy earnings vs collected earnings in the same chart window.
          Lifetime collected includes all payment entries.
          தமிழ்: Cycle values என்பது அதே chart window-இல் projected earnings மற்றும் collected earnings ஒப்பீடு.
          Lifetime collected என்பது பதிவு செய்யப்பட்ட அனைத்து payments-ஐவும் உள்ளடக்கும்.
        </p>
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
