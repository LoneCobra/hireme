import React, { useState } from "react";
import {
  Search, MapPin, Briefcase, ChevronRight, TrendingUp, Code2,
  MonitorSmartphone, Landmark, BrainCircuit, CircuitBoard, ArrowRight, CheckCircle2,
} from "lucide-react";
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import {
  popularCities, featuredCompanies, popularCategories, experienceOptions,
  skillsByIndustry, trendingJobs,
} from "../mock/mock";

const iconMap = { Code2, MonitorSmartphone, Landmark, TrendingUp, BrainCircuit, CircuitBoard };

function SectionHead({ title, subtitle }) {
  return (
    <div className="text-center max-w-2xl mx-auto mb-10">
      <h2 className="font-head text-3xl md:text-4xl font-bold text-[#111]">{title}</h2>
      <p className="mt-3 text-gray-500">{subtitle}</p>
    </div>
  );
}

export default function Home() {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [activeIndustry, setActiveIndustry] = useState("Software");

  const handleSearch = () => {
    toast({
      title: "Searching jobs…",
      description: `Keyword: "${keyword || "Any"}" • Location: "${location || "Any"}" • Exp: "${experience || "Any"}"`,
    });
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#f3f1ff] to-[#f6f7fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-medium text-[#2c0eee] bg-[#2c0eee]/10 px-3 py-1.5 rounded-full">
              <TrendingUp className="h-4 w-4" /> 425 jobs match your profile
            </span>
            <h1 className="mt-5 font-head text-4xl md:text-6xl font-extrabold leading-tight text-[#111]">
              Find your <span className="text-[#2c0eee]">Dream</span> <span className="text-[#f61d25]">Job</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-md">
              Search thousands of jobs from top companies across India and apply in one click.
            </p>

            {/* Search bar */}
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-3 flex flex-col md:flex-row gap-3 border border-gray-100">
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <Input value={keyword} onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Job title or keyword"
                  className="border-0 shadow-none focus-visible:ring-0 px-0" />
              </div>
              <div className="hidden md:block w-px bg-gray-200" />
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                <Input value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="border-0 shadow-none focus-visible:ring-0 px-0" />
              </div>
              <div className="hidden md:block w-px bg-gray-200" />
              <div className="flex items-center gap-2 px-3 md:w-44">
                <Briefcase className="h-5 w-5 text-gray-400 shrink-0" />
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 px-0">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSearch} className="bg-[#f61d25] hover:bg-[#d5171e] text-white font-semibold px-8 h-12 rounded-xl">
                Search
              </Button>
            </div>

            {/* Trending */}
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">Trending:</span>
              {trendingJobs.map((t) => (
                <button key={t} onClick={() => setKeyword(t)}
                  className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-[#2c0eee] hover:text-[#2c0eee] transition-colors">
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:block relative">
            <div className="absolute -top-6 -left-6 h-40 w-40 bg-[#2c0eee]/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-8 -right-4 h-48 w-48 bg-[#f61d25]/10 rounded-full blur-2xl" />
            <img
              src="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?crop=entropy&cs=srgb&fm=jpg&w=1000&q=80"
              alt="Job search"
              className="relative rounded-3xl shadow-2xl w-full object-cover h-[420px]"
            />
          </div>
        </div>
      </section>

      {/* POPULAR CITIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHead title="Popular Cities" subtitle="Discover job opportunities in India's top metropolitan cities" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {popularCities.map((c) => (
            <button key={c.name} className="group relative rounded-2xl overflow-hidden h-40 shadow-sm hover:shadow-xl transition-all">
              <img src={c.image} alt={c.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <p className="text-white font-head font-semibold text-lg leading-tight">{c.name}</p>
                <p className="text-white/80 text-xs flex items-center gap-1 mt-1">
                  Explore jobs <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED COMPANIES (marquee) */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHead title="Featured Companies" subtitle="Top employers actively hiring on HireMe" />
        </div>
        <div className="marquee-pause overflow-hidden">
          <div className="flex gap-6 w-max animate-marquee">
            {[...featuredCompanies, ...featuredCompanies].map((co, i) => (
              <div key={i} className="flex items-center gap-3 bg-[#f6f7fb] border border-gray-100 rounded-2xl px-6 py-4 min-w-[220px]">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-head font-bold text-lg shrink-0" style={{ background: co.color }}>
                  {co.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{co.name}</p>
                  <p className="text-xs text-gray-500">Actively hiring</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHead title="Popular Categories" subtitle="Explore thousands of jobs across top industries" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {popularCategories.map((cat) => {
            const Icon = iconMap[cat.icon] || Code2;
            return (
              <button key={cat.name} className="group flex items-center gap-4 bg-white border border-gray-100 rounded-2xl p-5 text-left hover:border-[#2c0eee] hover:shadow-lg transition-all">
                <div className="h-14 w-14 rounded-xl bg-[#2c0eee]/10 flex items-center justify-center group-hover:bg-[#2c0eee] transition-colors">
                  <Icon className="h-7 w-7 text-[#2c0eee] group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-head font-semibold text-gray-800">{cat.name}</p>
                  <p className="text-sm text-gray-500">{cat.jobs} open jobs</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-300 ml-auto group-hover:text-[#2c0eee] group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-3xl bg-[#2c0eee] overflow-hidden relative">
          <div className="absolute -top-16 -right-10 h-64 w-64 bg-white/10 rounded-full blur-3xl" />
          <div className="grid md:grid-cols-2 gap-8 items-center p-10 md:p-14 relative">
            <div>
              <h3 className="font-head text-3xl md:text-4xl font-bold text-white leading-tight">
                Create Your Job Profile and Connect with Top Employers
              </h3>
              <p className="mt-4 text-white/80 max-w-lg">
                Complete your job profile, upload your resume, and get discovered by recruiters hiring for the latest jobs.
              </p>
              <ul className="mt-5 space-y-2">
                {["Get discovered by recruiters", "Apply in one click", "Personalised job alerts"].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-white/90 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-[#f61d25] bg-white rounded-full" /> {f}
                  </li>
                ))}
              </ul>
              <Button className="mt-7 bg-[#f61d25] hover:bg-[#d5171e] text-white font-semibold h-12 px-8 rounded-xl">
                Create Profile <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="hidden md:flex justify-center">
              <div className="bg-white/10 backdrop-blur rounded-3xl p-8 text-center border border-white/20">
                <p className="font-head text-6xl font-extrabold text-white">425</p>
                <p className="text-white/80 mt-2">jobs match your profile</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SKILLS BY INDUSTRY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SectionHead title="Popular Skills By Industry" subtitle="Explore in-demand skills and popular roles matching your experience" />
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {Object.keys(skillsByIndustry).map((ind) => (
            <button key={ind} onClick={() => setActiveIndustry(ind)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeIndustry === ind ? "bg-[#2c0eee] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#2c0eee]"
              }`}>
              {ind}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {skillsByIndustry[activeIndustry].map((s) => (
            <button key={s.name} className="group bg-white border border-gray-100 rounded-2xl p-5 text-center hover:border-[#f61d25] hover:shadow-lg transition-all">
              <div className="mx-auto h-12 w-12 rounded-full bg-[#f61d25]/10 flex items-center justify-center font-head font-bold text-[#f61d25] text-lg group-hover:bg-[#f61d25] group-hover:text-white transition-colors">
                {s.name.charAt(0)}
              </div>
              <p className="mt-3 font-semibold text-gray-800 text-sm leading-tight">{s.name}</p>
              <p className="text-xs text-gray-500 mt-1">{s.jobs} Jobs</p>
            </button>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
