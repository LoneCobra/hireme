import React from "react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  Tooltip, LineChart, Line, CartesianGrid,
} from "recharts";
import {
  Users, Briefcase, Building2, Search, TrendingUp, BarChart3, Activity,
  MoreVertical,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import {
  dashboardStats, jobsCreatedMonthly, jobsByIndustry, candidatesMonthly,
  recentCompanies, recentJobs,
} from "../../mock/mock";

const iconMap = { Users, Briefcase, Building2, Search };
const donutColors = ["#2c0eee", "#f61d25", "#0ea5e9", "#16a34a", "#9333ea", "#ea580c", "#0d9488"];

function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${className}`}>{children}</div>;
}

function StatusPill({ status }) {
  const map = {
    Active: "text-green-600 bg-green-50", Published: "text-green-600 bg-green-50",
    Pending: "text-amber-600 bg-amber-50", Draft: "text-gray-500 bg-gray-100",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${map[status] || "text-gray-500 bg-gray-100"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status}
    </span>
  );
}

export default function Dashboard() {
  return (
    <AdminLayout title="Dashboard">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {dashboardStats.map((s) => {
          const Icon = iconMap[s.icon];
          return (
            <Card key={s.label} className="p-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500">{s.label}</p>
                <p className="mt-3 font-head text-4xl font-bold text-[#111]">{s.value}</p>
              </div>
              <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: `${s.color}1a` }}>
                <Icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#2c0eee]/10 flex items-center justify-center"><TrendingUp className="h-5 w-5 text-[#2c0eee]" /></div>
            <div><p className="font-head font-semibold text-gray-800">Jobs Created</p><p className="text-xs text-gray-500">Monthly job creation</p></div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={jobsCreatedMonthly} dataKey="value" nameKey="month" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {jobsCreatedMonthly.map((e, i) => <Cell key={i} fill={donutColors[i % donutColors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
            {jobsCreatedMonthly.map((e, i) => (
              <span key={e.month} className="flex items-center gap-1.5 text-xs text-gray-600">
                <span className="h-2 w-2 rounded-full" style={{ background: donutColors[i % donutColors.length] }} /> {e.month}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#f61d25]/10 flex items-center justify-center"><BarChart3 className="h-5 w-5 text-[#f61d25]" /></div>
            <div><p className="font-head font-semibold text-gray-800">Jobs by Industry</p><p className="text-xs text-gray-500">Total jobs per industry</p></div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={jobsByIndustry} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {jobsByIndustry.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-[#2c0eee]/10 flex items-center justify-center"><Activity className="h-5 w-5 text-[#2c0eee]" /></div>
            <div><p className="font-head font-semibold text-gray-800">Candidates</p><p className="text-xs text-gray-500">Monthly registrations</p></div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={candidatesMonthly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#2c0eee" strokeWidth={3} dot={{ r: 4, fill: "#2c0eee" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-[#2c0eee]/10 flex items-center justify-center"><Building2 className="h-5 w-5 text-[#2c0eee]" /></div>
            <div><p className="font-head font-semibold text-gray-800">Recent Companies</p><p className="text-xs text-gray-500">Latest registrations</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 text-xs">
                <th className="pb-3 font-medium">#</th><th className="pb-3 font-medium">COMPANY</th>
                <th className="pb-3 font-medium">INDUSTRY</th><th className="pb-3 font-medium">DATE</th><th className="pb-3 font-medium">STATUS</th>
              </tr></thead>
              <tbody>
                {recentCompanies.map((c) => (
                  <tr key={c.id} className="border-t border-gray-50">
                    <td className="py-3 text-gray-400">{c.id}</td>
                    <td className="py-3 font-medium text-gray-800">{c.company}</td>
                    <td className="py-3 text-gray-600">{c.industry}</td>
                    <td className="py-3 text-gray-600">{c.date}</td>
                    <td className="py-3"><StatusPill status={c.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-10 w-10 rounded-xl bg-[#f61d25]/10 flex items-center justify-center"><Briefcase className="h-5 w-5 text-[#f61d25]" /></div>
            <div><p className="font-head font-semibold text-gray-800">Recent Jobs</p><p className="text-xs text-gray-500">Latest jobs posted</p></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500 text-xs">
                <th className="pb-3 font-medium">#</th><th className="pb-3 font-medium">JOB TITLE</th>
                <th className="pb-3 font-medium">COMPANY</th><th className="pb-3 font-medium">DATE</th><th className="pb-3 font-medium">STATUS</th>
              </tr></thead>
              <tbody>
                {recentJobs.map((j) => (
                  <tr key={j.id} className="border-t border-gray-50">
                    <td className="py-3 text-gray-400">{j.id}</td>
                    <td className="py-3 font-medium text-gray-800">{j.title}</td>
                    <td className="py-3 text-gray-600">{j.company}</td>
                    <td className="py-3 text-gray-600">{j.date}</td>
                    <td className="py-3"><StatusPill status={j.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
