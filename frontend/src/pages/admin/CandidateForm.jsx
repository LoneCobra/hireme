import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, Save, Loader2, X, User, Briefcase, GraduationCap,
  ShieldCheck, Upload, Check, AlertCircle, Mail, Phone, Calendar, MapPin,
  FileText, Star, DollarSign, Clock, Award, Building2,
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
import MultiSelect from "../../components/admin/MultiSelect";
import api from "../../lib/api";

const STEPS = [
  { key: "personal", label: "Personal", hint: "Contact & identity", Icon: User },
  { key: "professional", label: "Professional", hint: "Experience & pay", Icon: Briefcase },
  { key: "education", label: "Education & Skills", hint: "Qualifications", Icon: GraduationCap },
  { key: "status", label: "Profile & Status", hint: "Summary & visibility", Icon: ShieldCheck },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active", color: "#16a34a", desc: "Live & visible" },
  { value: "inactive", label: "Inactive", color: "#6b7280", desc: "Hidden from users" },
  { value: "pending", label: "Pending", color: "#d97706", desc: "Awaiting review" },
  { value: "blocked", label: "Blocked", color: "#f61d25", desc: "Restricted access" },
];

const GENDERS = ["Male", "Female", "Other"];
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

export default function CandidateForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;
  const photoRef = useRef(null);
  const resumeRef = useRef(null);

  const [step, setStep] = useState(0);
  const [unlocked, setUnlocked] = useState(0);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [expLevels, setExpLevels] = useState([]);
  const [eduCats, setEduCats] = useState([]);
  const [skillsOpts, setSkillsOpts] = useState([]);
  const [langOpts, setLangOpts] = useState([]);
  const [noticeOpts, setNoticeOpts] = useState([]);
  const [states, setStates] = useState([]);

  const [resumeName, setResumeName] = useState("");
  const [form, setForm] = useState({
    name: "", email: "", phone: "", gender: "", dob: "", city: "", state: "", photo: "",
    jobTitle: "", totalExperience: "", experienceLevel: "", currentSalary: "", expectedSalary: "", noticePeriod: "",
    educationCategory: "", skills: [], languages: [],
    about: "", resume: "", status: "pending", featured: false,
  });

  useEffect(() => {
    api.get("/experience-levels").then((r) => setExpLevels(r.data.map((x) => x.name)));
    api.get("/education-categories").then((r) => setEduCats(r.data.map((x) => x.name)));
    api.get("/skills").then((r) => setSkillsOpts(r.data.map((x) => x.name)));
    api.get("/languages").then((r) => setLangOpts(r.data.map((x) => x.name)));
    api.get("/notice-periods").then((r) => setNoticeOpts(r.data.map((x) => x.name)));
    api.get("/states").then((r) => setStates(r.data.map((x) => x.name)));
    if (isEdit) {
      api.get(`/candidates/${id}`).then((r) => {
        setForm((f) => ({ ...f, ...r.data, skills: r.data.skills || [], languages: r.data.languages || [] }));
        setUnlocked(STEPS.length - 1);
      });
    }
    // eslint-disable-next-line
  }, [id]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onFile = (key, ref, maxMb, onName) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxMb * 1024 * 1024) { toast({ title: "File too large", description: `Max ${maxMb}MB.`, variant: "destructive" }); return; }
    const reader = new FileReader();
    reader.onload = () => { set(key, reader.result); if (onName) onName(file.name); };
    reader.readAsDataURL(file);
    if (ref.current) ref.current.value = "";
  };

  const validateStep = (idx) => {
    const e = {};
    if (idx === 0) {
      if (!form.name.trim()) e.name = "Full name is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!emailRe.test(form.email.trim())) e.email = "Enter a valid email";
      if (!form.phone.trim()) e.phone = "Phone number is required";
    } else if (idx === 1) {
      if (!form.experienceLevel) e.experienceLevel = "Please select an experience level";
    }
    return e;
  };

  const goNext = () => {
    const e = validateStep(step);
    if (Object.keys(e).length) { setErrors(e); toast({ title: "Please complete required fields", variant: "destructive" }); return; }
    setErrors({});
    const next = Math.min(step + 1, STEPS.length - 1);
    setUnlocked((u) => Math.max(u, next));
    setStep(next);
  };

  const goStep = (idx) => {
    if (idx === step) return;
    if (idx < step) { setStep(idx); return; }
    if (idx <= unlocked) {
      const e = validateStep(step);
      if (Object.keys(e).length) { setErrors(e); toast({ title: "Please complete required fields", variant: "destructive" }); return; }
      setErrors({});
      setStep(idx);
    }
  };

  const save = async () => {
    for (let i = 0; i < STEPS.length; i++) {
      const e = validateStep(i);
      if (Object.keys(e).length) { setErrors(e); setStep(i); toast({ title: "Please complete required fields", variant: "destructive" }); return; }
    }
    setSaving(true);
    try {
      if (isEdit) await api.put(`/candidates/${id}`, form);
      else await api.post("/candidates", form);
      toast({ title: `Candidate ${isEdit ? "updated" : "created"} successfully` });
      navigate("/admin/candidates");
    } catch (err) {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const initials = (form.name || "Ca").slice(0, 2).toUpperCase();
  const isLast = step === STEPS.length - 1;
  const statusMeta = STATUS_OPTIONS.find((s) => s.value === form.status) || STATUS_OPTIONS[2];

  return (
    <AdminLayout title="Candidates">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <button data-testid="candidate-back-btn" onClick={() => navigate("/admin/candidates")} className="flex items-center gap-2 text-gray-500 hover:text-[#2c0eee] transition-colors">
          <span className="h-9 w-9 rounded-full border border-gray-200 flex items-center justify-center bg-white"><ArrowLeft className="h-4.5 w-4.5" /></span>
          <div className="text-left">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Candidates</p>
            <p className="font-head font-bold text-[#111] leading-tight">{isEdit ? "Edit Candidate" : "Add New Candidate"}</p>
          </div>
        </button>
        <Button data-testid="candidate-cancel-btn" variant="outline" onClick={() => navigate("/admin/candidates")} className="rounded-full"><X className="h-4 w-4 mr-1.5" /> Cancel</Button>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6 items-start">
        {/* LEFT: preview + stepper */}
        <aside className="space-y-5 lg:sticky lg:top-4">
          <div data-testid="candidate-preview-card" className="rounded-3xl overflow-hidden border border-gray-100 shadow-sm bg-white">
            <div className="h-24 relative" style={{ background: "linear-gradient(120deg,#10112b,#2c0eee)" }} />
            <div className="px-5 pb-5 -mt-9 relative z-10">
              <div className="h-[72px] w-[72px] rounded-full bg-white shadow-md ring-4 ring-white flex items-center justify-center overflow-hidden">
                {form.photo ? <img src={form.photo} alt="photo" className="h-full w-full object-cover" /> : <span className="font-head font-bold text-xl text-[#2c0eee]">{initials}</span>}
              </div>
              <p className="mt-3 font-head text-lg font-bold text-[#111] leading-snug break-words">{form.name || "New Candidate"}</p>
              <p className="text-sm text-gray-400">{form.jobTitle || "Job title not set"}</p>
              {(form.city || form.state) && <p className="flex items-center gap-1 text-xs text-gray-400 mt-1"><MapPin className="h-3 w-3" /> {[form.city, form.state].filter(Boolean).join(", ")}</p>}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold text-white capitalize" style={{ background: statusMeta.color }}>{statusMeta.label}</span>
                {form.featured && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#fff7e6] text-[#b45309]"><Star className="h-3 w-3" /> Featured</span>}
              </div>
            </div>
          </div>

          <nav className="rounded-3xl border border-gray-100 shadow-sm bg-white p-3" data-testid="candidate-stepper">
            {STEPS.map((s, i) => {
              const done = i < step || (i <= unlocked && Object.keys(validateStep(i)).length === 0 && i !== step);
              const active = i === step;
              const locked = i > unlocked;
              return (
                <button key={s.key} data-testid={`cstep-${s.key}`} onClick={() => goStep(i)} disabled={locked}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${active ? "bg-[#f4f5ff]" : locked ? "opacity-45 cursor-not-allowed" : "hover:bg-gray-50"}`}>
                  <span className={`h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-sm font-bold ${active ? "text-white" : done ? "bg-[#e7fbef] text-[#16a34a]" : "bg-gray-100 text-gray-400"}`} style={active ? { background: "linear-gradient(135deg,#2c0eee,#f61d25)" } : {}}>
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

            {/* STEP 0 — Personal */}
            {step === 0 && (
              <div className="space-y-5" data-testid="cstep-content-personal">
                <div>
                  <FieldLabel label="Full Name" required Icon={User} />
                  <Input data-testid="candidate-name-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Rahul Sharma" className={`mt-1.5 h-11 rounded-xl ${errors.name ? "border-[#f61d25]" : ""}`} />
                  <ErrorText msg={errors.name} />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel label="Email" required Icon={Mail} />
                    <Input data-testid="candidate-email-input" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" className={`mt-1.5 h-11 rounded-xl ${errors.email ? "border-[#f61d25]" : ""}`} />
                    <ErrorText msg={errors.email} />
                  </div>
                  <div>
                    <FieldLabel label="Phone" required Icon={Phone} />
                    <Input data-testid="candidate-phone-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="e.g. 9876543210" className={`mt-1.5 h-11 rounded-xl ${errors.phone ? "border-[#f61d25]" : ""}`} />
                    <ErrorText msg={errors.phone} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel label="Gender" Icon={User} />
                    <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                      <SelectTrigger data-testid="candidate-gender-select" className="mt-1.5 h-11 rounded-xl"><SelectValue placeholder="Select Gender" /></SelectTrigger>
                      <SelectContent>{GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FieldLabel label="Date of Birth" Icon={Calendar} />
                    <Input data-testid="candidate-dob-input" type="date" value={form.dob} onChange={(e) => set("dob", e.target.value)} className="mt-1.5 h-11 rounded-xl" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel label="State" Icon={MapPin} />
                    <Select value={form.state} onValueChange={(v) => set("state", v)}>
                      <SelectTrigger data-testid="candidate-state-select" className="mt-1.5 h-11 rounded-xl"><SelectValue placeholder="Select State" /></SelectTrigger>
                      <SelectContent className="max-h-64">{states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <FieldLabel label="City" Icon={MapPin} />
                    <Input data-testid="candidate-city-input" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Ahmedabad" className="mt-1.5 h-11 rounded-xl" />
                  </div>
                </div>
                <div>
                  <FieldLabel label="Profile Photo" Icon={User} />
                  <div className="mt-2 flex items-center gap-5 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="h-20 w-20 rounded-full bg-[#f4f5ff] flex items-center justify-center overflow-hidden shrink-0 border border-gray-100">
                      {form.photo ? <img src={form.photo} alt="photo" className="h-full w-full object-cover" /> : <User className="h-7 w-7 text-gray-300" />}
                    </div>
                    <div>
                      <input ref={photoRef} type="file" accept="image/*" onChange={onFile("photo", photoRef, 2)} className="hidden" />
                      <Button data-testid="candidate-photo-upload" type="button" variant="outline" onClick={() => photoRef.current?.click()} className="rounded-full border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
                        <Upload className="h-4 w-4 mr-2" /> {form.photo ? "Change Photo" : "Upload Photo"}
                      </Button>
                      {form.photo && <button type="button" onClick={() => set("photo", "")} className="ml-3 text-sm text-gray-400 hover:text-[#f61d25]">Remove</button>}
                      <p className="text-xs text-gray-400 mt-2">Square image recommended. Max 2MB.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1 — Professional */}
            {step === 1 && (
              <div className="space-y-5" data-testid="cstep-content-professional">
                <div>
                  <FieldLabel label="Current Job Title" Icon={Briefcase} />
                  <Input data-testid="candidate-jobtitle-input" value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} placeholder="e.g. Senior Software Engineer" className="mt-1.5 h-11 rounded-xl" />
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel label="Total Experience" Icon={Clock} />
                    <Input data-testid="candidate-totalexp-input" value={form.totalExperience} onChange={(e) => set("totalExperience", e.target.value)} placeholder="e.g. 5 years" className="mt-1.5 h-11 rounded-xl" />
                  </div>
                  <div>
                    <FieldLabel label="Experience Level" required Icon={Award} />
                    <Select value={form.experienceLevel} onValueChange={(v) => set("experienceLevel", v)}>
                      <SelectTrigger data-testid="candidate-explevel-select" className={`mt-1.5 h-11 rounded-xl ${errors.experienceLevel ? "border-[#f61d25]" : ""}`}><SelectValue placeholder="Select Experience Level" /></SelectTrigger>
                      <SelectContent className="max-h-64">
                        {expLevels.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        {expLevels.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No levels yet — add them in Masters.</div>}
                      </SelectContent>
                    </Select>
                    <ErrorText msg={errors.experienceLevel} />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <FieldLabel label="Current Salary" Icon={DollarSign} />
                    <Input data-testid="candidate-cursalary-input" value={form.currentSalary} onChange={(e) => set("currentSalary", e.target.value)} placeholder="e.g. 8 LPA" className="mt-1.5 h-11 rounded-xl" />
                  </div>
                  <div>
                    <FieldLabel label="Expected Salary" Icon={DollarSign} />
                    <Input data-testid="candidate-expsalary-input" value={form.expectedSalary} onChange={(e) => set("expectedSalary", e.target.value)} placeholder="e.g. 12 LPA" className="mt-1.5 h-11 rounded-xl" />
                  </div>
                </div>
                <div>
                  <FieldLabel label="Notice Period" Icon={Clock} />
                  <Select value={form.noticePeriod} onValueChange={(v) => set("noticePeriod", v)}>
                    <SelectTrigger data-testid="candidate-notice-select" className="mt-1.5 h-11 rounded-xl"><SelectValue placeholder="Select Notice Period" /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {noticeOpts.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      {noticeOpts.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No options yet — add them in Masters.</div>}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* STEP 2 — Education & Skills */}
            {step === 2 && (
              <div className="space-y-5" data-testid="cstep-content-education">
                <div>
                  <FieldLabel label="Education Category" Icon={GraduationCap} />
                  <Select value={form.educationCategory} onValueChange={(v) => set("educationCategory", v)}>
                    <SelectTrigger data-testid="candidate-education-select" className="mt-1.5 h-11 rounded-xl"><SelectValue placeholder="Select Education Category" /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {eduCats.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      {eduCats.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No categories yet — add them in Masters.</div>}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <FieldLabel label="Skills" Icon={Award} />
                  <div className="mt-1.5">
                    <MultiSelect testId="candidate-skills-multiselect" options={skillsOpts} value={form.skills} onChange={(v) => set("skills", v)} placeholder="Select skills…" emptyText="No skills — add them in Masters." />
                  </div>
                </div>
                <div>
                  <FieldLabel label="Languages" Icon={Award} />
                  <div className="mt-1.5">
                    <MultiSelect testId="candidate-languages-multiselect" options={langOpts} value={form.languages} onChange={(v) => set("languages", v)} placeholder="Select languages…" emptyText="No languages — add them in Masters." />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3 — Profile & Status */}
            {step === 3 && (
              <div className="space-y-6" data-testid="cstep-content-status">
                <div>
                  <FieldLabel label="About / Summary" Icon={FileText} />
                  <div className="mt-1.5">
                    <RichTextEditor testId="candidate-about-editor" value={form.about} onChange={(v) => set("about", v)} placeholder="Professional summary — strengths, achievements, career goals…" minHeight={180} />
                  </div>
                </div>
                <div>
                  <FieldLabel label="Resume" Icon={FileText} />
                  <div className="mt-2 flex items-center gap-4 p-4 rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="h-14 w-14 rounded-xl bg-[#f4f5ff] flex items-center justify-center shrink-0"><FileText className="h-6 w-6 text-[#2c0eee]" /></div>
                    <div className="min-w-0">
                      <input ref={resumeRef} type="file" accept=".pdf,.doc,.docx" onChange={onFile("resume", resumeRef, 5, setResumeName)} className="hidden" />
                      <Button data-testid="candidate-resume-upload" type="button" variant="outline" onClick={() => resumeRef.current?.click()} className="rounded-full border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white">
                        <Upload className="h-4 w-4 mr-2" /> {form.resume ? "Change Resume" : "Upload Resume"}
                      </Button>
                      {form.resume && <button type="button" onClick={() => { set("resume", ""); setResumeName(""); }} className="ml-3 text-sm text-gray-400 hover:text-[#f61d25]">Remove</button>}
                      <p className="text-xs text-gray-400 mt-2 truncate">{resumeName || (form.resume ? "Resume attached" : "PDF or Word. Max 5MB.")}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <FieldLabel label="Status" required Icon={ShieldCheck} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                    {STATUS_OPTIONS.map((s) => (
                      <button key={s.value} data-testid={`cstatus-${s.value}`} type="button" onClick={() => set("status", s.value)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${form.status === s.value ? "border-transparent shadow-md ring-2" : "border-gray-200 hover:border-gray-300"}`}
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
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#111]"><Star className="h-4 w-4 text-[#b45309]" /> Featured</p>
                    <p className="text-xs text-gray-500 mt-1">Featured candidates can be highlighted across the platform.</p>
                  </div>
                  <Switch data-testid="candidate-featured-switch" checked={!!form.featured} onCheckedChange={(v) => set("featured", v)} className="data-[state=checked]:bg-[#f5b301]" />
                </div>
              </div>
            )}
          </div>

          {/* Bottom nav */}
          <div className="flex items-center justify-between gap-3 px-6 md:px-8 py-5 border-t border-gray-100">
            <Button data-testid="cwizard-back-btn" variant="outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))} className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
            {isLast ? (
              <Button data-testid="cwizard-submit-btn" onClick={save} disabled={saving} className="rounded-full text-white font-semibold px-6" style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</> : <><Save className="h-4 w-4 mr-2" /> {isEdit ? "Save Changes" : "Create Candidate"}</>}
              </Button>
            ) : (
              <Button data-testid="cwizard-next-btn" onClick={goNext} className="rounded-full text-white font-semibold px-6" style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
                Continue <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
