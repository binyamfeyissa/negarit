import type {
  AnalyticsOverview,
  ApplicantProfile,
  Application,
  AppStatus,
  DocType,
  InterviewType,
  Job,
  LoginResponse,
  McqsResult,
  MockInterviewResult,
  Paginated,
  PaymentHistoryItem,
  PaymentInitResult,
  PaymentVerifyResult,
  RecruiterProfile,
  RefreshResponse,
  SkillGapResult,
  TokenBalance,
  TokenPackage,
  UserStatus,
  VerificationDocResult,
} from "./types";

import type { createHttpClient } from "./http";

type Http = ReturnType<typeof createHttpClient>;

export type JobUpdateBody = {
  title: string;
  description: string;
  location: string;
  type: string;
  category?: string;
  requirements: string[];
  requiredSkills: string[];
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  status?: string;
};

export function createApi(http: Http) {
  return {
    auth: {
      login: (body: { email: string; password: string }) =>
        http.request<LoginResponse>("/auth/login", { method: "POST", body: JSON.stringify(body), auth: false }),
      refresh: () => http.request<RefreshResponse>("/auth/refresh", { method: "POST", auth: false }),
      logout: () => http.request<void>("/auth/logout", { method: "POST" }),
      registerApplicant: (body: {
        fullName: string;
        email: string;
        password: string;
        role: "applicant";
        phone?: string;
      }) => http.request<LoginResponse>("/auth/register", { method: "POST", body: JSON.stringify(body), auth: false }),
      registerRecruiter: (form: FormData) =>
        http.request<{ message: string; userId: string }>("/auth/register", { method: "POST", body: form, auth: false }),
      verifyEmail: (otp: string) =>
        http.request<{ message: string }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ otp }) }),
      resendOtp: () =>
        http.request<{ message: string }>("/auth/resend-otp", { method: "POST" }),
      forgotPassword: (email: string) =>
        http.request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }), auth: false }),
      resetPassword: (token: string, newPassword: string) =>
        http.request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, newPassword }), auth: false }),
    },
    applicant: {
      me: () => http.request<ApplicantProfile>("/applicants/me"),
      updateMe: (body: {
        fullName?: string;
        phone?: string;
        website?: string;
        experienceYears?: number;
        preferredRoles?: string[];
        skills?: string[];
      }) => http.request<ApplicantProfile>("/applicants/me", { method: "PATCH", body: JSON.stringify(body) }),
      uploadResume: (file: File) => {
        const form = new FormData();
        form.append("file", file);
        return http.request<{ resumeUrl: string; parseStatus: string }>("/applicants/me/resume", { method: "POST", body: form });
      },
      resumeStatus: () =>
        http.request<{ status: string; parsedSkills: string[]; resumeScore: number; feedback?: string }>("/applicants/me/resume/status"),
      uploadVerificationDoc: (file: File, docType?: DocType) => {
        const form = new FormData();
        form.append("verificationDoc", file);
        if (docType) form.append("docType", docType);
        return http.request<VerificationDocResult>("/applicants/me/verification-doc", { method: "POST", body: form });
      },
      tokenBalance: () => http.request<TokenBalance>("/applicants/me/tokens"),
      myApplications: (params?: { page?: number; limit?: number }) => {
        const q = new URLSearchParams();
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        return http.request<Paginated<Application>>(`/applications/me${q.toString() ? `?${q}` : ""}`);
      },
      apply: (jobId: string, body: { coverLetter?: string }) =>
        http.request<Application>(`/jobs/${jobId}/apply`, { method: "POST", body: JSON.stringify(body) }),
    },
    recruiter: {
      me: () => http.request<RecruiterProfile>("/recruiters/me"),
      updateMe: (body: { companyName?: string; industry?: string; employeeCount?: number; website?: string }) =>
        http.request<RecruiterProfile>("/recruiters/me", { method: "PATCH", body: JSON.stringify(body) }),
      myJobs: (params?: { status?: string; page?: number; limit?: number }) => {
        const q = new URLSearchParams();
        if (params?.status) q.set("status", params.status);
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        return http.request<Paginated<Job>>(`/recruiters/me/jobs${q.toString() ? `?${q}` : ""}`);
      },
      candidatesForJob: (jobId: string, params?: { status?: string; sortBy?: string; page?: number; limit?: number }) => {
        const q = new URLSearchParams();
        if (params?.status) q.set("status", params.status);
        if (params?.sortBy) q.set("sortBy", params.sortBy);
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        return http.request<Paginated<Application>>(`/jobs/${jobId}/applications${q.toString() ? `?${q}` : ""}`);
      },
      moveStage: (applicationId: string, body: { status: AppStatus; note?: string }) =>
        http.request<Application>(`/applications/${applicationId}/status`, { method: "PATCH", body: JSON.stringify(body) }),
      bulkMove: (jobId: string, body: { applicationIds: string[]; status: AppStatus; note?: string }) =>
        http.request<{ updated: number }>(`/jobs/${jobId}/applications/bulk-status`, { method: "PATCH", body: JSON.stringify(body) }),
      scheduleInterview: (applicationId: string, body: { type: InterviewType; scheduledTime: string; meetingLink?: string; location?: string }) =>
        http.request<unknown>(`/applications/${applicationId}/interview`, { method: "POST", body: JSON.stringify(body) }),
      updateInterview: (interviewId: string, body: { scheduledTime?: string; score?: number; feedback?: string; status?: string }) =>
        http.request<unknown>(`/interviews/${interviewId}`, { method: "PATCH", body: JSON.stringify(body) }),
    },
    jobs: {
      list: (params?: { q?: string; type?: string; location?: string; category?: string; salaryMin?: number; page?: number; limit?: number }) => {
        const q = new URLSearchParams();
        if (params?.q) q.set("q", params.q);
        if (params?.type) q.set("type", params.type);
        if (params?.location) q.set("location", params.location);
        if (params?.category) q.set("category", params.category);
        if (params?.salaryMin != null) q.set("salaryMin", String(params.salaryMin));
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        return http.request<Paginated<Job>>(`/jobs${q.toString() ? `?${q}` : ""}`);
      },
      get: (jobId: string) => http.request<Job>(`/jobs/${jobId}`),
      create: (body: {
        title: string;
        description: string;
        location: string;
        type: string;
        category?: string;
        requirements: string[];
        requiredSkills: string[];
        salaryMin?: number;
        salaryMax?: number;
        deadline?: string;
        status?: string;
      }) => http.request<Job>("/jobs", { method: "POST", body: JSON.stringify(body) }),
      update: (jobId: string, body: JobUpdateBody) =>
        http.request<Job>(`/jobs/${jobId}`, { method: "PATCH", body: JSON.stringify(body) }),
      remove: (jobId: string) => http.request<void>(`/jobs/${jobId}`, { method: "DELETE" }),
      recommended: (params?: { limit?: number }) => {
        const q = new URLSearchParams();
        if (params?.limit) q.set("limit", String(params.limit));
        return http.request<{ data: Job[] }>(`/jobs/recommended${q.toString() ? `?${q}` : ""}`);
      },
      skillGap: (jobId: string) =>
        http.request<SkillGapResult>(`/jobs/${jobId}/skill-gap`, { method: "POST" }),
      mockInterview: (jobId: string) =>
        http.request<MockInterviewResult>(`/jobs/${jobId}/mock-interview`, { method: "POST" }),
      mcqs: (jobId: string, body?: { numQuestions?: number }) =>
        http.request<McqsResult>(`/jobs/${jobId}/mcqs`, { method: "POST", body: JSON.stringify(body ?? {}) }),
    },
    payments: {
      packages: () => http.request<{ packages: TokenPackage[]; note?: string }>("/payments/packages", { auth: false }),
      initiate: (body: { packageId?: string; customEtb?: number }) =>
        http.request<PaymentInitResult>("/payments/initiate", { method: "POST", body: JSON.stringify(body) }),
      verify: (txRef: string) =>
        http.request<PaymentVerifyResult>(`/payments/verify/${txRef}`, { auth: false }),
      history: () => http.request<{ payments: PaymentHistoryItem[] }>("/payments/history"),
    },
    admin: {
      analyticsOverview: () => http.request<AnalyticsOverview>("/admin/analytics/overview"),
      users: (params?: { role?: string; status?: string; q?: string; page?: number; limit?: number }) => {
        const q = new URLSearchParams();
        if (params?.role) q.set("role", params.role);
        if (params?.status) q.set("status", params.status);
        if (params?.q) q.set("q", params.q);
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        return http.request<Paginated<Record<string, unknown>>>(`/admin/users${q.toString() ? `?${q}` : ""}`);
      },
      updateUserStatus: (userId: string, body: { status: UserStatus; note?: string }) =>
        http.request<{ userId: string; status: string }>(`/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify(body) }),
      pendingRecruiters: () => http.request<{ data: RecruiterProfile[] }>("/admin/recruiters/pending"),
      reviewRecruiter: (userId: string, body: { decision: "approve" | "reject"; note?: string }) =>
        http.request<unknown>(`/admin/recruiters/${userId}/review`, { method: "PATCH", body: JSON.stringify(body) }),
      logs: (params?: { userId?: string; action?: string; from?: string; to?: string; page?: number; limit?: number }) => {
        const q = new URLSearchParams();
        if (params?.userId) q.set("userId", params.userId);
        if (params?.action) q.set("action", params.action);
        if (params?.from) q.set("from", params.from);
        if (params?.to) q.set("to", params.to);
        if (params?.page) q.set("page", String(params.page));
        if (params?.limit) q.set("limit", String(params.limit));
        return http.request<Paginated<Record<string, unknown>>>(`/admin/logs${q.toString() ? `?${q}` : ""}`);
      },
      report: (params?: { format?: "csv" | "json"; from?: string; to?: string }) => {
        const q = new URLSearchParams();
        if (params?.format) q.set("format", params.format);
        if (params?.from) q.set("from", params.from);
        if (params?.to) q.set("to", params.to);
        return http.request<ArrayBuffer>(`/admin/analytics/report${q.toString() ? `?${q}` : ""}`, {
          headers: { Accept: params?.format === "json" ? "application/json" : "text/csv" },
        });
      },
    },
  };
}
