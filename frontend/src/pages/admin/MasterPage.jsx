import React, { useState, useMemo, useEffect, useRef } from "react";
import { Plus, Search, Eye, Pencil, Trash2, Loader2, Upload, ImageIcon } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/api";

/**
 * Reusable master page (table + add/edit dialog + delete).
 * props:
 *  title, subtitle, Icon, apiBase (e.g. "/states"), itemLabel (e.g. "State")
 *  parent: { key, label, optionsApi } optional
 *  hasTrending: bool, hasImage: bool
 */
export default function MasterPage({
  title, subtitle, Icon, apiBase, itemLabel, parent = null, hasTrending = false, hasImage = false,
}) {
  const { toast } = useToast();
  const fileRef = useRef(null);
  const [rows, setRows] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const emptyForm = () => {
    const f = { name: "", status: true };
    if (parent) f[parent.key] = "";
    if (hasTrending) f.trending = false;
    if (hasImage) f.image = "";
    return f;
  };
  const [form, setForm] = useState(emptyForm());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const load = () => {
    setLoading(true);
    const calls = [api.get(apiBase)];
    if (parent) calls.push(api.get(parent.optionsApi));
    Promise.all(calls).then((res) => {
      setRows(res[0].data);
      if (parent) setParentOptions(res[1].data.map((x) => x.name));
    }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [apiBase]);

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter((r) => r.status).length,
    inactive: rows.filter((r) => !r.status).length,
  }), [rows]);

  const filtered = rows.filter((r) => {
    const hay = `${r.name} ${parent ? r[parent.key] || "" : ""}`.toLowerCase();
    const matchQ = hay.includes(query.toLowerCase());
    const matchT = tab === "all" || (tab === "active" && r.status) || (tab === "inactive" && !r.status);
    return matchQ && matchT;
  });

  useEffect(() => { setPage(1); }, [query, tab]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const paged = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const openAdd = () => {
    const f = emptyForm();
    if (parent) f[parent.key] = parentOptions[0] || "";
    setEditing(null); setForm(f); setDialogOpen(true);
  };
  const openEdit = (r) => {
    const f = { name: r.name, status: r.status };
    if (parent) f[parent.key] = r[parent.key] || "";
    if (hasTrending) f.trending = !!r.trending;
    if (hasImage) f.image = r.image || "";
    setEditing(r); setForm(f); setDialogOpen(true);
  };

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Image too large", description: "Please use an image under 2MB.", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: `${itemLabel} name required`, variant: "destructive" }); return; }
    if (parent && !form[parent.key]) { toast({ title: `${parent.label} required`, variant: "destructive" }); return; }
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`${apiBase}/${editing.id}`, form);
        setRows(rows.map((r) => (r.id === editing.id ? data : r)));
        toast({ title: `${itemLabel} updated` });
      } else {
        const { data } = await api.post(apiBase, form);
        setRows([data, ...rows]);
        toast({ title: `${itemLabel} created` });
      }
      setDialogOpen(false);
    } catch (e) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const toggleField = async (r, field) => {
    setRows(rows.map((x) => (x.id === r.id ? { ...x, [field]: !x[field] } : x)));
    try {
      const { data } = await api.put(`${apiBase}/${r.id}`, { [field]: !r[field] });
      setRows((prev) => prev.map((x) => (x.id === r.id ? data : x)));
    } catch (e) { setRows(rows); toast({ title: "Update failed", variant: "destructive" }); }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`${apiBase}/${deleteId}`);
      setRows(rows.filter((r) => r.id !== deleteId));
      toast({ title: `${itemLabel} deleted` });
    } catch (e) { toast({ title: "Delete failed", variant: "destructive" }); }
    finally { setDeleteId(null); }
  };

  const colCount = 4 + (hasImage ? 1 : 0) + (parent ? 1 : 0) + (hasTrending ? 1 : 0);

  return (
    <AdminLayout title="CareerAI Admin">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-head text-3xl font-bold text-[#111] flex items-center gap-3">
            <Icon className="h-8 w-8 text-[#2c0eee]" /> {title}
          </h2>
          <p className="text-gray-500 mt-1">{subtitle}</p>
        </div>
        <Button onClick={openAdd} className="bg-[#2c0eee] hover:bg-[#2408c9] text-white font-semibold h-11 px-5">
          <Plus className="h-4 w-4 mr-2" /> Add {itemLabel}
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative w-full md:max-w-sm">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${itemLabel.toLowerCase()}s…`} className="pl-9 rounded-full bg-[#f6f7fb] border-gray-100" />
          </div>
          <div className="flex items-center gap-4 text-sm">
            {[["all", "All"], ["active", "Active"], ["inactive", "Inactive"]].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-1.5 font-medium ${tab === key ? "text-[#2c0eee]" : "text-gray-500"}`}>
                {label} <span className={`px-2 py-0.5 rounded-full text-xs ${tab === key ? "bg-[#2c0eee] text-white" : "bg-gray-100 text-gray-600"}`}>{counts[key]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 pr-4 font-semibold w-10">#</th>
                {hasImage && <th className="py-3 pr-4 font-semibold">Image</th>}
                <th className="py-3 pr-4 font-semibold">{itemLabel} Name</th>
                {parent && <th className="py-3 pr-4 font-semibold">{parent.label}</th>}
                {hasTrending && <th className="py-3 pr-4 font-semibold">Trending</th>}
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Updated At</th>
                <th className="py-3 pr-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r, idx) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-[#f6f7fb]/60">
                  <td className="py-4 pr-4 text-gray-400">{(pageSafe - 1) * PAGE_SIZE + idx + 1}</td>
                  {hasImage && (
                    <td className="py-3 pr-4">
                      <div className="h-11 w-11 rounded-full flex items-center justify-center overflow-hidden" style={{ background: "radial-gradient(circle at 50% 30%, #23237a, #0c0c2b)" }}>
                        {r.image ? <img src={r.image} alt={r.name} className="h-8 w-8 object-contain" /> : <ImageIcon className="h-5 w-5 text-white/50" />}
                      </div>
                    </td>
                  )}
                  <td className="py-4 pr-4 font-medium text-gray-800">{r.name}</td>
                  {parent && <td className="py-4 pr-4 text-gray-600">{r[parent.key] || "-"}</td>}
                  {hasTrending && (
                    <td className="py-4 pr-4">
                      <Switch checked={!!r.trending} onCheckedChange={() => toggleField(r, "trending")} className="data-[state=checked]:bg-[#f5b301]" />
                    </td>
                  )}
                  <td className="py-4 pr-4">
                    <Switch checked={r.status} onCheckedChange={() => toggleField(r, "status")} className="data-[state=checked]:bg-[#2c0eee]" />
                  </td>
                  <td className="py-4 pr-4 text-gray-600">{r.updatedAt}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button onClick={() => openEdit(r)} className="hover:text-[#2c0eee]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="hover:text-[#f61d25]"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={colCount} className="py-10 text-center text-gray-400">{loading ? "Loading…" : `No ${itemLabel.toLowerCase()}s found`}</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              Showing {(pageSafe - 1) * PAGE_SIZE + 1}–{Math.min(pageSafe * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={pageSafe <= 1} onClick={() => setPage(pageSafe - 1)}>Previous</Button>
              <span className="text-sm text-gray-600 px-2">Page {pageSafe} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={pageSafe >= totalPages} onClick={() => setPage(pageSafe + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-head text-xl">{editing ? `Edit ${itemLabel}` : `Add New ${itemLabel}`}</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2 max-h-[70vh] overflow-y-auto thin-scroll">
            <div>
              <Label className="text-gray-700">{itemLabel} Name <span className="text-[#f61d25]">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={`e.g. ${itemLabel}`} className="mt-1.5 h-11" />
            </div>

            {parent && (
              <div>
                <Label className="text-gray-700">{parent.label} <span className="text-[#f61d25]">*</span></Label>
                <Select value={form[parent.key]} onValueChange={(v) => setForm({ ...form, [parent.key]: v })}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder={`Select ${parent.label}`} /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {parentOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {hasImage && (
              <div>
                <Label className="text-gray-700">City Image</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ background: "radial-gradient(circle at 50% 30%, #23237a, #0c0c2b)" }}>
                    {form.image ? <img src={form.image} alt="preview" className="h-14 w-14 object-contain" /> : <ImageIcon className="h-7 w-7 text-white/50" />}
                  </div>
                  <div>
                    <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} className="border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
                      <Upload className="h-4 w-4 mr-2" /> Upload Image
                    </Button>
                    {form.image && (
                      <button type="button" onClick={() => setForm({ ...form, image: "" })} className="ml-3 text-sm text-gray-400 hover:text-[#f61d25]">Remove</button>
                    )}
                    <p className="text-xs text-gray-400 mt-2">PNG/JPG, transparent PNG recommended. Max 2MB.</p>
                  </div>
                </div>
              </div>
            )}

            {hasTrending && (
              <div>
                <Label className="text-gray-700">Mark as Trending</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Switch checked={form.trending} onCheckedChange={(v) => setForm({ ...form, trending: v })} className="data-[state=checked]:bg-[#f5b301]" />
                  <span className="text-sm text-gray-600">{form.trending ? "Enabled" : "Disabled"}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Trending cities are shown on the homepage (first 8).</p>
              </div>
            )}

            <div>
              <Label className="text-gray-700">Status</Label>
              <RadioGroup value={form.status ? "active" : "inactive"} onValueChange={(v) => setForm({ ...form, status: v === "active" })} className="flex gap-6 mt-2">
                <div className="flex items-center gap-2"><RadioGroupItem value="active" id="m-active" /><Label htmlFor="m-active">Active</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="inactive" id="m-inactive" /><Label htmlFor="m-inactive">Inactive</Label></div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-[#2c0eee] hover:bg-[#2408c9] text-white font-semibold">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : (editing ? "Save Changes" : `Create ${itemLabel}`)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this {itemLabel.toLowerCase()}?</AlertDialogTitle>
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
