import React from "react";
import { Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin } from "lucide-react";
import Logo from "../Logo";
import { footerLinks } from "../../mock/mock";

export default function Footer() {
  return (
    <footer className="bg-[#0b0b16] text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="md:col-span-2">
            <Logo light />
            <p className="mt-5 text-sm text-gray-400 max-w-xs leading-relaxed">
              India's fastest growing job portal. Connecting talented professionals with top employers across the country.
            </p>
            <div className="mt-5 space-y-2 text-sm text-gray-400">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-[#f61d25]" /> support@hireme.in</p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-[#f61d25]" /> +91 98765 43210</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[#f61d25]" /> Jaipur, Rajasthan, India</p>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-head font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-gray-400 hover:text-[#f61d25] transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 HireMe Jobs. All rights reserved.</p>
          <div className="flex items-center gap-3">
            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
              <a key={i} href="#" className="h-9 w-9 rounded-full bg-white/5 hover:bg-[#2c0eee] flex items-center justify-center transition-colors">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
