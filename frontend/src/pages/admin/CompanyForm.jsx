import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Save, Loader2, X, Info, Link2, ImagePlus, ShieldCheck,
  Upload, Check, AlertCircle, Globe, Calendar, FileText, Building2, TrendingUp,
  Factory, Layers, Users,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { useToast } from "../../hooks/use-toast";
import RichTextEditor from "../../components/admin/RichTextEditor";
import api from "../../lib/api";

const STEPS = [
  { key: "overview", label: "Overview", hint: "Basic details", Icon: Info },
  { key: "relations", label: "Relations", hint: "Industry & size", Icon: Link2 },
  { key: "media", label: "Media", hint: "Logo & banner", Icon: ImagePlus },
  { key: "status", label: "Status & Flags", hint: "Visibility", Icon: ShieldCheck },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "#16a34a", desc: "Live & visible" },
  { value: "inactive", label: "Inactive", color: "#6b7280", desc: "Hidden from users" },
  { value: "pending", label: "Pending", color: "#d97706", desc: "Awaiting review" },
  { value: "blocked", label: "Blocked", color: "#f61d25", desc: "Restricted access" },
];

const stripHtml = (html) => (html || "").replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();

function FieldLabel({ label, required, Icon }) {
  return (
    <Label className="flex items-center gap-2 text-[13px] font-semibold text-gray-700">
      {Icon && <Icon className="h-3.5 w-3.5 text-gray-400" />}
      {label}{required && <span className="text-[#f61d25]">*</span>}
    </Label>
  );
}

