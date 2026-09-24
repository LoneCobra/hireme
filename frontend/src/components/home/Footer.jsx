import React from "react";
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Phone, Mail } from "lucide-react";
import Logo from "../Logo";
import { footerColumns } from "../../mock/mock";

const socials = [Facebook, Twitter, Linkedin, Instagram, Youtube];

export default function Footer() {
  return (
    <footer className="bg-[#0c0c2b] text-gray-300">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Link columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8">
          {Object.entries(footerColumns).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-white mb-4 text-[15px]">{title}</h4>
              <ul className="space-y-3">
                {links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-[14px] text-gray-400 hover:text-white transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="my-10 h-px bg-white/10" />

        {/* Stay connected / support / app */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h4 className="font-semibold text-white mb-4">Stay Connected</h4>
            <div className="flex items-center gap-3">
              {socials.map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-full bg-white/10 hover:bg-[#2c0eee] flex items-center justify-center transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">24/7 Support</h4>
            <div className="space-y-3 text-[14px] text-gray-400">
              <div className="flex items-start gap-3">
                <Phone className="h-4 w-4 mt-0.5 text-gray-400" />
                <div>
                  <p>Toll No: +91 22 1111 0000</p>
                  <p>Toll Free No: 1234-567-8900</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" /> info@hiremejobs.in
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 max-w-sm">
              <p className="font-semibold text-white mb-3">Download the App</p>
              <div className="flex items-center gap-4">
                <div className="space-y-2 flex-1">
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-black text-white text-sm font-medium">Google Play</button>
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-black text-white text-sm font-medium">App Store</button>
                </div>
                <div className="text-center">
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=90x90&color=f61d25&data=https://hiremejobs.in" alt="Scan app" className="h-[70px] w-[70px] rounded" />
                  <p className="text-[10px] tracking-wide text-gray-400 mt-1">SCAN APP</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="my-8 h-px bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo light className="scale-90" />
            <a href="#" className="text-[13px] text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-[13px] text-gray-400 hover:text-white">Help</a>
            <a href="#" className="text-[13px] text-gray-400 hover:text-white">Complaints</a>
          </div>
          <p className="text-[13px] text-gray-500">© 2026 hiremejobs | All rights Reserved</p>
        </div>
      </div>
    </footer>
  );
}
