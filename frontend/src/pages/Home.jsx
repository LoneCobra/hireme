import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, MapPin, Briefcase, ChevronDown, ArrowRight } from "lucide-react";
import Header from "../components/home/Header";
import Footer from "../components/home/Footer";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../components/ui/select";
import { useToast } from "../hooks/use-toast";
import {
  popularCities, featuredCompanies, popularCategories, experienceOptions,
  skillIndustries, skillsByIndustry, vacancyTabs, vacancyChips, heroImage, ctaImage,
} from "../mock/mock";

function Heading({ black, grad, gradFirst = false }) {
  return (
    <h2 className="font-head text-3xl md:text-[40px] font-bold text-[#10112b] text-center leading-tight">
      {gradFirst ? <><span className="grad-text">{grad}</span> {black}</> : <>{black} <span className="grad-text">{grad}</span></>}
    </h2>
  );
}

export default function Home() {
  const { toast } = useToast();
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("");
  const [activeIndustry, setActiveIndustry] = useState("Software");
  const [activeVacancy, setActiveVacancy] = useState("Skills");
  const [cities, setCities] = useState(popularCities);

  useEffect(() => {
    const url = `${process.env.REACT_APP_BACKEND_URL}/api/public/trending-cities`;
    axios.get(url).then((res) => {
      if (Array.isArray(res.data) && res.data.length > 0) setCities(res.data);
    }).catch(() => {});
  }, []);

  const handleSearch = () =>
    toast({ title: "Searching jobs…", description: `Skills: "${keyword || "Any"}" • Location: "${location || "Any"}" • Exp: "${experience || "Any"}"` });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* HERO */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center pt-10 lg:pt-16 pb-8">
          <div className="order-2 lg:order-1">
            <h1 className="font-head text-4xl md:text-[52px] font-bold leading-[1.1] text-[#10112b]">
              Find your <span className="grad-text">Career Opportunity</span>
              <span className="caret inline-block w-[3px] h-9 md:h-11 bg-[#2c0eee] align-middle ml-1" />
            </h1>

            {/* Search bar */}
            <div className="mt-8 bg-white rounded-full shadow-[0_10px_40px_rgba(44,14,238,0.10)] border border-gray-100 p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <div className="flex items-center gap-2 flex-1 px-4 min-w-[150px]">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
                  placeholder="Search by Skills, Company or…"
                  className="w-full py-2 text-[15px] outline-none placeholder:text-gray-400" />
              </div>
              <div className="hidden md:block h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2 px-4 md:w-36">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                <input value={location} onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                  className="w-full py-2 text-[15px] outline-none placeholder:text-gray-400" />
              </div>
              <div className="hidden md:block h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-2 px-4 md:w-44">
                <Briefcase className="h-5 w-5 text-gray-400 shrink-0" />
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="border-0 shadow-none focus:ring-0 px-0 h-auto text-[15px] text-gray-500 [&>svg]:hidden">
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceOptions.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
                <ChevronDown className="h-4 w-4 text-gray-400 ml-auto shrink-0" />
              </div>
              <button onClick={handleSearch}
                className="flex items-center justify-center gap-2 rounded-full text-white font-semibold px-7 py-3 text-[15px] shrink-0"
                style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
                <Search className="h-4 w-4" /> Search
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <span className="text-[#f61d25] font-semibold">Trending Jobs</span>
              <span className="text-gray-400 text-[15px]">No trending jobs right now</span>
            </div>
          </div>

          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <img src={heroImage} alt="Find your career opportunity" className="w-full max-w-[460px] object-contain" />
          </div>
        </div>
      </section>

      {/* POPULAR CITIES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Heading black="Popular" grad="Cities" />
        <p className="text-center text-gray-500 mt-3 mb-12">Discover job opportunities in India's top metropolitan cities</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-6">
          {cities.map((c) => (
            <button key={c.name} className="group flex flex-col items-center text-center">
              <div className="h-[92px] w-[92px] rounded-full flex items-center justify-center overflow-hidden group-hover:-translate-y-1 transition-transform"
                style={{ background: "radial-gradient(circle at 50% 30%, #23237a, #0c0c2b)" }}>
                <img src={c.image} alt={c.name} className="h-[70px] w-[70px] object-contain" />
              </div>
              <p className="mt-3 font-semibold text-[#10112b] text-[15px] leading-tight">{c.name}</p>
              <p className="text-gray-400 text-[13px] group-hover:text-[#2c0eee] transition-colors">Explore jobs</p>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED COMPANIES */}
      <section className="py-14">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <Heading black="Featured" grad="Companies" />
          <p className="text-center text-gray-500 mt-3 mb-12">Discover job opportunities in India's top metropolitan cities</p>
        </div>
        <div className="marquee-pause overflow-hidden relative"
          style={{ maskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)" }}>
          <div className="flex gap-6 w-max animate-marquee px-6">
            {[...featuredCompanies, ...featuredCompanies].map((co, i) => (
              <div key={i} className="h-[100px] w-[220px] bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-6 shrink-0">
                <img src={co.logo} alt={co.name} className="max-h-[56px] max-w-[150px] object-contain" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Heading black="Popular" grad="Categories" />
        <p className="text-center text-gray-500 mt-3 mb-12">Explore thousands of jobs across top industries</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {popularCategories.map((cat) => (
            <button key={cat.name} className="flex items-center gap-3 bg-white border border-gray-100 rounded-xl px-4 py-3 text-left shadow-sm hover:shadow-md hover:border-[#2c0eee]/30 transition-all">
              <div className="h-10 w-10 rounded-lg bg-[#f4f5ff] flex items-center justify-center shrink-0 overflow-hidden">
                <img src={cat.icon} alt={cat.name} className="h-7 w-7 object-contain" />
              </div>
              <span className="font-semibold text-[#10112b] text-[13px] leading-tight">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="my-8" style={{ background: "linear-gradient(120deg,#eef0ff 0%,#f3eefb 45%,#fdeff0 100%)" }}>
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-8 items-center py-10">
          <div>
            <h3 className="font-head text-3xl md:text-[44px] font-bold leading-[1.15]">
              <span className="text-[#10112b]">Create Your Job Profile and </span>
              <span className="text-[#2c0eee]">Connect with Top </span>
              <span className="text-[#f61d25]">Employers</span>
            </h3>
            <p className="mt-5 text-gray-600 max-w-xl">
              Complete you job profile, upload your resume, and get discovered by recruiters hiring for the latest jobs. Apply online and advance your career with opportunities that match your skills and experience.
            </p>
            <button onClick={() => toast({ title: "Create your profile", description: "Sign up to get discovered by recruiters." })}
              className="mt-7 inline-flex items-center gap-2 rounded-full text-white font-semibold px-8 py-3"
              style={{ background: "linear-gradient(90deg,#2c0eee,#f61d25)" }}>
              Create Profile
            </button>
          </div>
          <div className="relative flex justify-center md:justify-end">
            <img src={ctaImage} alt="Create profile" className="w-full max-w-[460px] object-contain" />
            <div className="absolute top-4 right-2 md:right-6 bg-white rounded-2xl shadow-lg px-4 py-2 text-center">
              <p className="font-bold text-[#10112b] leading-tight">425 jobs match</p>
              <p className="text-gray-500 text-sm leading-tight">your profile</p>
            </div>
          </div>
        </div>
      </section>

      {/* POPULAR SKILLS BY INDUSTRY */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <Heading black="By Industry" grad="Popular Skills" gradFirst />
        <p className="text-center text-gray-500 mt-3 mb-10">Explore in-demand skills and popular roles matching your experience</p>

        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap gap-1 bg-[#f4f5f9] rounded-full p-1.5">
            {skillIndustries.map((ind) => (
              <button key={ind} onClick={() => setActiveIndustry(ind)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeIndustry === ind ? "bg-white text-[#2c0eee] shadow-sm" : "text-gray-500 hover:text-[#10112b]"
                }`}>
                {ind}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-1">
          {skillsByIndustry[activeIndustry].map((s) => (
            <button key={s.name} className="group flex items-center gap-4 py-5 border-b border-gray-100 text-left">
              <div className="h-11 w-11 rounded-xl bg-[#f4f5ff] flex items-center justify-center font-bold text-[#2c0eee] text-lg shrink-0 group-hover:bg-[#2c0eee] group-hover:text-white transition-colors">
                {s.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#10112b] leading-tight">{s.name}</p>
                <p className="text-sm"><span className="text-[#f61d25] font-medium">{s.jobs}</span> <span className="text-gray-400">Jobs</span></p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-[#2c0eee] group-hover:translate-x-1 transition-all" />
            </button>
          ))}
        </div>
      </section>

      {/* FIND JOB VACANCIES BY SKILLS */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-head text-3xl md:text-[40px] font-bold text-center leading-tight">
          <span className="text-[#10112b]">Find Job </span><span className="grad-text">Vacancies</span><span className="text-[#10112b]"> by Skills</span>
        </h2>
        <p className="text-center text-gray-500 mt-3 mb-10">Exploring thousands of opportunities across top categories</p>

        <div className="border-b border-gray-100 flex items-center gap-8 justify-center">
          {vacancyTabs.map((t) => (
            <button key={t} onClick={() => setActiveVacancy(t)}
              className={`pb-3 text-[15px] font-medium border-b-2 -mb-px transition-colors ${
                activeVacancy === t ? "text-[#2c0eee] border-[#2c0eee]" : "text-gray-500 border-transparent hover:text-[#10112b]"
              }`}>
              {t}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 justify-center min-h-[80px]">
          {vacancyChips[activeVacancy].map((chip) => (
            <button key={chip} className="px-4 py-2 rounded-full bg-[#f4f5f9] text-[#10112b] text-sm font-medium hover:bg-[#eef0ff] hover:text-[#2c0eee] transition-colors">
              {chip}
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a href="#" className="inline-flex items-center gap-1 text-[#2c0eee] font-semibold hover:gap-2 transition-all">
            View all jobs by {activeVacancy} <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
