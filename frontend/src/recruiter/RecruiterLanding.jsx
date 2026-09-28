import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Briefcase, Megaphone, ShieldCheck, Users, CheckCircle2, Star,
  ArrowRight, Loader2, LogOut, Building2, TrendingUp, Sparkles, Menu, X,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "../components/ui/accordion";
import { useToast } from "../hooks/use-toast";
import recruiterApi, { setRecruiterToken, getRecruiterToken, clearRecruiterToken, REC_IMAGES } from "./recruiterApi";

const BLUE = "#2c0eee";
const RED = "#f61d25";

const PLANS = [
  {
    name: "Free", tag: "For occasional hiring", price: "₹0", period: "30 Days",
    highlight: false,
    features: ["1 Job posting", "15 days job duration", "Standard visibility", "Basic applicant tracking", "Email support"],
  },
  {
    name: "Standard", tag: "For growing teams", price: "₹1,599", period: "60 Days", strike: "₹1,999", offer: "20% OFF",
    highlight: true,
    features: ["3 Job postings", "45 days job duration", "AI job description generator", "Boosted visibility", "Applicant Tracking System", "Priority email support"],
  },
  {
    name: "Business", tag: "For high-volume hiring", price: "₹13,999", period: "180 Days", strike: "₹14,999", offer: "₹1,000 OFF",
    highlight: false,
    features: ["50 Job postings", "60 days job duration", "AI job description generator", "Premium visibility", "Full ATS + team seats", "Dedicated account manager"],
  },
];

const SERVICES = [
  {
    img: REC_IMAGES.talent, tag: "Talent Search", title: "Search & Find Top Talent",
    desc: "Discover qualified candidates using advanced search, smart filters and AI-powered matching to find the right professionals faster.",
    points: ["AI-powered talent matching", "Advanced candidate search", "Smart filters & alerts", "Direct candidate engagement"],
    cta: "Search Candidates", Icon: Search,
  },
  {
    img: REC_IMAGES.jobpost, tag: "Job Posting", title: "Post Jobs & Hire Faster",
    desc: "Reach qualified job seekers with powerful job posting solutions designed to increase visibility and accelerate recruitment.",
    points: ["Quick job posting", "Featured & premium jobs", "Increased job visibility", "Application management"],
    cta: "Post a Job", Icon: Briefcase,
  },
  {
    img: REC_IMAGES.ads, tag: "Recruitment Ads", title: "Promote Jobs with Social Ads",
    desc: "Expand your hiring reach with targeted recruitment advertising across social media and digital channels.",
    points: ["Targeted recruitment ads", "AI candidate targeting", "Multi-platform promotion", "Campaign performance tracking"],
    cta: "Start Advertising", Icon: Megaphone,
  },
];

const STAFFING = [
  { title: "Employee Onboarding", desc: "Streamlined onboarding process for your contract staff." },
  { title: "Payroll & Compliance", desc: "Complete payroll with PF, ESIC, PT and TDS compliance." },
  { title: "HR Support", desc: "Dedicated HR support for attendance, leave management & more." },
  { title: "Statutory Obligations", desc: "Full compliance management for all statutory requirements." },
];

const TESTIMONIALS = [
  { name: "Amisha Shekhawat", role: "HR Lead, TechNova", text: "We filled three engineering roles in under two weeks. The candidate quality was outstanding." },
  { name: "Rohit Menon", role: "Founder, CloudCove", text: "The AI matching saved my team hours of screening every single day. Highly recommended." },
  { name: "Jalpa Kawa", role: "Talent Partner, BrightHR", text: "Posting jobs is effortless and the visibility we get is genuinely better than other portals." },
  { name: "Dexter Fernandes", role: "Recruiter, Skysoft", text: "Great database access and fantastic support. Our time-to-hire dropped dramatically." },
];

