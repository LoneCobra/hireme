import React from "react";
import { Building } from "lucide-react";
import MasterPage from "../MasterPage";

export default function Cities() {
  return (
    <MasterPage
      title="Cities"
      subtitle="Manage cities. Trending cities appear on the homepage."
      Icon={Building}
      apiBase="/cities"
      itemLabel="City"
      parent={{ key: "state", label: "State", optionsApi: "/states" }}
      hasTrending
      hasImage
    />
  );
}
