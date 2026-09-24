import React, { useState, useMemo } from "react";
import { Plus, Search, Eye, Pencil, Trash2, GraduationCap } from "lucide-react";
import AdminLayout from "../AdminLayout";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Switch } from "../../../components/ui/switch";
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "../../../components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { useToast } from "../../../hooks/use-toast";
import { educationCategoriesSeed } from "../../../mock/mock";

const today = "24 Sep 2026";

export default function EducationCategories() {
  const { toast } = useToast();
  const [rows, setRows] = useState(educationCategoriesSeed);
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: "", status: true, trending: false });

  const counts = useMemo(() => ({
    all: rows.length,
    active: rows.filter((r) => r.status).length,
    inactive: rows.filter((r) => !r.status).length,
  }), [rows]);

  const filtered = rows.filter((r) => {
    const matchQ = r.name.toLowerCase().includes(query.toLowerCase());
    const matchT = tab === "all" || (tab === "active" && r.status) || (tab === "inactive" && !r.status);
    return matchQ && matchT;
  });

  const openAdd = () => { setEditing(null); setForm({ name: "", status: true, trending: false }); setDialogOpen(true); };
  const openEdit = (r) => { setEditing(r); setForm({ name: r.name, status: r.status, trending: r.trending }); setDialogOpen(true); };

  const save = () => {
    if (!form.name.trim()) { toast({ title: "Category name required", variant: "destructive" }); return; }
    if (editing) {
      setRows(rows.map((r) => r.id === editing.id ? { ...r, ...form, updatedBy: "admin", updatedAt: today } : r));
      toast({ title: "Category updated" });
    } else {
      setRows([{ id: Date.now(), ...form, updatedBy: "admin", updatedAt: today }, ...rows]);
      toast({ title: "Category created" });
    }
    setDialogOpen(false);
  };

  const toggleField = (id, field) =>
    setRows(rows.map((r) => r.id === id ? { ...r, [field]: !r[field], updatedBy: "admin", updatedAt: today } : r));

  const confirmDelete = () => {
    setRows(rows.filter((r) => r.id !== deleteId));
    setDeleteId(null);
    toast({ title: "Category deleted" });
  };

  return (
    <AdminLayout title="CareerAI Admin">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-head text-3xl font-bold text-[#111] flex items-center gap-3">
            <GraduationCap className="h-8 w-8 text-[#2c0eee]" /> Education Categories
          </h2>
          <p className="text-gray-500 mt-1">Manage education categories for job listings</p>
        </div>
        <Button onClick={openAdd} className="bg-[#2c0eee] hover:bg-[#2408c9] text-white font-semibold h-11 px-5">
          <Plus className="h-4 w-4 mr-2" /> Add Category
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="relative w-full md:max-w-sm">
            <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search categories…" className="pl-9 rounded-full bg-[#f6f7fb] border-gray-100" />
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
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="py-3 pr-4 font-semibold w-10">#</th>
                <th className="py-3 pr-4 font-semibold">Category Name</th>
                <th className="py-3 pr-4 font-semibold">Trending</th>
                <th className="py-3 pr-4 font-semibold">Status</th>
                <th className="py-3 pr-4 font-semibold">Updated By</th>
                <th className="py-3 pr-4 font-semibold">Updated At</th>
                <th className="py-3 pr-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-[#f6f7fb]/60">
                  <td className="py-4 pr-4 text-gray-400">{idx + 1}</td>
                  <td className="py-4 pr-4 font-medium text-gray-800">{r.name}</td>
                  <td className="py-4 pr-4">
                    <Switch checked={r.trending} onCheckedChange={() => toggleField(r.id, "trending")} className="data-[state=checked]:bg-[#f5b301]" />
                  </td>
                  <td className="py-4 pr-4">
                    <Switch checked={r.status} onCheckedChange={() => toggleField(r.id, "status")} className="data-[state=checked]:bg-[#2c0eee]" />
                  </td>
                  <td className="py-4 pr-4 text-gray-600">{r.updatedBy}</td>
                  <td className="py-4 pr-4 text-gray-600">{r.updatedAt}</td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button onClick={() => toast({ title: r.name, description: `Status: ${r.status ? "Active" : "Inactive"} • Trending: ${r.trending ? "Yes" : "No"}` })} className="hover:text-[#2c0eee]"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => openEdit(r)} className="hover:text-[#2c0eee]"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => setDeleteId(r.id)} className="hover:text-[#f61d25]"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">No categories found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="font-head text-xl">{editing ? "Edit Category" : "Add New Category"}</DialogTitle></DialogHeader>
          <div className="space-y-5 py-2">
            <div>
              <Label className="text-gray-700">Category Name <span className="text-[#f61d25]">*</span></Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Computer Science" className="mt-1.5 h-11" />
              <p className="text-xs text-gray-400 mt-1">Enter a unique name for the category</p>
            </div>
            <div>
              <Label className="text-gray-700">Status</Label>
              <RadioGroup value={form.status ? "active" : "inactive"} onValueChange={(v) => setForm({ ...form, status: v === "active" })} className="flex gap-6 mt-2">
                <div className="flex items-center gap-2"><RadioGroupItem value="active" id="active" /><Label htmlFor="active">Active</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="inactive" id="inactive" /><Label htmlFor="inactive">Inactive</Label></div>
              </RadioGroup>
            </div>
            <div>
              <Label className="text-gray-700">Mark as Trending</Label>
              <div className="flex items-center gap-3 mt-2">
                <Switch checked={form.trending} onCheckedChange={(v) => setForm({ ...form, trending: v })} className="data-[state=checked]:bg-[#f5b301]" />
                <span className="text-sm text-gray-600">{form.trending ? "Enabled" : "Disabled"}</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Trending categories will be highlighted in the listing</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-[#2c0eee] hover:bg-[#2408c9] text-white font-semibold">{editing ? "Save Changes" : "Create Category"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The category will be permanently removed.</AlertDialogDescription>
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
