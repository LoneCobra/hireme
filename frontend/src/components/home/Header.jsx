import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, UserRound, PenLine } from "lucide-react";
import Logo from "../Logo";
import { navItems } from "../../mock/mock";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          <div className="flex items-center gap-10">
            <Link to="/"><Logo /></Link>
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map((n) => (
                <a key={n} href="#" className="text-[15px] font-medium text-[#1a1a2e] hover:text-[#2c0eee] transition-colors">
                  {n}
                </a>
              ))}
            </nav>
          </div>

          <div className="hidden lg:flex items-center gap-4">
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#eef0ff] text-[#2c0eee] text-[14px] font-semibold hover:bg-[#e2e5ff] transition-colors">
              <UserRound className="h-4 w-4" /> Login
            </button>
            <button className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#f61d25] text-white text-[14px] font-semibold hover:bg-[#d5171e] transition-colors">
              <PenLine className="h-4 w-4" /> Register
            </button>
            <span className="h-6 w-px bg-gray-200" />
            <a href="#" className="text-[15px] font-medium text-[#1a1a2e] hover:text-[#2c0eee] transition-colors">Employers Login</a>
          </div>

          <button className="lg:hidden p-2" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {navItems.map((n) => (
            <a key={n} href="#" className="block text-[15px] font-medium text-[#1a1a2e]">{n}</a>
          ))}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#eef0ff] text-[#2c0eee] font-semibold"><UserRound className="h-4 w-4" /> Login</button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#f61d25] text-white font-semibold"><PenLine className="h-4 w-4" /> Register</button>
          </div>
          <a href="#" className="block text-[15px] font-medium text-[#1a1a2e]">Employers Login</a>
        </div>
      )}
    </header>
  );
}
