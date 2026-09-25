import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import {
  Plus, Search, Pencil, Trash2, RefreshCw, Upload, CheckCircle2, XCircle,
  TrendingUp, LayoutGrid, ImageIcon,
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
import { getMaster } from "./mastersConfig";

const PAGE_SIZE = 12;

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

export default function MasterPage() {
  const { key } = useParams();
  const cfg = getMaster(key);
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);

  const load = useCallback(() => {
    if (!cfg) return;
    setLoading(true);
    api.get(cfg.api).then((res) => setRows(res.data)).finally(() => setLoading(false));
  }, [cfg]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); setQuery(""); setTab("all"); }, [key]);
  useEffect(() => { setPage(1); }, [query, tab]);

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter((r) => r.status).length,
    inactive: rows.filter((r) => !r.status).length,
    trending: rows.filter((r) => r.trending).length,
  }), [rows]);

  if (!cfg) return <Navigate to="/admin/dashboard" replace />;

  const filtered = rows.filter((r) => {
    const extra = (cfg.tableCols || []).map((c) => r[c.key] || "").join(" ");
    const hay = `${r.name} ${cfg.parent ? r[cfg.parent.key] || "" : ""} ${extra}`.toLowerCase();
    const mq = hay.includes(query.toLowerCase());
    const mt = tab === "all" || (tab === "active" && r.status) || (tab === "inactive" && !r.status);
    return mq && mt;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const toggleField = async (r, field) => {
    setRows(rows.map((x) => (x.id === r.id ? { ...x, [field]: !x[field] } : x)));
    try {
      const { data } = await api.put(`${cfg.api}/${r.id}`, { [field]: !r[field] });
      setRows((prev) => prev.map((x) => (x.id === r.id ? data : x)));
    } catch (e) { setRows(rows); toast({ title: "Update failed", variant: "destructive" }); }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${cfg.api}/${deleteId}`);
      setRows(rows.filter((r) => r.id !== deleteId));
      toast({ title: `${cfg.itemLabel} deleted` });
    } catch (e) { toast({ title: "Delete failed", variant: "destructive" }); }
    finally { setDeleteId(null); }
  };

  const onBulkFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      let items = [];
      if (file.name.endsWith(".json")) {
        items = JSON.parse(text);
      } else {
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        const headers = lines[0].split(",").map((h) => h.trim());
        items = lines.slice(1).map((line) => {
          const vals = line.split(",");
          const obj = {};
          headers.forEach((h, i) => { obj[h] = (vals[i] || "").trim(); });
          return obj;
        });
      }
      const { data } = await api.post(`${cfg.api}/bulk`, { items });
      toast({ title: "Bulk upload complete", description: `${data.inserted} ${cfg.itemLabel.toLowerCase()}s added.` });
      load();
    } catch (err) {
      toast({ title: "Bulk upload failed", description: "Use CSV with a 'name' header (or JSON array).", variant: "destructive" });
    } finally { if (fileRef.current) fileRef.current.value = ""; }
  };

  const Icon = cfg.Icon;
  const extraCols = cfg.tableCols || [];

  return (
    <AdminLayout title="CareerAI Admin">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#f61d25]/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-[#f61d25]" />
          </div>
          <div>
            <h2 className="font-head text-2xl font-bold text-[#111]">{cfg.title}</h2>
            <p className="text-sm text-gray-500">{cfg.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={load}><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
          <input ref={fileRef} type="file" accept=".csv,.json" onChange={onBulkFile} className="hidden" />
          <Button variant="outline" onClick={() => fileRef.current?.click()} className="border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
            <Upload className="h-4 w-4 mr-2" /> Bulk Upload
          </Button>
          <Button onClick={() => navigate(`/admin/masters/${key}/new`)} className="text-white font-semibold" style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
            <Plus className="h-4 w-4 mr-2" /> Add {cfg.itemLabel}
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5 mb-5">
        <StatCard label="TOTAL" value={counts.all} Icon={LayoutGrid} color="#2c0eee" />
        <StatCard label="ACTIVE" value={counts.active} Icon={CheckCircle2} color="#16a34a" />
        <StatCard label="INACTIVE" value={counts.inactive} Icon={XCircle} color="#f61d25" />
        <StatCard label={cfg.hasTrending ? "TRENDING" : "SHOWING"} value={cfg.hasTrending ? counts.trending : filtered.length} Icon={TrendingUp} color="#9333ea" />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative w-full md:max-w-md">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, key or subject…" className="pl-9 rounded-xl bg-[#f6f7fb] border-gray-100" />
          </div>
          <div className="w-full md:w-48">
            <Select value={tab} onValueChange={setTab}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({counts.all})</SelectItem>
                <SelectItem value="active">Active ({counts.active})</SelectItem>
                <SelectItem value="inactive">Inactive ({counts.inactive})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 pr-4 font-semibold w-14">S.No</th>
                {cfg.hasImage && <th className="py-3 pr-4 font-semibold">Image</th>}
                <th className="py-3 pr-4 font-semibold">{cfg.primaryLabel || `${cfg.itemLabel} Name`}</th>
                {cfg.parent && <th className="py-3 pr-4 font-semibold">{cfg.parent.label}</th>}
                {extraCols.map((c) => <th key={c.key} className="py-3 pr-4 font-semibold">{c.label}</th>)}
                {cfg.hasTrending && <th className="py-3 pr-4 font-semibold">Trending</th>}
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, idx) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-[#f6f7fb]/60">
                  <td className="py-4 pr-4 text-gray-400">{(pageSafe - 1) * PAGE_SIZE + idx + 1}</td>
                  {cfg.hasImage && (
                    <td className="py-3 pr-4">
                      <div className="h-11 w-11 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "radial-gradient(circle at 50% 30%, #23237a, #0c0c2b)" }}>
                        {r.image ? <img src={r.image} alt={r.name} className="h-8 w-8 object-contain" /> : <ImageIcon className="h-5 w-5 text-white/50" />}
                      </div>
                    </td>
                  )}
                  <td className="py-4 pr-4 font-medium text-gray-800 max-w-xs truncate">{r.name}</td>
                  {cfg.parent && <td className="py-4 pr-4 text-gray-600">{r[cfg.parent.key] || "-"}</td>}
                  {extraCols.map((c) => (
                    <td key={c.key} className="py-4 pr-4 text-gray-600 max-w-[220px] truncate">
                      {c.toggle ? (
                        <Switch checked={!!r[c.key]} onCheckedChange={() => toggleField(r, c.key)} className="data-[state=checked]:bg-green-500" />
                      ) : c.badge ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#2c0eee]/10 text-[#2c0eee]">{r[c.key] || "-"}</span>
                      ) : (r[c.key] || "-")}
                    </td>
                  ))}
                  {cfg.hasTrending && (
                    <td className="py-4 pr-4">
                      <Switch checked={!!r.trending} onCheckedChange={() => toggleField(r, "trending")} className="data-[state=checked]:bg-[#f5b301]" />
                    </td>
                  )}
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <Switch checked={r.status} onCheckedChange={() => toggleField(r, "status")} className="data-[state=checked]:bg-[#2c0eee]" />
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${r.status ? "text-green-600" : "text-gray-400"}`}>
                        {r.status ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}{r.status ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button onClick={() => navigate(`/admin/masters/${key}/${r.id}/edit`)} className="hover:text-[#2c0eee]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="hover:text-[#f61d25]"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={12} className="py-10 text-center text-gray-400">{loading ? "Loading…" : `No ${cfg.itemLabel.toLowerCase()}s found`}</td></tr>
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
            <AlertDialogTitle>Delete this {cfg.itemLabel.toLowerCase()}?</AlertDialogTitle>
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
