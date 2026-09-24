import React from "react";
import { Layers } from "lucide-react";
import MasterPage from "../MasterPage";

export default function SubIndustries() {
  return (
    <MasterPage
      title="Sub Industries"
      subtitle="Manage sub industries linked to industries"
      Icon={Layers}
      apiBase="/sub-industries"
      itemLabel="Sub Industry"
      parent={{ key: "industry", label: "Industry", optionsApi: "/industries" }}
    />
  );
}
