// ============ MOCK DATA (frontend-only teaser) ============
// All data below is MOCKED. Real hiremejobs.in CDN assets used for pixel-accuracy.

const CDN = "https://apidata.hiremejobs.in/uploads";

// ---------- HEADER NAV ----------
export const navItems = ["Jobs", "Remote Jobs", "Learn", "Services", "Career"];

// ---------- HOMEPAGE ----------
export const popularCities = [
  { name: "Delhi", image: `${CDN}/1790190449993-Delhi.png` },
  { name: "Kolkata", image: `${CDN}/1790190469638-Kolkata.png` },
  { name: "Hyderabad", image: `${CDN}/1790190007500-Hyderabad-(1).png` },
  { name: "Chennai", image: `${CDN}/1790190437075-Chennai.png` },
  { name: "Pune", image: `${CDN}/1790190498685-Pune.png` },
  { name: "Mumbai", image: `${CDN}/1790190483234-Mumbai.png` },
  { name: "Bengaluru (Bangalore)", image: `${CDN}/1790190422646-Banglore.png` },
  { name: "Ahmedabad", image: `${CDN}/1790190402072-Ahmedbad.png` },
];

export const featuredCompanies = [
  { name: "Maxgen Technologies", logo: `${CDN}/1790240944683-Logo-without-bg.png` },
  { name: "HealthPlus Shekhawat", logo: `${CDN}/1790224566991-1600w-aC_CDOutGYs.webp` },
  { name: "Maxgen Technologies", logo: `${CDN}/1790240944683-Logo-without-bg.png` },
  { name: "HealthPlus Shekhawat", logo: `${CDN}/1790224566991-1600w-aC_CDOutGYs.webp` },
  { name: "Maxgen Technologies", logo: `${CDN}/1790240944683-Logo-without-bg.png` },
  { name: "HealthPlus Shekhawat", logo: `${CDN}/1790224566991-1600w-aC_CDOutGYs.webp` },
];

export const popularCategories = [
  { name: "Software", icon: `${CDN}/1790190913237-software.gif` },
  { name: "Information Technology", icon: `${CDN}/1790190898037-responsive.gif` },
  { name: "Banking / Financial Services", icon: `${CDN}/1790191380735-bank.gif` },
  { name: "Sales And Marketing", icon: `${CDN}/1790191279995-sales-enablement.gif` },
  { name: "Artificial Intelligence", icon: `${CDN}/1790191187895-ai-image.gif` },
  { name: "Consumer Electronics", icon: `${CDN}/1790190959144-circuit-board.gif` },
];

export const heroImage = "https://hiremejobs.in/_next/static/media/hero.1849i_3caj-8v.png";
export const ctaImage = "https://hiremejobs.in/_next/static/media/CTA.2nhl1b4x9nsm4.png";

export const experienceOptions = [
  "Fresher", "0-1 Years", "1-3 Years", "3-5 Years", "5-8 Years", "8-10 Years", "10+ Years",
];

export const skillIndustries = [
  "Software", "Information Technology", "Banking / Financial Services",
  "Sales and Marketing", "Artificial Intelligence", "Consumer Electronics",
];

