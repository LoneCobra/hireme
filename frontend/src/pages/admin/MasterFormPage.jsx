import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2, Upload, ImageIcon, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/api";
import { getMaster } from "./mastersConfig";

export default function MasterFormPage() {
  const { key, id } = useParams();
  const cfg = getMaster(key);
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const [saving, setSaving] = useState(false);
  const [parentOptions, setParentOptions] = useState([]);
  const [form, setForm] = useState(() => {
    const f = { name: "", status: true };
    if (cfg?.parent) f[cfg.parent.key] = "";
    if (cfg?.hasTrending) f.trending = false;
    if (cfg?.hasImage) f.image = "";
    (cfg?.fields || []).forEach((fl) => { f[fl.key] = fl.type === "switch" ? false : ""; });
    return f;
  });

  useEffect(() => {
    if (!cfg) return;
    if (cfg.parent) api.get(cfg.parent.optionsApi).then((r) => setParentOptions(r.data.map((x) => x.name)));
    if (isEdit) {
      api.get(cfg.api).then((r) => {
        const item = r.data.find((x) => x.id === id);
        if (item) setForm({ ...form, ...item });
      });
    }
    // eslint-disable-next-line
  }, [key, id]);

  if (!cfg) { navigate("/admin/dashboard"); return null; }
  const Icon = cfg.Icon;
  const primaryLabel = cfg.primaryLabel || `${cfg.itemLabel} Name`;

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Image too large", description: "Max 2MB.", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: `${primaryLabel} required`, variant: "destructive" }); return; }
    if (cfg.parent && !form[cfg.parent.key]) { toast({ title: `${cfg.parent.label} required`, variant: "destructive" }); return; }
    for (const fl of cfg.fields || []) {
      if (fl.required && !String(form[fl.key] || "").trim()) { toast({ title: `${fl.label} required`, variant: "destructive" }); return; }
    }
    setSaving(true);
    try {
      if (isEdit) await api.put(`${cfg.api}/${id}`, form);
      else await api.post(cfg.api, form);
      toast({ title: `${cfg.itemLabel} ${isEdit ? "updated" : "created"}` });
      navigate(`/admin/masters/${key}`);
    } catch (e) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const initials = (form.name || cfg.itemLabel).slice(0, 2).toUpperCase();

  return (
    <AdminLayout title="CareerAI Admin">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate(`/admin/masters/${key}`)} className="flex items-center gap-2 text-gray-600 hover:text-[#2c0eee]">
          <ArrowLeft className="h-5 w-5" />
          <div className="text-left">
            <p className="text-xs text-gray-400">{cfg.title}</p>
            <p className="font-head font-semibold text-[#111]">{isEdit ? `Edit ${cfg.itemLabel}` : `Add New ${cfg.itemLabel}`}</p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate(`/admin/masters/${key}`)}><X className="h-4 w-4 mr-2" /> Cancel</Button>
          <Button onClick={save} disabled={saving} className="text-white font-semibold" style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : <><Save className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : `Create ${cfg.itemLabel}`}</>}
          </Button>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-2xl p-6 mb-5 flex items-center gap-4" style={{ background: "linear-gradient(120deg,#10112b,#211a5e)" }}>
        <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center">
          {cfg.hasImage && form.image ? <img src={form.image} alt="" className="h-12 w-12 object-contain" /> : <span className="font-head font-bold text-xl text-white">{initials}</span>}
        </div>
        <div>
          <p className="font-head text-2xl font-bold text-white">{form.name || `New ${cfg.itemLabel}`}</p>
          <span className={`inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${form.status ? "bg-green-500/20 text-green-300" : "bg-white/10 text-white/60"}`}>
            {form.status ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 max-w-3xl">
        <div className="space-y-6">
          <div>
            <Label className="text-gray-700">{primaryLabel} <span className="text-[#f61d25]">*</span></Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={`Enter ${primaryLabel.toLowerCase()}`} className="mt-1.5 h-11" />
          </div>

          {cfg.parent && (
            <div>
              <Label className="text-gray-700">{cfg.parent.label} <span className="text-[#f61d25]">*</span></Label>
              <Select value={form[cfg.parent.key]} onValueChange={(v) => setForm({ ...form, [cfg.parent.key]: v })}>
                <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder={`Select ${cfg.parent.label}`} /></SelectTrigger>
                <SelectContent className="max-h-64">
                  {parentOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {(cfg.fields || []).map((fl) => (
            <div key={fl.key}>
              <Label className="text-gray-700">{fl.label}{fl.required && <span className="text-[#f61d25]"> *</span>}</Label>
              {fl.type === "textarea" ? (
                <Textarea value={form[fl.key] || ""} onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })} placeholder={fl.placeholder} className="mt-1.5 min-h-[120px]" />
              ) : fl.type === "select" ? (
                <Select value={form[fl.key] || ""} onValueChange={(v) => setForm({ ...form, [fl.key]: v })}>
                  <SelectTrigger className="mt-1.5 h-11"><SelectValue placeholder={`Select ${fl.label}`} /></SelectTrigger>
                  <SelectContent>{fl.options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              ) : fl.type === "switch" ? (
                <div className="flex items-center gap-3 mt-2">
                  <Switch checked={!!form[fl.key]} onCheckedChange={(v) => setForm({ ...form, [fl.key]: v })} className="data-[state=checked]:bg-green-500" />
                  <span className="text-sm text-gray-600">{form[fl.key] ? "Enabled" : "Disabled"}</span>
                </div>
              ) : (
                <Input value={form[fl.key] || ""} onChange={(e) => setForm({ ...form, [fl.key]: e.target.value })} placeholder={fl.placeholder} className="mt-1.5 h-11" />
              )}
            </div>
          ))}

          {cfg.hasImage && (
            <div>
              <Label className="text-gray-700">City Image</Label>
              <div className="mt-2 flex items-center gap-4">
                <div className="h-20 w-20 rounded-full flex items-center justify-center overflow-hidden shrink-0" style={{ background: "radial-gradient(circle at 50% 30%, #23237a, #0c0c2b)" }}>
                  {form.image ? <img src={form.image} alt="preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-7 w-7 text-white/50" />}
                </div>
                <div>
                  <input id="cityimg" type="file" accept="image/*" onChange={onFile} className="hidden" />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("cityimg").click()} className="border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
                    <Upload className="h-4 w-4 mr-2" /> Upload Image
                  </Button>
                  {form.image && <button type="button" onClick={() => setForm({ ...form, image: "" })} className="ml-3 text-sm text-gray-400 hover:text-[#f61d25]">Remove</button>}
                  <p className="text-xs text-gray-400 mt-2">PNG/JPG, transparent PNG recommended. Max 2MB.</p>
                </div>
              </div>
            </div>
          )}

          {cfg.hasTrending && (
            <div>
              <Label className="text-gray-700">Mark as Trending</Label>
              <div className="flex items-center gap-3 mt-2">
                <Switch checked={!!form.trending} onCheckedChange={(v) => setForm({ ...form, trending: v })} className="data-[state=checked]:bg-[#f5b301]" />
                <span className="text-sm text-gray-600">{form.trending ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          )}

          <div>
            <Label className="text-gray-700">Status</Label>
            <RadioGroup value={form.status ? "active" : "inactive"} onValueChange={(v) => setForm({ ...form, status: v === "active" })} className="flex gap-6 mt-2">
              <div className="flex items-center gap-2"><RadioGroupItem value="active" id="f-active" /><Label htmlFor="f-active">Active</Label></div>
              <div className="flex items-center gap-2"><RadioGroupItem value="inactive" id="f-inactive" /><Label htmlFor="f-inactive">Inactive</Label></div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
