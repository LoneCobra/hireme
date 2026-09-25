import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Loader2, X, Info, Link2, ImagePlus, ShieldCheck, Upload,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Textarea } from "../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import api from "../../lib/api";

const TABS = [
  { key: "overview", label: "Overview", Icon: Info },
  { key: "relations", label: "Relations", Icon: Link2 },
  { key: "media", label: "Media", Icon: ImagePlus },
  { key: "status", label: "Status & Flags", Icon: ShieldCheck },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "#16a34a" },
  { value: "inactive", label: "Inactive", color: "#6b7280" },
  { value: "pending", label: "Pending", color: "#d97706" },
  { value: "blocked", label: "Blocked", color: "#f61d25" },
];

function Field({ label, children, required }) {
  return (
    <div>
      <Label className="text-gray-700">{label}{required && <span className="text-[#f61d25]"> *</span>}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default function CompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const logoRef = useRef(null);
  const bannerRef = useRef(null);
  const [tab, setTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [industries, setIndustries] = useState([]);
  const [subIndustries, setSubIndustries] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [form, setForm] = useState({
    name: "", slug: "", website: "", foundedYear: "", gst: "", about: "",
    industry: "", subIndustry: "", companySize: "", logo: "", banner: "",
    status: "pending", trending: false,
  });

  useEffect(() => {
    api.get("/industries").then((r) => setIndustries(r.data.map((x) => x.name)));
    api.get("/sub-industries").then((r) => setSubIndustries(r.data));
    api.get("/company-sizes").then((r) => setSizes(r.data.map((x) => x.name)));
    if (isEdit) {
      api.get(`/companies/${id}`).then((r) => setForm((f) => ({ ...f, ...r.data })));
    }
    // eslint-disable-next-line
  }, [id]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const autoSlug = (name) =>
    name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");

  const onImg = (key, ref) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast({ title: "Image too large", description: "Max 2MB.", variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => set(key, reader.result);
    reader.readAsDataURL(file);
    if (ref.current) ref.current.value = "";
  };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: "Company Name required", variant: "destructive" }); setTab("overview"); return; }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/companies/${id}`, form);
      else await api.post("/companies", form);
      toast({ title: `Company ${isEdit ? "updated" : "created"}` });
      navigate("/admin/companies");
    } catch (e) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const initials = (form.name || "Co").slice(0, 2).toUpperCase();
  const filteredSubs = subIndustries.filter((s) => !form.industry || s.industry === form.industry);

  return (
    <AdminLayout title="Companies">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => navigate("/admin/companies")} className="flex items-center gap-2 text-gray-600 hover:text-[#2c0eee]">
          <ArrowLeft className="h-5 w-5" />
          <div className="text-left">
            <p className="text-xs text-gray-400">Companies</p>
            <p className="font-head font-semibold text-[#111]">{isEdit ? "Edit Company" : "Add New Company"}</p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate("/admin/companies")}><X className="h-4 w-4 mr-2" /> Cancel</Button>
          <Button onClick={save} disabled={saving} className="text-white font-semibold" style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
            {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : <><Save className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : "Create Company"}</>}
          </Button>
        </div>
      </div>

      {/* Banner */}
      <div className="rounded-2xl overflow-hidden mb-5 relative" style={{ background: "linear-gradient(120deg,#10112b,#211a5e)" }}>
        {form.banner && <img src={form.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />}
        <div className="relative p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden">
            {form.logo ? <img src={form.logo} alt="" className="h-full w-full object-cover" /> : <span className="font-head font-bold text-xl text-white">{initials}</span>}
          </div>
          <div>
            <p className="font-head text-2xl font-bold text-white">{form.name || "New Company"}</p>
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80 capitalize">{form.status}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-1 border-b border-gray-100 px-4 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap ${
                tab === t.key ? "border-[#2c0eee] text-[#2c0eee]" : "border-transparent text-gray-500 hover:text-[#111]"
              }`}>
              <t.Icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 max-w-3xl">
          {tab === "overview" && (
            <div className="space-y-6">
              <Field label="Company Name" required>
                <Input value={form.name} onChange={(e) => { set("name", e.target.value); if (!isEdit) set("slug", autoSlug(e.target.value)); }} placeholder="e.g. Maxgen Technologies" className="h-11" />
              </Field>
              <Field label="Slug (URL identifier)">
                <Input value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. maxgen-technologies" className="h-11" />
              </Field>
              <div className="grid sm:grid-cols-2 gap-6">
                <Field label="Website">
                  <Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://example.com" className="h-11" />
                </Field>
                <Field label="Founded Year">
                  <Input value={form.foundedYear} onChange={(e) => set("foundedYear", e.target.value)} placeholder="e.g. 2015" className="h-11" />
                </Field>
              </div>
              <Field label="GST Number">
                <Input value={form.gst} onChange={(e) => set("gst", e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5" className="h-11" />
              </Field>
              <Field label="About Company">
                <Textarea value={form.about} onChange={(e) => set("about", e.target.value)} placeholder="Brief description of the company…" className="min-h-[120px]" />
              </Field>
            </div>
          )}

          {tab === "relations" && (
            <div className="space-y-6">
              <Field label="Industry">
                <Select value={form.industry} onValueChange={(v) => { set("industry", v); set("subIndustry", ""); }}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select Industry" /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    {industries.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No industries yet — add them in Masters.</div>}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Sub Industry">
                <Select value={form.subIndustry} onValueChange={(v) => set("subIndustry", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder={form.industry ? "Select Sub Industry" : "Select an Industry first"} /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {filteredSubs.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                    {filteredSubs.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No sub industries for this industry.</div>}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Company Size">
                <Select value={form.companySize} onValueChange={(v) => set("companySize", v)}>
                  <SelectTrigger className="h-11"><SelectValue placeholder="Select Company Size" /></SelectTrigger>
                  <SelectContent className="max-h-64">
                    {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    {sizes.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No sizes yet — add them in Masters.</div>}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          )}

          {tab === "media" && (
            <div className="space-y-8">
              <div>
                <Label className="text-gray-700">Company Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="h-20 w-20 rounded-2xl bg-[#f4f5ff] flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                    {form.logo ? <img src={form.logo} alt="logo" className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-gray-300" />}
                  </div>
                  <div>
                    <input ref={logoRef} type="file" accept="image/*" onChange={onImg("logo", logoRef)} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => logoRef.current?.click()} className="border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
                      <Upload className="h-4 w-4 mr-2" /> Upload Logo
                    </Button>
                    {form.logo && <button type="button" onClick={() => set("logo", "")} className="ml-3 text-sm text-gray-400 hover:text-[#f61d25]">Remove</button>}
                    <p className="text-xs text-gray-400 mt-2">Square image recommended. Max 2MB.</p>
                  </div>
                </div>
              </div>
              <div>
                <Label className="text-gray-700">Banner Image</Label>
                <div className="mt-2">
                  <div className="h-36 w-full rounded-2xl bg-[#f4f5ff] flex items-center justify-center overflow-hidden border border-gray-100">
                    {form.banner ? <img src={form.banner} alt="banner" className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8 text-gray-300" />}
                  </div>
                  <div className="mt-3">
                    <input ref={bannerRef} type="file" accept="image/*" onChange={onImg("banner", bannerRef)} className="hidden" />
                    <Button type="button" variant="outline" onClick={() => bannerRef.current?.click()} className="border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
                      <Upload className="h-4 w-4 mr-2" /> Upload Banner
                    </Button>
                    {form.banner && <button type="button" onClick={() => set("banner", "")} className="ml-3 text-sm text-gray-400 hover:text-[#f61d25]">Remove</button>}
                    <p className="text-xs text-gray-400 mt-2">Wide image (e.g. 1200×300). Max 2MB.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "status" && (
            <div className="space-y-8">
              <div>
                <Label className="text-gray-700">Company Status <span className="text-[#f61d25]">*</span></Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {STATUS_OPTIONS.map((s) => (
                    <button key={s.value} type="button" onClick={() => set("status", s.value)}
                      className={`px-4 py-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                        form.status === s.value ? "border-transparent text-white shadow" : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                      style={form.status === s.value ? { background: s.color } : {}}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-gray-700">Trending</Label>
                <div className="flex items-center gap-3 mt-2">
                  <Switch checked={!!form.trending} onCheckedChange={(v) => set("trending", v)} className="data-[state=checked]:bg-[#f5b301]" />
                  <span className="text-sm text-gray-600">{form.trending ? "Enabled" : "Disabled"}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Trending companies can be highlighted across the platform.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