function ErrorText({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-[#f61d25]">
      <AlertCircle className="h-3.5 w-3.5" /> {msg}
    </p>
  );
}

export default function CompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const logoRef = useRef(null);
  const bannerRef = useRef(null);

  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(0); // highest reachable step index
  const [errors, setErrors] = useState({});
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
      api.get(`/companies/${id}`).then((r) => {
        setForm((f) => ({ ...f, ...r.data }));
        setUnlocked(STEPS.length - 1); // all steps reachable when editing
      });
    }
    // eslint-disable-next-line
  }, [id]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

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

  // Validate a given step. Returns errors object (empty = valid).
  const validateStep = (idx) => {
    const e = {};
    if (idx === 0) {
      if (!form.name.trim()) e.name = "Company name is required";
      if (!stripHtml(form.about)) e.about = "About company is required";
    } else if (idx === 1) {
      if (!form.industry) e.industry = "Please select an industry";
      if (!form.companySize) e.companySize = "Please select a company size";
    } else if (idx === 2) {
      if (!form.logo) e.logo = "Company logo is required";
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) {
      setErrors(e);
      toast({ title: "Please complete required fields", variant: "destructive" });
      return;
    }
    setErrors({});
    const next = Math.min(step + 1, STEPS.length - 1);
    setUnlocked((u) => Math.max(u, next));
    setStep(next);
  };

  const goStep = (idx) => {
    if (idx === step) return;
    if (idx < step) { setStep(idx); return; } // going back is always allowed
    if (idx <= unlocked) { // jumping forward only to unlocked steps, still gate current
      const e = validateStep(step);
      if (Object.keys(e).length) { setErrors(e); toast({ title: "Please complete required fields", variant: "destructive" }); return; }
      setErrors({});
      setStep(idx);
    }
  };

  const save = async () => {
    // validate every gating step before saving
    for (let i = 0; i < STEPS.length; i++) {
      const e = validateStep(i);
      if (Object.keys(e).length) { setErrors(e); setStep(i); toast({ title: "Please complete required fields", variant: "destructive" }); return; }
    }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/companies/${id}`, form);
      else await api.post("/companies", form);
      toast({ title: `Company ${isEdit ? "updated" : "created"} successfully` });
      navigate("/admin/companies");
    } catch (err) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const initials = (form.name || "Co").slice(0, 2).toUpperCase();
  const filteredSubs = subIndustries.filter((s) => !form.industry || s.industry === form.industry);
  const isLast = step === STEPS.length - 1;
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === form.status) || STATUS_OPTIONS[2];

  return (
    <AdminLayout title="Companies">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button data-testid="company-back-btn" onClick={() => navigate("/admin/companies")} className="flex items-center gap-2 text-gray-500 hover:text-[#2c0eee] transition-colors">
          <span className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center bg-white group-hover:border-[#2c0eee]"><ArrowLeft className="h-4.5 w-4.5" /></span>
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Companies</p>
            <p className="font-head font-bold text-[#111] leading-tight">{isEdit ? "Edit Company" : "Add New Company"}</p>
          </div>
        </button>
        <div className="flex items-center gap-2.5">
          <Button data-testid="company-cancel-btn" variant="outline" onClick={() => navigate("/admin/companies")} className="rounded-full"><X className="h-4 w-4 mr-1.5" /> Cancel</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* LEFT: live preview + vertical progress on desktop */}
        <aside className="space-y-5 lg:sticky lg:top-4">
          {/* Live preview card */}
          <div data-testid="company-preview-card" className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
            <div className="h-24 relative" style={{ background: "linear-gradient(120deg,#10112b,#2c0eee)" }}>
              {form.banner && <img src={form.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />}
            </div>
            <div className="px-5 pb-5 -mt-9">
              <div className="h-[72px] w-[72px] rounded-2xl bg-white shadow-md ring-4 ring-white flex items-center justify-center overflow-hidden">
                {form.logo ? <img src={form.logo} alt="logo" className="h-full w-full object-cover" /> : <span className="font-head font-bold text-xl text-[#2c0eee]">{initials}</span>}
              </div>
              <p className="mt-3 font-head text-lg font-bold text-[#111] leading-snug break-words">{form.name || "New Company"}</p>
              <p className="text-sm text-gray-400">{form.industry || "Industry not set"}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white capitalize" style={{ background: statusMeta.color }}>{statusMeta.label}</span>
                {form.trending && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff7e6] text-[#b45309]"><TrendingUp className="h-3 w-3" /> Trending</span>}
              </div>
            </div>
          </div>

          {/* Stepper */}
          <nav className="rounded-3xl border border-gray-100 shadow-sm bg-white p-3" data-testid="company-stepper">
            {STEPS.map((s, i) => {
              const done = i < step || (i <= unlocked && Object.keys(validateStep(i)).length === 0 && i !== step);
              const active = i === step;
              const locked = i > unlocked;
              return (
                <button
                  key={s.key}
                  data-testid={`step-${s.key}`}
                  onClick={() => goStep(i)}
                  disabled={locked}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                    active ? "bg-[#f4f5ff]" : locked ? "opacity-45 cursor-not-allowed" : "hover:bg-gray-50"
                  }`}
                >
                  <span className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold transition-colors ${
                    active ? "text-white" : done ? "bg-[#e7fbef] text-[#16a34a]" : "bg-gray-100 text-gray-400"
                  }`} style={active ? { background: "linear-gradient(135deg,#2c0eee,#f61d25)" } : {}}>
                    {done ? <Check className="h-4.5 w-4.5" /> : <s.Icon className="h-4.5 w-4.5" />}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-sm font-semibold ${active ? "text-[#2c0eee]" : "text-[#111]"}`}>{s.label}</span>
                    <span className="block text-xs text-gray-400 truncate">{s.hint}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* RIGHT: step content */}
        <section className="rounded-3xl border border-gray-100 shadow-sm bg-white min-h-[520px] flex flex-col">
          {/* Progress bar */}
          <div className="px-6 md:px-8 pt-6">
            <div className="flex items-center justify-between text-xs font-medium text-gray-400 mb-2">
              <span>Step {step + 1} of {STEPS.length}</span>
              <span>{Math.round(((step + 1) / STEPS.length) * 100)}% complete</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%`, background: "linear-gradient(90deg,#2c0eee,#f61d25)" }} />
            </div>
          </div>

          <div className="p-6 md:p-8 flex-1">
            <div className="mb-6">
              <h2 className="font-head text-xl font-bold text-[#111]">{STEPS[step].label}</h2>
              <p className="text-sm text-gray-400">{STEPS[step].hint}</p>
            </div>

            {/* STEP 0 — Overview */}
            {step === 0 && (
              <div className="space-y-5" data-testid="step-content-overview">
                <div>
                  <FieldLabel label="Company Name" required Icon={Building2} />
                  <Input data-testid="company-name-input" value={form.name} onChange={(e) => { set("name", e.target.value); if (!isEdit) set("slug", autoSlug(e.target.value)); }} placeholder="e.g. Maxgen Technologies" className={`mt-1.5 h-11 rounded-xl ${errors.name ? "border-[#f61d25]" : ""}`} />
                  <ErrorText msg={errors.name} />
                </div>
                <div>
                  <FieldLabel label="Slug (URL identifier)" Icon={Link2} />
                  <Input data-testid="company-slug-input" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="e.g. maxgen-technologies" className="mt-1.5 h-11 rounded-xl" />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel label="Website" Icon={Globe} />
                    <Input data-testid="company-website-input" value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://example.com" className="mt-1.5 h-11 rounded-xl" />
                  </div>
                  <div>
                    <FieldLabel label="Founded Year" Icon={Calendar} />
                    <Input data-testid="company-year-input" value={form.foundedYear} onChange={(e) => set("foundedYear", e.target.value)} placeholder="e.g. 2015" className="mt-1.5 h-11 rounded-xl" />
                  </div>
                </div>
                <div>
                  <FieldLabel label="GST Number" Icon={FileText} />
                  <Input data-testid="company-gst-input" value={form.gst} onChange={(e) => set("gst", e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5" className="mt-1.5 h-11 rounded-xl" />
                </div>
                <div>
                  <FieldLabel label="About Company" required Icon={FileText} />
                  <div className="mt-1.5">
                    <RichTextEditor testId="company-about-editor" value={form.about} onChange={(v) => set("about", v)} placeholder="Describe the company — mission, culture, what makes it stand out…" minHeight={200} />
                  </div>
                  <ErrorText msg={errors.about} />
                </div>
              </div>
            )}

            {/* STEP 1 — Relations */}
            {step === 1 && (
              <div className="space-y-5" data-testid="step-content-relations">
                <div>
                  <FieldLabel label="Industry" required Icon={Factory} />
                  <Select value={form.industry} onValueChange={(v) => { set("industry", v); set("subIndustry", ""); }}>
                    <SelectTrigger data-testid="company-industry-select" className={`mt-1.5 h-11 rounded-xl ${errors.industry ? "border-[#f61d25]" : ""}`}><SelectValue placeholder="Select Industry" /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      {industries.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No industries yet — add them in Masters.</div>}
                    </SelectContent>
                  </Select>
                  <ErrorText msg={errors.industry} />
                </div>
                <div>
                  <FieldLabel label="Sub Industry" Icon={Layers} />
                  <Select value={form.subIndustry} onValueChange={(v) => set("subIndustry", v)}>
                    <SelectTrigger data-testid="company-subindustry-select" className="mt-1.5 h-11 rounded-xl"><SelectValue placeholder={form.industry ? "Select Sub Industry" : "Select an Industry first"} /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {filteredSubs.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                      {filteredSubs.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No sub industries for this industry.</div>}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FieldLabel label="Company Size" required Icon={Users} />
                  <Select value={form.companySize} onValueChange={(v) => set("companySize", v)}>
                    <SelectTrigger data-testid="company-size-select" className={`mt-1.5 h-11 rounded-xl ${errors.companySize ? "border-[#f61d25]" : ""}`}><SelectValue placeholder="Select Company Size" /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {sizes.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      {sizes.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No sizes yet — add them in Masters.</div>}
                    </SelectContent>
                  </Select>
                  <ErrorText msg={errors.companySize} />
                </div>
              </div>
            )}

            {/* STEP 2 — Media */}
            {step === 2 && (
              <div className="space-y-8" data-testid="step-content-media">
                <div>
                  <FieldLabel label="Company Logo" required Icon={ImagePlus} />
                  <div className={`mt-2 flex items-center gap-5 p-4 rounded-2xl border-2 border-dashed ${errors.logo ? "border-[#f61d25]" : "border-gray-200"}`}>
                    <div className="h-20 w-20 rounded-2xl bg-[#f4f5ff] flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                      {form.logo ? <img src={form.logo} alt="logo" className="h-full w-full object-cover" /> : <ImagePlus className="h-7 w-7 text-gray-300" />}
                    </div>
                    <div>
                      <input ref={logoRef} type="file" accept="image/*" onChange={onImg("logo", logoRef)} className="hidden" />
                      <Button data-testid="company-logo-upload" type="button" variant="outline" onClick={() => logoRef.current?.click()} className="rounded-full border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
                        <Upload className="h-4 w-4 mr-2" /> {form.logo ? "Change Logo" : "Upload Logo"}
                      </Button>
                      {form.logo && <button type="button" onClick={() => set("logo", "")} className="ml-3 text-sm text-gray-400 hover:text-[#f61d25]">Remove</button>}
                      <p className="text-xs text-gray-400 mt-2">Square image recommended. Max 2MB.</p>
                    </div>
                  </div>
                  <ErrorText msg={errors.logo} />
                </div>
                <div>
                  <FieldLabel label="Banner Image" Icon={ImagePlus} />
                  <div className="mt-2 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="h-36 w-full rounded-xl bg-[#f4f5ff] flex items-center justify-center overflow-hidden border border-gray-100">
                      {form.banner ? <img src={form.banner} alt="banner" className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8 text-gray-300" />}
                    </div>
                    <div className="mt-3">
                      <input ref={bannerRef} type="file" accept="image/*" onChange={onImg("banner", bannerRef)} className="hidden" />
                      <Button data-testid="company-banner-upload" type="button" variant="outline" onClick={() => bannerRef.current?.click()} className="rounded-full border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
                        <Upload className="h-4 w-4 mr-2" /> {form.banner ? "Change Banner" : "Upload Banner"}
                      </Button>
                      {form.banner && <button type="button" onClick={() => set("banner", "")} className="ml-3 text-sm text-gray-400 hover:text-[#f61d25]">Remove</button>}
                      <p className="text-xs text-gray-400 mt-2">Wide image (e.g. 1200×300). Max 2MB.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Status */}
            {step === 3 && (
              <div className="space-y-8" data-testid="step-content-status">
                <div>
                  <FieldLabel label="Company Status" required Icon={ShieldCheck} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s.value} data-testid={`status-${s.value}`} type="button" onClick={() => set("status", s.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                          form.status === s.value ? "border-transparent shadow-md ring-2" : "border-gray-200 hover:border-gray-300"
                        }`}
                        style={form.status === s.value ? { "--tw-ring-color": s.color, background: `${s.color}0d` } : {}}>
                        <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span>
                          <span className="block text-sm font-semibold capitalize" style={{ color: form.status === s.value ? s.color : "#111" }}>{s.label}</span>
                          <span className="block text-xs text-gray-400">{s.desc}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-[#fffaf0] border border-[#fce8c3]">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#111]"><TrendingUp className="h-4 w-4 text-[#b45309]" /> Trending</p>
                    <p className="text-xs text-gray-500 mt-1">Trending companies can be highlighted across the platform.</p>
                  </div>
                  <Switch data-testid="company-trending-switch" checked={!!form.trending} onCheckedChange={(v) => set("trending", v)} className="data-[state=checked]:bg-[#f5b301]" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-between gap-3 px-6 md:px-8 py-5 border-t border-gray-100">
            <Button data-testid="wizard-back-btn" variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
            {isLast ? (
              <Button data-testid="wizard-submit-btn" onClick={save} disabled={saving} className="rounded-full text-white font-semibold px-6" style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : <><Save className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : "Create Company"}</>}
              </Button>
            ) : (
              <Button data-testid="wizard-next-btn" onClick={goNext} className="rounded-full text-white font-semibold px-6" style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
                Continue <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
