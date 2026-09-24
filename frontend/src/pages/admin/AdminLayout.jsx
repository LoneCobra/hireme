import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Building2, MessageSquare, Briefcase, Users, Package,
  CreditCard, UserCog, Database, Settings, ChevronDown, GraduationCap,
  BookCopy, Gift, Tag, MapPin, Building, Menu, Search, Bell, LogOut,
  Factory, Layers, Sparkles,
} from "lucide-react";
import Logo from "../../components/Logo";

const masterItems = [
  { label: "Education Categories", to: "/admin/masters/education-categories", icon: GraduationCap },
  { label: "Education Sub Categories", to: "/admin/masters/education-sub-categories", icon: BookCopy },
  { label: "Industries", to: "/admin/masters/industries", icon: Factory },
  { label: "Sub Industries", to: "/admin/masters/sub-industries", icon: Layers },
  { label: "Skills", to: "/admin/masters/skills", icon: Sparkles },
  { label: "Perk & Benefit Categories", to: "#", icon: Gift },
  { label: "Perk & Benefits", to: "#", icon: Tag },
  { label: "States", to: "/admin/masters/states", icon: MapPin },
  { label: "Cities", to: "/admin/masters/cities", icon: Building },
];

const navItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Company", to: "#", icon: Building2 },
  { label: "Inquiry", to: "#", icon: MessageSquare },
  { label: "Jobs", to: "#", icon: Briefcase },
  { label: "Candidates", to: "#", icon: Users },
  { label: "Packages", to: "#", icon: Package },
  { label: "Payments", to: "#", icon: CreditCard },
  { label: "Admin User", to: "#", icon: UserCog },
];

export default function AdminLayout({ title, children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const admin = JSON.parse(localStorage.getItem("hireme_admin") || "{}");
  const mastersActive = location.pathname.includes("/admin/masters");
  const [mastersOpen, setMastersOpen] = useState(mastersActive || true);

  const logout = () => {
    localStorage.removeItem("hireme_admin");
    localStorage.removeItem("hireme_token");
    navigate("/admin/login");
  };

  const linkBase = "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors";

  return (
    <div className="min-h-screen flex bg-[#f6f7fb]">
      {/* Sidebar */}
      <aside className={`${collapsed ? "w-0 -translate-x-full" : "w-[260px]"} lg:translate-x-0 fixed lg:static z-40 h-screen bg-[#0b0b16] text-gray-300 flex flex-col transition-all duration-300 shrink-0`}>
        <div className="h-[72px] flex items-center px-6 border-b border-white/10">
          <Logo light />
        </div>
        <nav className="flex-1 overflow-y-auto thin-scroll px-3 py-4 space-y-1">
          {navItems.map((n) => (
            <NavLink key={n.label} to={n.to}
              className={({ isActive }) => `${linkBase} ${isActive && n.to !== "#" ? "bg-[#f61d25] text-white shadow-lg shadow-[#f61d25]/30" : "hover:bg-white/5 hover:text-white"}`}>
              <n.icon className="h-[18px] w-[18px]" /> {n.label}
            </NavLink>
          ))}

          {/* Masters group */}
          <button onClick={() => setMastersOpen(!mastersOpen)}
            className={`${linkBase} w-full justify-between ${mastersActive ? "text-white" : "hover:bg-white/5 hover:text-white"}`}>
            <span className="flex items-center gap-3"><Database className="h-[18px] w-[18px]" /> Masters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${mastersOpen ? "rotate-180" : ""}`} />
          </button>
          {mastersOpen && (
            <div className="pl-3 space-y-1">
              {masterItems.map((m) => (
                <NavLink key={m.label} to={m.to}
                  className={({ isActive }) => `${linkBase} ${isActive && m.to !== "#" ? "bg-[#f61d25] text-white shadow-lg shadow-[#f61d25]/30" : "hover:bg-white/5 hover:text-white text-gray-400"}`}>
                  <m.icon className="h-[18px] w-[18px]" /> <span className="truncate">{m.label}</span>
                </NavLink>
              ))}
            </div>
          )}

          <div className={`${linkBase} hover:bg-white/5 hover:text-white cursor-pointer`}>
            <Settings className="h-[18px] w-[18px]" /> Settings
          </div>
        </nav>

        <div className="border-t border-white/10 p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-[#2c0eee] flex items-center justify-center text-white font-semibold">
            {(admin.name || "A").charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{admin.name || "Admin"}</p>
            <p className="text-xs text-gray-400 truncate">{admin.email || ""}</p>
          </div>
          <button onClick={logout} className="text-gray-400 hover:text-[#f61d25]" title="Logout">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-[72px] bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <h1 className="font-head text-xl font-semibold text-[#111]">{title}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-gray-100"><Search className="h-5 w-5 text-gray-600" /></button>
            <button className="p-2 rounded-lg hover:bg-gray-100 relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-[#f61d25] rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2">
              <div className="h-9 w-9 rounded-full bg-[#2c0eee] flex items-center justify-center text-white text-sm font-semibold">UU</div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Admin</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
