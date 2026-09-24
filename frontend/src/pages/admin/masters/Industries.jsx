import React from "react";
import { Factory } from "lucide-react";
import MasterPage from "../MasterPage";

export default function Industries() {
  return (
    <MasterPage
      title="Industries"
      subtitle="Manage industries used for jobs and companies"
      Icon={Factory}
      apiBase="/industries"
      itemLabel="Industry"
    />
  );
}
