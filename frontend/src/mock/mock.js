// ============ MOCK DATA (frontend-only teaser) ============
// All data below is MOCKED. Replace with real API during backend phase.

// ---------- HOMEPAGE ----------
export const popularCities = [
  { name: "Delhi", image: "https://images.unsplash.com/photo-1706545604042-399792bd8a04?crop=entropy&cs=srgb&fm=jpg&w=600&q=80" },
  { name: "Kolkata", image: "https://images.unsplash.com/photo-1679249010086-b8a932c8cafc?crop=entropy&cs=srgb&fm=jpg&w=600&q=80" },
  { name: "Hyderabad", image: "https://images.pexels.com/photos/5414582/pexels-photo-5414582.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { name: "Chennai", image: "https://images.unsplash.com/photo-1672767644202-a2148c00739f?crop=entropy&cs=srgb&fm=jpg&w=600&q=80" },
  { name: "Pune", image: "https://images.unsplash.com/photo-1552133457-ce1d2d33cdfb?crop=entropy&cs=srgb&fm=jpg&w=600&q=80" },
  { name: "Mumbai", image: "https://images.pexels.com/photos/36171603/pexels-photo-36171603.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { name: "Bengaluru (Bangalore)", image: "https://images.pexels.com/photos/9305033/pexels-photo-9305033.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { name: "Ahmedabad", image: "https://images.unsplash.com/photo-1653299311171-31939b3b84b0?crop=entropy&cs=srgb&fm=jpg&w=600&q=80" },
];

export const featuredCompanies = [
  { name: "Maxgen Technologies", initials: "MX", color: "#2c0eee" },
  { name: "HealthPlus Shekhawat", initials: "HP", color: "#f61d25" },
  { name: "TechNova Systems", initials: "TN", color: "#0ea5e9" },
  { name: "BrightPath Solutions", initials: "BP", color: "#16a34a" },
  { name: "Quantum Labs", initials: "QL", color: "#9333ea" },
  { name: "Skyline Corp", initials: "SC", color: "#ea580c" },
  { name: "Vertex Digital", initials: "VD", color: "#0d9488" },
  { name: "PrimeEdge Inc", initials: "PE", color: "#be123c" },
];

export const popularCategories = [
  { name: "Software", icon: "Code2", jobs: 31 },
  { name: "Information Technology", icon: "MonitorSmartphone", jobs: 15 },
  { name: "Banking / Financial Services", icon: "Landmark", jobs: 12 },
  { name: "Sales and Marketing", icon: "TrendingUp", jobs: 9 },
  { name: "Artificial Intelligence", icon: "BrainCircuit", jobs: 7 },
  { name: "Consumer Electronics", icon: "CircuitBoard", jobs: 5 },
];

export const experienceOptions = [
  "Fresher", "0-1 Years", "1-3 Years", "3-5 Years", "5-8 Years", "8-10 Years", "10+ Years",
];

export const skillsByIndustry = {
  "Software": [
    { name: "HTML5/CSS3", jobs: 5 }, { name: "React.js", jobs: 3 }, { name: "Git", jobs: 3 },
    { name: "JavaScript (ES6+)", jobs: 3 }, { name: "AWS", jobs: 3 }, { name: "Node.js", jobs: 3 },
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

export const trendingJobs = [
  "React Developer", "Data Analyst", "DevOps Engineer", "UI/UX Designer", "Lecturer",
];

export const footerLinks = {
  "For Candidates": ["Browse Jobs", "Browse Companies", "Job Alerts", "Create Profile", "Career Advice"],
  "For Employers": ["Post a Job", "Browse Candidates", "Pricing Plans", "Recruiter Login", "Resources"],
  "Company": ["About Us", "Contact Us", "Blog", "Privacy Policy", "Terms of Service"],
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
