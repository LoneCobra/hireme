import React from "react";

// HIREME logo: HIRE in blue, ME in red (italic bold). On dark bg, HIRE turns white.
export default function Logo({ light = false, className = "" }) {
  return (
    <div className={`flex flex-col leading-none select-none ${className}`}>
      <span className="font-head font-extrabold italic tracking-tight text-[26px]">
        <span className={light ? "text-white" : "text-[#2c0eee]"}>HIRE</span>
        <span className="text-[#f61d25]">ME</span>
      </span>
      <span className={`text-[8px] tracking-[0.22em] font-semibold mt-0.5 ${light ? "text-white/50" : "text-gray-400"}`}>
        GET HIRED | HIRE FASTER
      </span>
    </div>
  );
}
