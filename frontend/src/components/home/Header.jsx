import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Briefcase } from "lucide-react";
import Logo from "../Logo";
import { Button } from "../ui/button";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/" },
  { label: "Companies", href: "/" },
  { label: "Jobs by Skills", href: "/" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          <Link to="/"><Logo /></Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((n) => (
              <a key={n.label} href={n.href} className="text-[15px] font-medium text-gray-700 hover:text-[#2c0eee] transition-colors">
                {n.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <a href="#" className="flex items-center gap-1.5 text-[14px] font-medium text-[#f61d25] hover:opacity-80">
              <Briefcase className="h-4 w-4" /> For Employers
            </a>
            <Button variant="outline" className="border-[#2c0eee] text-[#2c0eee] hover:bg-[#2c0eee] hover:text-white font-semibold">
              Login
            </Button>
            <Button className="bg-[#2c0eee] hover:bg-[#2408c9] text-white font-semibold">
              Register
            </Button>
          </div>

          <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {navItems.map((n) => (
            <a key={n.label} href={n.href} className="block text-[15px] font-medium text-gray-700">{n.label}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1 border-[#2c0eee] text-[#2c0eee] font-semibold">Login</Button>
            <Button className="flex-1 bg-[#2c0eee] text-white font-semibold">Register</Button>
          </div>
        </div>
      )}
    </header>
  );
}
