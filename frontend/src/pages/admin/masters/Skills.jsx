import React from "react";
import { Sparkles } from "lucide-react";
import MasterPage from "../MasterPage";

export default function Skills() {
  return (
    <MasterPage
      title="Skills"
      subtitle="Manage skills used across job listings"
      Icon={Sparkles}
      apiBase="/skills"
      itemLabel="Skill"
    />
  );
}
