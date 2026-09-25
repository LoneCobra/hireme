import {
  GraduationCap, BookCopy, Factory, Layers, Sparkles, MapPin, Building,
  Gift, Tag, Languages, Coins, Clock, Briefcase, Users2, CreditCard,
  HelpCircle, MessageCircleQuestion, ListChecks, FolderTree, UserCog,
  BarChart3, MonitorSmartphone, Wallet, Mail,
} from "lucide-react";

// Every master is described here. The generic MasterPage + MasterFormPage read this.
// key = url slug (also matches backend apiBase without leading slash).
export const MASTERS = {
  "education-categories": {
    title: "Education Categories", itemLabel: "Category", Icon: GraduationCap,
    subtitle: "Manage education categories for job listings", hasTrending: true,
  },
  "education-sub-categories": {
    title: "Education Sub Categories", itemLabel: "Sub Category", Icon: BookCopy,
    subtitle: "Sub categories linked to education categories",
    parent: { key: "category", label: "Parent Category", optionsApi: "/education-categories" },
  },
  "industries": {
    title: "Industries", itemLabel: "Industry", Icon: Factory,
    subtitle: "Industries used for jobs and companies",
  },
  "sub-industries": {
    title: "Sub Industries", itemLabel: "Sub Industry", Icon: Layers,
    subtitle: "Sub industries linked to industries",
    parent: { key: "industry", label: "Industry", optionsApi: "/industries" },
  },
  "skills": { title: "Skills", itemLabel: "Skill", Icon: Sparkles, subtitle: "Skills used across job listings" },
  "states": { title: "States", itemLabel: "State", Icon: MapPin, subtitle: "Indian states used across the portal" },
  "cities": {
    title: "Cities", itemLabel: "City", Icon: Building,
    subtitle: "Manage cities. Trending cities appear on the homepage.",
    parent: { key: "state", label: "State", optionsApi: "/states" }, hasTrending: true, hasImage: true,
  },
  "perk-benefit-categories": { title: "Perk & Benefit Categories", itemLabel: "Category", Icon: Gift, subtitle: "Categories for perks & benefits" },
  "perk-benefits": {
    title: "Perk & Benefits", itemLabel: "Perk", Icon: Tag, subtitle: "Perks & benefits offered by companies",
    parent: { key: "category", label: "Perk Category", optionsApi: "/perk-benefit-categories" },
  },
  "languages": { title: "Languages", itemLabel: "Language", Icon: Languages, subtitle: "Languages known by candidates" },
  "currencies": {
    title: "Currencies", itemLabel: "Currency", Icon: Coins, subtitle: "Currencies for salaries and payments",
    fields: [
      { key: "code", label: "Currency Code", type: "text", placeholder: "e.g. INR" },
      { key: "symbol", label: "Symbol", type: "text", placeholder: "e.g. \u20b9" },
    ],
    tableCols: [{ key: "code", label: "Code" }, { key: "symbol", label: "Symbol" }],
  },
  "notice-periods": { title: "Notice Periods", itemLabel: "Notice Period", Icon: Clock, subtitle: "Candidate notice period options" },
  "company-types": { title: "Company Types", itemLabel: "Company Type", Icon: Building, subtitle: "Types of companies" },
  "company-sizes": { title: "Company Sizes", itemLabel: "Company Size", Icon: Users2, subtitle: "Company size buckets" },
  "company-subscriptions": { title: "Company Subscriptions", itemLabel: "Subscription", Icon: CreditCard, subtitle: "Subscription plans for companies" },
  "company-faqs": {
    title: "Company FAQ", itemLabel: "FAQ", Icon: HelpCircle, subtitle: "FAQs shown to companies", primaryLabel: "Question",
    fields: [{ key: "answer", label: "Answer", type: "textarea", required: true, placeholder: "Answer to the question" }],
    tableCols: [{ key: "answer", label: "Answer", truncate: true }],
  },
  "candidate-faqs": {
    title: "Candidate FAQ", itemLabel: "FAQ", Icon: MessageCircleQuestion, subtitle: "FAQs shown to candidates", primaryLabel: "Question",
    fields: [{ key: "answer", label: "Answer", type: "textarea", required: true, placeholder: "Answer to the question" }],
    tableCols: [{ key: "answer", label: "Answer", truncate: true }],
  },
  "job-types": { title: "Job Types", itemLabel: "Job Type", Icon: Briefcase, subtitle: "Employment types (Full-time, Part-time...)" },
  "function-role-categories": { title: "Function Role Categories", itemLabel: "Category", Icon: FolderTree, subtitle: "Categories for function roles" },
  "function-roles": {
    title: "Function Roles", itemLabel: "Function Role", Icon: UserCog, subtitle: "Roles linked to role categories",
    parent: { key: "category", label: "Role Category", optionsApi: "/function-role-categories" },
  },
  "experience-levels": { title: "Experience Levels", itemLabel: "Experience Level", Icon: BarChart3, subtitle: "Experience level options" },
  "workplace-types": { title: "Workplace Types", itemLabel: "Workplace Type", Icon: MonitorSmartphone, subtitle: "Remote / Onsite / Hybrid etc." },
  "salary-options": { title: "Salary Options", itemLabel: "Salary Option", Icon: Wallet, subtitle: "Salary range / type options" },
  "email-templates": {
    title: "Email Templates", itemLabel: "Email Template", Icon: Mail,
    subtitle: "Manage automated email body, subject lines, variables and dispatch.",
    primaryLabel: "Template Name",
    fields: [
      { key: "key", label: "Template Key", type: "text", required: true, placeholder: "e.g. candidate_registration" },
      { key: "subject", label: "Subject", type: "text", required: true, placeholder: "Email subject line" },
      { key: "recipient", label: "Recipient Type", type: "select", options: ["Candidate", "Company", "All Users"] },
      { key: "dispatch", label: "Email Dispatch", type: "switch" },
      { key: "body", label: "Email Body (HTML)", type: "textarea", placeholder: "<p>Hello {{name}}...</p>" },
    ],
    tableCols: [{ key: "key", label: "Key" }, { key: "subject", label: "Subject" }, { key: "recipient", label: "Recipient", badge: true }, { key: "dispatch", label: "Dispatch", toggle: true }],
  },
};

// Sidebar grouping / ordering
export const MASTER_GROUPS = [
  { label: "Education", keys: ["education-categories", "education-sub-categories"] },
  { label: "Industry", keys: ["industries", "sub-industries", "function-role-categories", "function-roles"] },
  { label: "Jobs", keys: ["skills", "job-types", "experience-levels", "workplace-types", "salary-options"] },
  { label: "Perks", keys: ["perk-benefit-categories", "perk-benefits"] },
  { label: "Company", keys: ["company-types", "company-sizes", "company-subscriptions", "company-faqs", "candidate-faqs"] },
  { label: "Location", keys: ["states", "cities"] },
  { label: "Config", keys: ["languages", "currencies", "notice-periods", "email-templates"] },
];

export function getMaster(key) {
  return MASTERS[key] ? { key, api: `/${key}`, ...MASTERS[key] } : null;
}
