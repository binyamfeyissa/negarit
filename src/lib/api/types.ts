export type Role = "APPLICANT" | "RECRUITER" | "ADMIN";

export type UserStatus = "ACTIVE" | "PENDING" | "SUSPENDED";

export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";

export type InterviewType = "VIDEO" | "IN_PERSON" | "PHONE";

export type DocType = "DEGREE" | "CERTIFICATION" | "OTHER";

export type TokenType =
  | "CREDIT_SIGNUP"
  | "CREDIT_PURCHASE"
  | "DEBIT_MOCK_INTERVIEW"
  | "DEBIT_SKILL_GAP"
  | "DEBIT_JOB_POST";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED";

export type ApiErrorDetail = {
  path?: (string | number)[];
  message?: string;
  code?: string;
  [key: string]: unknown;
};

export type ApiErrorPayload =
  | { error: { code?: string; message?: string; details?: ApiErrorDetail[] } }
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
  tokens?: number;
  verification_doc_url?: string | null;
  verification_doc_type?: string | null;
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
  status: UserStatus;
  tokens?: number;
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
  status?: JobStatus;
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
  dailySignups?: { date: string; count: number }[];
};

export type VerificationDocResult = {
  verificationDocUrl: string;
  docType: string;
  fileName: string;
};

export type TokenBalance = {
  tokens: number;
  history: Array<{
    type: TokenType;
    amount: number;
    description?: string;
    createdAt: string;
  }>;
};

export type SkillGapAnalysis = {
  matching_skills?: string[];
  missing_skills?: string[];
  weak_areas?: string[];
  recommendations?: string[];
};

export type SkillGapResult = {
  jobId: string;
  jobTitle: string;
  analysis: SkillGapAnalysis | string;
  tokensUsed: number;
};

export type MockInterviewQuestion = {
  question: string;
  options: Record<string, string>;
  correct_answer: string;
};

export type MockInterviewResult = {
  jobId: string;
  jobTitle: string;
  questions: MockInterviewQuestion[];
  tokensUsed: number;
  source?: string;
};

export type McqsResult = {
  jobId: string;
  jobTitle: string;
  questions: Array<{
    question: string;
    options?: string[];
    answer?: string;
  }>;
};

export type TokenPackage = {
  id: string;
  name: string;
  tokens: number;
  priceEtb: number;
  description?: string;
};

export type PaymentInitResult = {
  paymentId: string;
  txRef: string;
  checkoutUrl: string;
  amount: number;
  tokensGranted: number;
};

export type PaymentVerifyResult = {
  status: PaymentStatus | string;
  tokensGranted: number;
  amount: number;
};

export type PaymentHistoryItem = {
  id: string;
  txRef: string;
  status: PaymentStatus;
  amount: number;
  tokensGranted: number;
  createdAt: string;
};