const FAQS = [
  { q: "What is HireMe?", a: "HireMe is an AI-powered recruitment and workforce solutions platform that helps companies find qualified candidates, post jobs, access candidate databases, manage recruitment, and outsource workforce requirements." },
  { q: "How can my company hire candidates through HireMe?", a: "Create a recruiter account, choose a plan, post your jobs and search our verified candidate database. You can engage candidates directly and manage every application from your dashboard." },
  { q: "Can I post jobs on HireMe?", a: "Yes. Every plan includes job postings with options for featured and premium placement to maximise visibility among relevant candidates." },
  { q: "Does HireMe provide access to a candidate database?", a: "Yes. Depending on your plan you get access to search verified resumes with advanced filters and AI-powered matching." },
];

function Avatar({ name }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold shrink-0" style={{ background: `linear-gradient(135deg, ${BLUE}, ${RED})` }}>
      {initials}
    </div>
  );
}

export default function RecruiterLanding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [creds, setCreds] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [company, setCompany] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (getRecruiterToken()) {
      recruiterApi.get("/recruiter/me").then((r) => setCompany(r.data)).catch(() => clearRecruiterToken());
    }
  }, []);

  const login = async (e) => {
    e.preventDefault();
    if (!creds.email || !creds.password) { toast({ title: "Enter email and password", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const { data } = await recruiterApi.post("/recruiter/login", { email: creds.email, password: creds.password });
      setRecruiterToken(data.access_token);
      setCompany(data.company);
      toast({ title: `Welcome back, ${data.company.companyName || data.company.name}` });
    } catch (err) {
      const detail = err?.response?.data?.detail;
      toast({ title: typeof detail === "string" ? detail : "Login failed", variant: "destructive" });
    } finally { setLoading(false); }
  };

  const logout = () => { clearRecruiterToken(); setCompany(null); toast({ title: "Logged out" }); };

  const scrollTo = (id) => { setMenuOpen(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  return (
    <div className="min-h-screen bg-white font-body text-[#111]" style={{ fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/recruiter" data-testid="rec-logo" className="flex items-center gap-2">
            <span className="font-head font-extrabold text-2xl" style={{ color: BLUE }}>Hire<span style={{ color: RED }}>Me</span></span>
            <span className="hidden sm:inline text-xs font-semibold text-gray-400 border-l border-gray-200 pl-2">for Recruiters</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
            <button onClick={() => scrollTo("plans")} className="hover:text-[#2c0eee]">Pricing</button>
            <button onClick={() => scrollTo("services")} className="hover:text-[#2c0eee]">Solutions</button>
            <button onClick={() => scrollTo("staffing")} className="hover:text-[#2c0eee]">Staffing</button>
            <button onClick={() => scrollTo("faq")} className="hover:text-[#2c0eee]">FAQ</button>
          </nav>
          <div className="flex items-center gap-3">
            {company ? (
              <button onClick={logout} data-testid="rec-header-logout" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#f61d25]"><LogOut className="h-4 w-4" /> Logout</button>
            ) : (
              <>
                <button onClick={() => scrollTo("login")} className="hidden sm:block text-sm font-semibold text-[#2c0eee] hover:underline">Login</button>
                <Button data-testid="rec-header-signup" onClick={() => navigate("/recruiter/signup")} className="rounded-full text-white font-semibold" style={{ background: `linear-gradient(90deg, ${BLUE}, ${RED})` }}>Sign Up</Button>
              </>
            )}
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 text-sm font-medium text-gray-700">
            <button onClick={() => scrollTo("plans")}>Pricing</button>
            <button onClick={() => scrollTo("services")}>Solutions</button>
            <button onClick={() => scrollTo("staffing")}>Staffing</button>
            <button onClick={() => scrollTo("faq")}>FAQ</button>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(120deg,#0b0b16 0%,#171248 55%,#2c0eee 120%)" }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, #fff 1px, transparent 1px)", backgroundSize: "26px 26px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-white/90 bg-white/10 border border-white/15">
              <Sparkles className="h-3.5 w-3.5" style={{ color: "#f5b301" }} /> India's #1 Job Platform
            </span>
            <h1 className="mt-5 font-head font-extrabold text-white text-4xl sm:text-5xl lg:text-6xl leading-[1.05]">
              Hire Top Talent Faster with a <span style={{ color: "#ff5b61" }}>Smart Recruitment</span> Platform
            </h1>
            <p className="mt-5 text-white/70 text-base sm:text-lg max-w-xl">
              Post jobs, search verified resumes, connect with qualified candidates and streamline your entire hiring process — all from one powerful platform.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button data-testid="rec-hero-postjob" onClick={() => scrollTo("services")} className="rounded-full h-12 px-6 text-white font-semibold" style={{ background: RED }}>Post a Job <ArrowRight className="h-4 w-4 ml-2" /></Button>
              <Button data-testid="rec-hero-search" onClick={() => scrollTo("services")} variant="outline" className="rounded-full h-12 px-6 border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white">Search Resumes</Button>
            </div>
            <div className="mt-9 flex items-center gap-8">
              <div><p className="font-head text-2xl font-bold text-white">50k+</p><p className="text-white/60 text-sm">Recruiters</p></div>
              <div><p className="font-head text-2xl font-bold text-white">98%</p><p className="text-white/60 text-sm">Success Rate</p></div>
              <div><p className="font-head text-2xl font-bold text-white">1M+</p><p className="text-white/60 text-sm">Live Jobs</p></div>
            </div>
          </div>

          {/* Login / logged-in card */}
          <div id="login" className="lg:justify-self-end w-full max-w-md">
            <div className="rounded-3xl bg-white shadow-2xl p-7">
              {company ? (
                <div data-testid="rec-loggedin-card" className="text-center py-4">
                  <div className="mx-auto h-16 w-16 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${BLUE}, ${RED})` }}>
                    <Building2 className="h-8 w-8" />
                  </div>
                  <p className="mt-4 font-head text-xl font-bold">{company.companyName || company.name}</p>
                  <p className="text-sm text-gray-500">{company.email}</p>
                  <span className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold capitalize" style={{ background: "#fff7e6", color: "#b45309" }}>
                    <TrendingUp className="h-3 w-3" /> Account status: {company.status}
                  </span>
                  <p className="text-xs text-gray-400 mt-4">Your recruiter dashboard is being prepared. You'll be notified once your account is approved.</p>
                  <Button data-testid="rec-logout-btn" onClick={logout} variant="outline" className="mt-5 rounded-full w-full">Logout</Button>
                </div>
              ) : (
                <form onSubmit={login} data-testid="rec-login-form">
                  <h3 className="font-head text-xl font-bold">Login / Sign up</h3>
                  <p className="text-sm text-gray-500 mt-1">Access your recruiter account.</p>
                  <label className="block text-sm font-medium text-gray-700 mt-5">Email</label>
                  <Input data-testid="rec-login-email" type="email" value={creds.email} onChange={(e) => setCreds({ ...creds, email: e.target.value })} placeholder="you@company.com" className="mt-1.5 h-11 rounded-xl" />
                  <label className="block text-sm font-medium text-gray-700 mt-4">Password</label>
                  <Input data-testid="rec-login-password" type="password" value={creds.password} onChange={(e) => setCreds({ ...creds, password: e.target.value })} placeholder="••••••••" className="mt-1.5 h-11 rounded-xl" />
                  <div className="flex justify-end mt-2">
                    <button type="button" className="text-xs text-[#2c0eee] hover:underline">Forgot Password?</button>
                  </div>
                  <Button data-testid="rec-login-submit" type="submit" disabled={loading} className="mt-4 w-full h-11 rounded-xl text-white font-semibold" style={{ background: `linear-gradient(90deg, ${BLUE}, ${RED})` }}>
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in…</> : "Login"}
                  </Button>
                  <p className="text-sm text-center text-gray-500 mt-4">
                    New user? <Link to="/recruiter/signup" data-testid="rec-signup-link" className="font-semibold text-[#2c0eee] hover:underline">Sign Up</Link>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="font-head text-3xl sm:text-4xl font-extrabold">Flexible Recruitment Plans for Every Business</h2>
          <p className="mt-3 text-gray-500">Pick a plan that fits your hiring needs. Upgrade or downgrade anytime. All prices exclude GST.</p>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {PLANS.map((p) => (
            <div key={p.name} data-testid={`rec-plan-${p.name.toLowerCase()}`}
              className={`relative rounded-3xl p-7 border transition-all ${p.highlight ? "border-transparent text-white shadow-2xl scale-[1.02]" : "border-gray-100 bg-white shadow-sm hover:shadow-md"}`}
              style={p.highlight ? { background: "linear-gradient(150deg,#171248,#2c0eee)" } : {}}>
              {p.offer && <span className="absolute top-5 right-5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: RED }}>{p.offer}</span>}
              <p className={`text-sm font-semibold ${p.highlight ? "text-white/70" : "text-gray-400"}`}>{p.tag}</p>
              <h3 className="font-head text-2xl font-bold mt-1">{p.name} Plan</h3>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-head text-4xl font-extrabold">{p.price}</span>
                {p.strike && <span className={`line-through text-sm ${p.highlight ? "text-white/50" : "text-gray-400"}`}>{p.strike}</span>}
              </div>
              <p className={`text-sm ${p.highlight ? "text-white/60" : "text-gray-400"}`}>per {p.period} + GST</p>
              <Button data-testid={`rec-plan-cta-${p.name.toLowerCase()}`} onClick={() => navigate("/recruiter/signup")} className={`mt-5 w-full rounded-full font-semibold ${p.highlight ? "bg-white text-[#2c0eee] hover:bg-white/90" : "text-white"}`} style={p.highlight ? {} : { background: `linear-gradient(90deg, ${BLUE}, ${RED})` }}>Get Started</Button>
              <ul className="mt-6 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <CheckCircle2 className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${p.highlight ? "text-[#f5b301]" : "text-[#16a34a]"}`} />
                    <span className={p.highlight ? "text-white/85" : "text-gray-600"}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="bg-[#f6f7fb] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-head text-3xl sm:text-4xl font-extrabold">Complete Recruitment Solutions</h2>
            <p className="mt-3 text-gray-500">Search resumes, post jobs, connect with qualified candidates and simplify your hiring process.</p>
          </div>
          <div className="mt-12 space-y-10">
            {SERVICES.map((s, i) => (
              <div key={s.title} className={`grid lg:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3] bg-white">
                  <img src={s.img} alt={s.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-[#2c0eee] bg-[#2c0eee]/10">
                    <s.Icon className="h-3.5 w-3.5" /> {s.tag}
                  </span>
                  <h3 className="mt-4 font-head text-2xl font-bold">{s.title}</h3>
                  <p className="mt-3 text-gray-500">{s.desc}</p>
                  <ul className="mt-5 grid sm:grid-cols-2 gap-3">
                    {s.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2 text-sm text-gray-700"><CheckCircle2 className="h-4 w-4 text-[#16a34a] shrink-0" /> {pt}</li>
                    ))}
                  </ul>
                  <Button onClick={() => navigate("/recruiter/signup")} className="mt-6 rounded-full text-white font-semibold" style={{ background: `linear-gradient(90deg, ${BLUE}, ${RED})` }}>{s.cta} <ArrowRight className="h-4 w-4 ml-2" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Staffing */}
      <section id="staffing" className="relative py-16 lg:py-20 text-white overflow-hidden" style={{ background: "linear-gradient(120deg,#0b0b16,#211a5e)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Premium Staffing Solutions</span>
            <h2 className="mt-3 font-head text-3xl sm:text-4xl font-extrabold">Third-Party Payroll & Contract Staffing</h2>
            <p className="mt-4 text-white/70">Hire qualified professionals while we manage payroll, HR and statutory compliance end-to-end.</p>
            <div className="mt-7 flex gap-8">
              <div><p className="font-head text-3xl font-bold">10K+</p><p className="text-white/60 text-sm">Professionals</p></div>
              <div><p className="font-head text-3xl font-bold">500+</p><p className="text-white/60 text-sm">Companies</p></div>
              <div><p className="font-head text-3xl font-bold">98%</p><p className="text-white/60 text-sm">Satisfaction</p></div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button className="rounded-full text-white font-semibold" style={{ background: RED }}>Know More</Button>
              <Button variant="outline" className="rounded-full border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white">Talk to Sales</Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {STAFFING.map((s) => (
              <div key={s.title} className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur">
                <ShieldCheck className="h-6 w-6" style={{ color: "#f5b301" }} />
                <p className="mt-3 font-semibold">{s.title}</p>
                <p className="text-sm text-white/60 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request demo */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-3xl p-8 lg:p-12 text-center" style={{ background: "linear-gradient(120deg,#f6f7fb,#eef0ff)" }}>
          <h2 className="font-head text-3xl font-extrabold">Connect with Our Recruitment Experts</h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">Get expert advice on job postings, resume database access and customized hiring solutions to recruit top talent faster.</p>
          <Button onClick={() => navigate("/recruiter/signup")} className="mt-6 rounded-full h-12 px-7 text-white font-semibold" style={{ background: `linear-gradient(90deg, ${BLUE}, ${RED})` }}>Request a Demo <ArrowRight className="h-4 w-4 ml-2" /></Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#f6f7fb] py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#2c0eee]"><Users className="h-4 w-4" /> Trusted by 50K+ Recruiters</span>
            <h2 className="mt-2 font-head text-3xl sm:text-4xl font-extrabold">What Our Clients Say</h2>
            <p className="mt-3 text-gray-500">Real stories from recruiters who found their perfect match.</p>
          </div>
          <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
                <div className="flex gap-0.5 mb-3">{[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-[#f5b301] text-[#f5b301]" />)}</div>
                <p className="text-sm text-gray-600 leading-relaxed">"{t.text}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar name={t.name} />
                  <div><p className="font-semibold text-sm">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-20">
        <div className="text-center">
          <h2 className="font-head text-3xl sm:text-4xl font-extrabold">Frequently Asked Questions</h2>
          <p className="mt-3 text-gray-500">Everything you need to know about our platform and billing.</p>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`} data-testid={`rec-faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-gray-500">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="bg-[#0b0b16] text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <span className="font-head font-extrabold text-2xl text-white">Hire<span style={{ color: RED }}>Me</span></span>
            <p className="mt-3 text-sm text-gray-500 max-w-xs">India's smart recruitment platform. Post jobs, search resumes and hire the best talent faster.</p>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">For Recruiters</p>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => scrollTo("services")} className="hover:text-white">Post a Job</button></li>
              <li><button onClick={() => scrollTo("services")} className="hover:text-white">Search Resumes</button></li>
              <li><button onClick={() => scrollTo("plans")} className="hover:text-white">Pricing</button></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Company</p>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => scrollTo("staffing")} className="hover:text-white">Staffing</button></li>
              <li><button onClick={() => scrollTo("faq")} className="hover:text-white">FAQ</button></li>
              <li><a href="#" className="hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white mb-3">Get Started</p>
            <Button onClick={() => navigate("/recruiter/signup")} className="rounded-full text-white font-semibold w-full" style={{ background: `linear-gradient(90deg, ${BLUE}, ${RED})` }}>Create Account</Button>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-gray-500">© {new Date().getFullYear()} HireMe Jobs. All rights reserved.</div>
      </footer>
    </div>
  );
}
