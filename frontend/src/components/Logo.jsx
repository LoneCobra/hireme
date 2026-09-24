import React from "react";

// HIREME logo: HIRE in dark/white, ME in brand red
export default function Logo({ light = false, className = "" }) {
  return (
    <div className={`flex flex-col leading-none select-none ${className}`}>
      <span className="font-head font-extrabold tracking-tight text-2xl">
        <span className={light ? "text-white" : "text-[#111]"}>HIRE</span>
        <span className="text-[#f61d25]">ME</span>
      </span>
      <span className={`text-[8px] tracking-[0.25em] font-semibold mt-0.5 ${light ? "text-white/60" : "text-gray-400"}`}>
        GET HIRED | HIRE FASTER
      </span>
    </div>
  );
}
