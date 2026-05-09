export type Role = "APPLICANT" | "RECRUITER" | "ADMIN";

export type ApiErrorPayload =
  | { error: { code?: string; message?: string } }
  | { message?: string };

export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: unknown;

  constructor(opts: { status: number; message: string; code?: string; payload?: unknown }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code;
    this.payload = opts.payload;
  }
}

export type LoginResponse = {
  accessToken: string;
  user: { id: string; email: string; role: Role; isVerified: boolean };
};

export type RefreshResponse = { accessToken: string };

export type ApplicantProfile = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  resume_url?: string | null;
  parsed_skills?: string[];
  experience_years?: number;
  resume_score?: number;
  preferred_roles?: string[];
  is_verified: boolean;
  created_at: string;
  completeness: number;
};

export type RecruiterProfile = {
  id: string;
  companyName: string;
  industry: string;
  isVerified: boolean;
  employeeCount: number;
  website?: string | null;
  email: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  activeJobs: number;
  totalHires: number;
  createdAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total?: number;
  totalPages?: number;
};

export type Paginated<T> = { data: T[]; pagination: Pagination };

export type JobType = "FULL_TIME" | "PART_TIME" | "REMOTE" | "CONTRACT" | "INTERN";

export type Job = {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  requiredSkills: string[];
  location: string;
  type: JobType;
  category?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  deadline?: string | null;
  applicantCount: number;
  matchScore?: number | null;
  postedAt: string;
  recruiter: { id: string; companyName: string; industry: string; website?: string | null };
};

export type AppStatus =
  | "SUBMITTED"
  | "REVIEWED"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "REJECTED";

export type Application = {
  id: string;
  status: AppStatus;
  coverLetter?: string | null;
  matchScore: number;
  appliedAt: string;
  job: { id: string; title: string; company: string; location: string; type: JobType };
};

export type AnalyticsOverview = {
  totalUsers: number;
  totalApplicants: number;
  totalRecruiters: number;
  activeJobs: number;
  totalApplications: number;
  hireRate: number;
  avgMatchScore: number;
  dailySignups: { date: string; count: number }[];
};

