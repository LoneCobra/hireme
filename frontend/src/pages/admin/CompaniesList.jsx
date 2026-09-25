import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus, Search, Pencil, Trash2, RefreshCw, Building2, CheckCircle2,
  XCircle, Clock, Ban, TrendingUp, LayoutGrid, ImageIcon,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Switch } from "../../components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/api";

const PAGE_SIZE = 12;

const STATUS_META = {
  active: { label: "Active", cls: "text-green-600", Icon: CheckCircle2 },
  inactive: { label: "Inactive", cls: "text-gray-400", Icon: XCircle },
  pending: { label: "Pending", cls: "text-amber-600", Icon: Clock },
  blocked: { label: "Blocked", cls: "text-[#f61d25]", Icon: Ban },
};

function StatCard({ label, value, Icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold tracking-wide text-gray-500">{label}</p>
        <p className="mt-2 font-head text-3xl font-bold text-[#111]">{value}</p>
      </div>
      <div className="h-11 w-11 rounded-xl flex items-center justify-center" style={{ background: `${color}1a` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
    </div>
  );
}

export default function CompaniesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get("/companies").then((res) => setRows(res.data)).catch(() => setRows([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [query, statusFilter]);

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter((r) => r.status === "active").length,
    pending: rows.filter((r) => r.status === "pending").length,
    trending: rows.filter((r) => r.trending).length,
  }), [rows]);

  const filtered = rows.filter((r) => {
    const hay = `${r.name} ${r.industry || ""} ${r.slug || ""}`.toLowerCase();
    const mq = hay.includes(query.toLowerCase());
    const ms = statusFilter === "all" || r.status === statusFilter;
    return mq && ms;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const toggleTrending = async (r) => {
    setRows(rows.map((x) => (x.id === r.id ? { ...x, trending: !x.trending } : x)));
    try {
      const { data } = await api.put(`/companies/${r.id}`, { trending: !r.trending });
      setRows((prev) => prev.map((x) => (x.id === r.id ? data : x)));
    } catch (e) { setRows(rows); toast({ title: "Update failed", variant: "destructive" }); }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`/companies/${deleteId}`);
      setRows(rows.filter((r) => r.id !== deleteId));
      toast({ title: "Company deleted" });
    } catch (e) { toast({ title: "Delete failed", variant: "destructive" }); }
    finally { setDeleteId(null); }
  };

  return (
    <AdminLayout title="Companies">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#f61d25]/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-[#f61d25]" />
          </div>
          <div>
            <h2 className="font-head text-2xl font-bold text-[#111]">Companies</h2>
            <p className="text-sm text-gray-500">List and manage companies in your database</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
          <Button onClick={() => navigate("/admin/companies/new")} className="text-white font-semibold" style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
            <Plus className="h-4 w-4 mr-2" /> Add Company
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
        <StatCard label="TOTAL" value={counts.all} Icon={LayoutGrid} color="#2c0eee" />
        <StatCard label="ACTIVE" value={counts.active} Icon={CheckCircle2} color="#16a34a" />
        <StatCard label="PENDING" value={counts.pending} Icon={Clock} color="#d97706" />
        <StatCard label="TRENDING" value={counts.trending} Icon={TrendingUp} color="#9333ea" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative w-full md:max-w-md">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, industry or slug…" className="pl-9 rounded-xl bg-[#f6f7fb] border-gray-100" />
          </div>
          <div className="w-full md:w-52">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({counts.all})</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 pr-4 font-semibold w-14">S.No</th>
                <th className="py-3 pr-4 font-semibold">Company</th>
                <th className="py-3 pr-4 font-semibold">Industry</th>
                <th className="py-3 pr-4 font-semibold">Website</th>
                <th className="py-3 pr-4 font-semibold">Trending</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, idx) => {
                const meta = STATUS_META[r.status] || STATUS_META.pending;
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-[#f6f7fb]/60">
                    <td className="py-4 pr-4 text-gray-400">{(pageSafe - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-[#f4f5ff] flex items-center justify-center overflow-hidden shrink-0">
                          {r.logo ? <img src={r.logo} alt={r.name} className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-gray-300" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{r.name}</p>
                          <p className="text-xs text-gray-400 truncate">{r.slug || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-gray-600">{r.industry || "-"}</td>
                    <td className="py-4 pr-4 text-gray-600 max-w-[200px] truncate">
                      {r.website ? <a href={r.website} target="_blank" rel="noreferrer" className="text-[#2c0eee] hover:underline">{r.website}</a> : "-"}
                    </td>
                    <td className="py-4 pr-4">
                      <Switch checked={!!r.trending} onCheckedChange={() => toggleTrending(r)} className="data-[state=checked]:bg-[#f5b301]" />
                    </td>
                    <td className="py-4 pr-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${meta.cls}`}>
                        <meta.Icon className="h-3.5 w-3.5" /> {meta.label}
                      </span>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center justify-end gap-2 text-gray-400">
                        <button onClick={() => navigate(`/admin/companies/${r.id}/edit`)} className="hover:text-[#2c0eee]"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => setDeleteId(r.id)} className="hover:text-[#f61d25]"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">{loading ? "Loading…" : "No companies yet. Click \"Add Company\" to create one."}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length}</p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={pageSafe <= 1} onClick={() => setPage(pageSafe - 1)}>Previous</Button>
              <span className="text-sm text-gray-600 px-2">Page {pageSafe} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={pageSafe >= totalPages} onClick={() => setPage(pageSafe + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this company?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-[#f61d25] hover:bg-[#d5171e]">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