export const skillsByIndustry = {
  "Software": [
    { name: "HTML5/CSS3", jobs: 5 }, { name: "React.Js", jobs: 3 }, { name: "Git", jobs: 3 },
    { name: "JavaScript (ES6+)", jobs: 3 }, { name: "Node.Js", jobs: 3 }, { name: "Redux", jobs: 2 },
  ],
  "Information Technology": [
    { name: "DevOps", jobs: 4 }, { name: "Docker", jobs: 2 }, { name: "Kubernetes", jobs: 2 },
    { name: "Linux", jobs: 3 }, { name: "Networking", jobs: 2 }, { name: "Python", jobs: 4 },
  ],
  "Banking / Financial Services": [
    { name: "Accounting", jobs: 3 }, { name: "Risk Analysis", jobs: 2 }, { name: "Excel", jobs: 5 },
    { name: "Auditing", jobs: 2 }, { name: "SAP", jobs: 1 }, { name: "Taxation", jobs: 2 },
  ],
  "Sales and Marketing": [
    { name: "SEO", jobs: 4 }, { name: "Google Ads", jobs: 3 }, { name: "CRM", jobs: 2 },
    { name: "Content", jobs: 3 }, { name: "Analytics", jobs: 2 }, { name: "Branding", jobs: 1 },
  ],
  "Artificial Intelligence": [
    { name: "Machine Learning", jobs: 4 }, { name: "TensorFlow", jobs: 2 }, { name: "NLP", jobs: 2 },
    { name: "PyTorch", jobs: 2 }, { name: "Computer Vision", jobs: 1 }, { name: "LLMs", jobs: 3 },
  ],
  "Consumer Electronics": [
    { name: "Embedded C", jobs: 2 }, { name: "IoT", jobs: 2 }, { name: "PCB Design", jobs: 1 },
    { name: "Firmware", jobs: 2 }, { name: "VLSI", jobs: 1 }, { name: "Testing", jobs: 2 },
  ],
};

export const vacancyTabs = ["Skills", "Location", "Industry", "Roles", "Company"];

export const vacancyChips = {
  Skills: ["HTML5/CSS3", "React.Js", "Node.Js", "Python", "AWS", "Git", "DevOps", "Java", "SQL", "Redux"],
  Location: ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Pune", "Hyderabad", "Kolkata", "Ahmedabad"],
  Industry: ["Software", "Information Technology", "Banking / Financial Services", "Sales and Marketing", "Artificial Intelligence", "Consumer Electronics"],
  Roles: ["Software Engineer", "Data Analyst", "DevOps Engineer", "UI/UX Designer", "Product Manager", "Lecturer"],
  Company: ["Maxgen Technologies", "HealthPlus Shekhawat", "TechNova", "Quantum Labs", "Vertex Digital"],
};

// ---------- FOOTER ----------
export const footerColumns = {
  "Job Categories": ["Jobs By Skills", "Jobs By Education", "Jobs By Location", "Jobs By Function", "Jobs By Industry"],
  "Software Jobs": ["Web Development", "Data Scientist", "SAP Consaltant", "Generative AI", "Digital marketing"],
  "Jobs by Department": ["Human Resources", "Sales & Marketing", "Accounting", "Call Center", "Electrical Engineering"],
  "Employers": ["Employer Login", "Job Posting", "Access Resume Database", "Sign In", "Buy Online"],
  "Job Seekers": ["Job Seekers Login", "Upload Resume", "Search Tips", "Find Companies"],
  "Company Info": ["About Us", "Contact Us", "Send Feedback"],
};

// ---------- ADMIN AUTH ----------
export const SUPERADMIN = {
  email: "admin@hireme.in",
  password: "admin123",
  name: "Komal Saini",
  role: "Super Admin",
};

// ---------- ADMIN DASHBOARD ----------
export const dashboardStats = [
  { label: "ACTIVE CANDIDATES", value: 36, icon: "Users", color: "#2c0eee" },
  { label: "ACTIVE JOBS", value: 10, icon: "Briefcase", color: "#f61d25" },
  { label: "ACTIVE COMPANIES", value: 6, icon: "Building2", color: "#2c0eee" },
  { label: "TOTAL SEARCH COUNT", value: 19, icon: "Search", color: "#f61d25" },
];

export const jobsCreatedMonthly = [
  { month: "Jan", value: 4 }, { month: "Feb", value: 2 }, { month: "Mar", value: 6 },
  { month: "Apr", value: 3 }, { month: "May", value: 5 }, { month: "Jun", value: 8 },
  { month: "Jul", value: 3 },
];

export const jobsByIndustry = [
  { name: "Software", value: 31, fill: "#2c0eee" },
  { name: "Information Tech", value: 15, fill: "#f61d25" },
  { name: "Banking", value: 12, fill: "#2c0eee" },
  { name: "Sales & Mktg", value: 9, fill: "#f61d25" },
];

