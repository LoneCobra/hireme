import React from "react";
import { MapPin } from "lucide-react";
import MasterPage from "../MasterPage";

export default function States() {
  return (
    <MasterPage
      title="States"
      subtitle="Manage Indian states used across the portal"
      Icon={MapPin}
      apiBase="/states"
      itemLabel="State"
    />
  );
}
