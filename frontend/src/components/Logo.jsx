import React from "react";

const LOGO_COLOR = "https://customer-assets-gfyr7b9c.emergentagent.net/job_hire-admin/artifacts/2rtydx2s_HireMe.png";
const LOGO_WHITE = "https://customer-assets-gfyr7b9c.emergentagent.net/job_hire-admin/artifacts/j8hpou14_Hireme_white.png";

// HIREME brand logo. `light` uses the white variant for dark backgrounds.
export default function Logo({ light = false, className = "" }) {
  return (
    <img
      src={light ? LOGO_WHITE : LOGO_COLOR}
      alt="HireMe - Get Hired | Hire Faster"
      className={`h-10 w-auto object-contain select-none ${className}`}
      draggable={false}
    />
  );
}