export const candidatesMonthly = [
  { month: "Jan", value: 12 }, { month: "Feb", value: 18 }, { month: "Mar", value: 15 },
  { month: "Apr", value: 24 }, { month: "May", value: 30 }, { month: "Jun", value: 27 },
];

export const recentCompanies = [
  { id: 1, company: "Shekhawat Tech", industry: "Software", date: "24 Sep 2026", status: "Active" },
  { id: 2, company: "CC Solutions", industry: "Software", date: "24 Sep 2026", status: "Active" },
  { id: 3, company: "Vertex Digital", industry: "IT", date: "22 Sep 2026", status: "Pending" },
  { id: 4, company: "Quantum Labs", industry: "AI", date: "21 Sep 2026", status: "Active" },
];

export const recentJobs = [
  { id: 1, title: "Demo Engineer", company: "HealthPlus", date: "24 Sep 2026", status: "Published" },
  { id: 2, title: "Lecturer", company: "HealthPlus", date: "24 Sep 2026", status: "Published" },
  { id: 3, title: "React Developer", company: "Maxgen", date: "23 Sep 2026", status: "Draft" },
  { id: 4, title: "Data Analyst", company: "Vertex", date: "22 Sep 2026", status: "Published" },
];

// ---------- MASTERS: EDUCATION CATEGORIES ----------
export const educationCategoriesSeed = [
  { id: 1, name: "Graduate Diploma", trending: true, status: true, updatedBy: "yash soni", updatedAt: "23 Sep 2026" },
  { id: 2, name: "Associate Science (AS)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 3, name: "Chartered Global Management Accountant (CGMA)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 4, name: "Associate Chartered Management Accountant (ACMA)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 5, name: "Bachelor Of Journalism & Mass Communication (BJMC)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 6, name: "Bachelor Of Elementary Education (B.El.Ed)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 7, name: "Bachelor Of Fine Arts (B.F.A)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 8, name: "Bachelor Of Hotel Management And Catering Technology (BHMCT)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 9, name: "Bachelor Of Unani Medicine And Surgery (B.U.M.S)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 10, name: "Bachelor Of Physical Education (B.P.Ed)", trending: false, status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 11, name: "Master Of Business Administration (MBA)", trending: true, status: true, updatedBy: "priya k", updatedAt: "08 Sep 2026" },
  { id: 12, name: "Master Of Computer Applications (MCA)", trending: false, status: false, updatedBy: "-", updatedAt: "07 Sep 2026" },
];

// ---------- MASTERS: EDUCATION SUB CATEGORIES ----------
export const educationSubCategoriesSeed = [
  { id: 1, name: "Computer Science", category: "Bachelor Of Engineering", status: true, updatedBy: "yash soni", updatedAt: "23 Sep 2026" },
  { id: 2, name: "Mechanical Engineering", category: "Bachelor Of Engineering", status: true, updatedBy: "-", updatedAt: "10 Sep 2026" },
  { id: 3, name: "Finance", category: "Master Of Business Administration (MBA)", status: true, updatedBy: "priya k", updatedAt: "09 Sep 2026" },
  { id: 4, name: "Marketing", category: "Master Of Business Administration (MBA)", status: true, updatedBy: "-", updatedAt: "09 Sep 2026" },
  { id: 5, name: "Data Science", category: "Master Of Computer Applications (MCA)", status: true, updatedBy: "-", updatedAt: "08 Sep 2026" },
  { id: 6, name: "Painting", category: "Bachelor Of Fine Arts (B.F.A)", status: false, updatedBy: "-", updatedAt: "07 Sep 2026" },
  { id: 7, name: "Journalism", category: "Bachelor Of Journalism & Mass Communication (BJMC)", status: true, updatedBy: "-", updatedAt: "06 Sep 2026" },
];

export const categoryOptions = educationCategoriesSeed.map((c) => c.name);
