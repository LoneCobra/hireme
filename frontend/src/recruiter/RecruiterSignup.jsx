import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft, Building2, Handshake, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import recruiterApi, { setRecruiterToken } from "./recruiterApi";

const BLUE = "#2c0eee";
const RED = "#f61d25";

function Field({ label, required, children }) {
  return (
    <div>
      <Label className="text-[13px] font-semibold text-gray-700">{label}{required && <span className="text-[#f61d25]"> *</span>}</Label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

export default function RecruiterSignup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accountType, setAccountType] = useState("company");
  const [industries, setIndustries] = useState([]);
  const [subIndustries, setSubIndustries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    companyName: "", fullName: "", email: "", password: "", mobile: "", designation: "",
    industry: "", subIndustry: "", addressLine1: "", addressLine2: "",
    state: "", city: "", country: "India", zipCode: "",
  });

  useEffect(() => {
    recruiterApi.get("/public/industries").then((r) => setIndustries(r.data.map((x) => x.name))).catch(() => {});
    recruiterApi.get("/public/sub-industries").then((r) => setSubIndustries(r.data)).catch(() => {});
    recruiterApi.get("/public/states").then((r) => setStates(r.data.map((x) => x.name))).catch(() => {});
  }, []);

  useEffect(() => {
    if (form.state) recruiterApi.get(`/public/cities?state=${encodeURIComponent(form.state)}`).then((r) => setCities(r.data.map((x) => x.name))).catch(() => setCities([]));
    else setCities([]);
  }, [form.state]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const filteredSubs = subIndustries.filter((s) => !form.industry || s.industry === form.industry);

  const submit = async (e) => {
    e.preventDefault();
    const req = ["companyName", "fullName", "email", "password", "mobile", "designation"];
    for (const k of req) if (!String(form[k]).trim()) { toast({ title: "Please fill all required fields", variant: "destructive" }); return; }
    if (!accepted) { toast({ title: "Please accept the Terms of Service", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data } = await recruiterApi.post("/recruiter/signup", { ...form, accountType });
      setRecruiterToken(data.access_token);
      toast({ title: "Account created!", description: "Your company is pending approval." });
      navigate("/recruiter");
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({ title: typeof detail === "string" ? detail : "Signup failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]" style={{ fontFamily: "Poppins, sans-serif" }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/recruiter" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#2c0eee] mb-6"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7 sm:p-10">
          <div className="text-center">
            <span className="font-head font-extrabold text-2xl" style={{ color: BLUE }}>Hire<span style={{ color: RED }}>Me</span></span>
            <h1 className="mt-4 font-head text-3xl font-extrabold">Create an Account</h1>
            <p className="mt-2 text-gray-500">Join us and start hiring the best talent.</p>
          </div>

          {/* Account type */}
          <div className="mt-7 grid grid-cols-2 gap-3">
            {[{ k: "company", label: "Company", Icon: Building2 }, { k: "consultant", label: "Consultant", Icon: Handshake }].map((t) => (
              <button key={t.k} type="button" data-testid={`rec-acctype-${t.k}`} onClick={() => setAccountType(t.k)}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold text-sm transition-all ${accountType === t.k ? "border-transparent text-white shadow" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                style={accountType === t.k ? { background: `linear-gradient(90deg, ${BLUE}, ${RED})` } : {}}>
                <t.Icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} data-testid="rec-signup-form" className="mt-8 space-y-8">
            {/* Basic Information */}
            <div>
              <p className="font-head font-bold text-lg mb-4">Basic Information</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label={accountType === "company" ? "Company / Firm Name" : "Firm Name"} required>
                  <Input data-testid="rec-su-company" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} placeholder="e.g. Acme Technologies" className="h-11 rounded-xl" />
                </Field>
                <Field label="Full Name" required>
                  <Input data-testid="rec-su-fullname" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="e.g. Rahul Sharma" className="h-11 rounded-xl" />
                </Field>
                <Field label="Email" required>
                  <Input data-testid="rec-su-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@company.com" className="h-11 rounded-xl" />
                </Field>
                <Field label="Password" required>
                  <Input data-testid="rec-su-password" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" className="h-11 rounded-xl" />
                </Field>
                <Field label="Mobile" required>
                  <Input data-testid="rec-su-mobile" value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="e.g. 9876543210" className="h-11 rounded-xl" />
                </Field>
                <Field label="Designation" required>
                  <Input data-testid="rec-su-designation" value={form.designation} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. HR Manager" className="h-11 rounded-xl" />
                </Field>
              </div>
            </div>

            {/* Company Details */}
            <div>
              <p className="font-head font-bold text-lg mb-4">Company Details</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Industry">
                  <Select value={form.industry} onValueChange={(v) => { set("industry", v); set("subIndustry", ""); }}>
                    <SelectTrigger data-testid="rec-su-industry" className="h-11 rounded-xl"><SelectValue placeholder="Select industry" /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                      {industries.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No industries available.</div>}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Sub Industry">
                  <Select value={form.subIndustry} onValueChange={(v) => set("subIndustry", v)}>
                    <SelectTrigger data-testid="rec-su-subindustry" className="h-11 rounded-xl"><SelectValue placeholder={form.industry ? "Select sub-industry" : "Select industry first"} /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {filteredSubs.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                      {filteredSubs.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No sub-industries.</div>}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </div>

            {/* Address */}
            <div>
              <p className="font-head font-bold text-lg mb-4">Address</p>
              <div className="grid sm:grid-cols-2 gap-5">
                <Field label="Address Line 1" required>
                  <Input data-testid="rec-su-addr1" value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} placeholder="Street address" className="h-11 rounded-xl" />
                </Field>
                <Field label="Address Line 2">
                  <Input data-testid="rec-su-addr2" value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} placeholder="Apartment, suite, etc. (optional)" className="h-11 rounded-xl" />
                </Field>
                <Field label="State" required>
                  <Select value={form.state} onValueChange={(v) => { set("state", v); set("city", ""); }}>
                    <SelectTrigger data-testid="rec-su-state" className="h-11 rounded-xl"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {states.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      {states.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No states available.</div>}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="City" required>
                  <Select value={form.city} onValueChange={(v) => set("city", v)} disabled={!form.state}>
                    <SelectTrigger data-testid="rec-su-city" className="h-11 rounded-xl"><SelectValue placeholder={form.state ? "Select city" : "Select state first"} /></SelectTrigger>
                    <SelectContent className="max-h-64">
                      {cities.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      {cities.length === 0 && form.state && <div className="px-3 py-2 text-sm text-gray-400">No cities for this state.</div>}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Country">
                  <Input data-testid="rec-su-country" value={form.country} onChange={(e) => set("country", e.target.value)} className="h-11 rounded-xl" />
                </Field>
                <Field label="Zip Code" required>
                  <Input data-testid="rec-su-zip" value={form.zipCode} onChange={(e) => set("zipCode", e.target.value)} placeholder="e.g. 380001" className="h-11 rounded-xl" />
                </Field>
              </div>
            </div>

            <label className="flex items-start gap-3 text-sm text-gray-600">
              <input data-testid="rec-su-terms" type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[#2c0eee]" />
              <span>I accept the <a href="#" className="text-[#2c0eee] hover:underline">Terms of Service</a> and <a href="#" className="text-[#2c0eee] hover:underline">Privacy Policy</a> <span className="text-[#f61d25]">*</span></span>
            </label>

            <Button data-testid="rec-su-submit" type="submit" disabled={loading} className="w-full h-12 rounded-xl text-white font-semibold" style={{ background: `linear-gradient(90deg, ${BLUE}, ${RED})` }}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account…</> : <><CheckCircle2 className="h-4 w-4 mr-2" /> Create {accountType === "company" ? "Company" : "Consultant"} Account</>}
            </Button>
            <p className="text-sm text-center text-gray-500">
              Already have an account? <Link to="/recruiter" className="font-semibold text-[#2c0eee] hover:underline">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
