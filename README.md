# Negarit - Job Recruitment Platform

A modern, full-featured recruitment platform built with Next.js 15, TypeScript, and Tailwind CSS. Negarit enables seamless job matching, application management, and candidate recruitment workflows across three user roles: Recruiters, Candidates, and Administrators.

## 🎯 Features

### For Recruiters

- **Dashboard Analytics** — KPI cards, application pipeline charts, job performance metrics, and recruitment health snapshots
- **Job Management** — Post jobs, edit details (title, description, requirements, salary, deadline, type), and track applications
- **Application Management** — View detailed candidate profiles with resume, cover letter, skills, and experience
- **Bulk Operations** — Move multiple applications through stages, schedule interviews, submit feedback
- **Interview Scheduling** — Schedule interviews, record feedback scores, track candidate progress
- **Advanced Filters** — Filter applications by status, search by name/email, bulk select and update
- **Real-time Toasts** — Success/error notifications for all actions
- **Active Navigation** — Sidebar highlights current page

### For Candidates

- **Professional Dashboard** — Track applications, resume quality, match scores, offers, and interview invitations
- **Job Search** — Browse available positions with advanced search by title, company, location
- **Resume Management** — Upload resume (PDF, DOC, DOCX), parse quality score, track parse status
- **Job Application** — Apply with optional cover letters, track match scores and application status
- **Application Tracking** — View recent applications, top matches ranked by score, status updates
- **Profile Completeness** — Track profile completion percentage, identify missing information
- **Role-specific Help** — Guides and tips for maximizing job opportunities

### For Admins

- **User Management** — Manage recruiters, candidates, and admin accounts
- **Platform Analytics** — System-wide metrics on users, applications, job postings, hire rates
- **Company Management** — Oversee all recruiters and companies on the platform
- **Job Monitoring** — View all job postings, track activity and performance

## 🏗️ Architecture

### Tech Stack

- **Frontend Framework** — [Next.js 15](https://nextjs.org) with App Router
- **Language** — [TypeScript](https://www.typescriptlang.org)
- **Styling** — [Tailwind CSS](https://tailwindcss.com) with custom components
- **UI Components** — [shadcn/ui](https://ui.shadcn.com) patterns + custom components (@base-ui primitives)
- **Icons** — [Lucide React](https://lucide.dev)
- **Charts** — [Recharts](https://recharts.org)
- **Authentication** — Custom JWT-based with refresh token rotation
- **HTTP Client** — Fetch API with automatic token injection and refresh

### Project Structure

```
src/
├── app/                           # Next.js App Router pages
│   ├── (admin)/admin/             # Admin role pages
│   │   ├── layout.tsx             # Admin layout with sidebar & header
│   │   ├── page.tsx               # Dashboard
│   │   ├── jobs/[id]/page.tsx     # Job details (for editing)
│   │   ├── settings/page.tsx      # Admin settings
│   │   └── ...
│   ├── (recruiter)/recruiter/     # Recruiter role pages
│   │   ├── layout.tsx             # Recruiter layout with sidebar & header
│   │   ├── page.tsx               # Recruitment dashboard with charts
│   │   ├── jobs/page.tsx          # Jobs listing
│   │   ├── jobs/[id]/page.tsx     # Job detail with application management
│   │   ├── profile/page.tsx       # Profile page
│   │   ├── help/page.tsx          # Help center (role-specific)
│   │   ├── settings/page.tsx      # Settings
│   │   └── ...
│   ├── (candidate)/candidate/     # Candidate role pages
│   │   ├── layout.tsx             # Candidate layout with sidebar & header
│   │   ├── page.tsx               # Candidate dashboard
│   │   ├── jobs/page.tsx          # Job search and listing
│   │   ├── jobs/[id]/page.tsx     # Job detail with apply form
│   │   ├── profile/page.tsx       # Candidate profile
│   │   ├── help/page.tsx          # Help center (role-specific)
│   │   ├── settings/page.tsx      # Settings
│   │   └── ...
│   ├── (public)/                  # Public pages (login, landing)
│   ├── layout.tsx                 # Root layout with hydration safety
│   └── globals.css                # Global styles
├── components/
│   ├── admin/
│   │   ├── admin-header.tsx       # Top navbar with search, notifications, user menu
│   │   ├── admin-sidebar.tsx      # Admin sidebar navigation
│   │   ├── metric-card.tsx        # KPI card component
│   │   └── settings-sidebar.tsx   # Settings page sidebar
│   ├── auth/
│   │   ├── auth-provider.tsx      # Global auth context with hydration safety
│   │   └── require-role.tsx       # Route protection by role
│   ├── candidate/
│   │   └── candidate-sidebar.tsx  # Candidate sidebar navigation
│   ├── recruiter/
│   │   ├── recruiter-sidebar.tsx  # Recruiter sidebar navigation
│   │   ├── post-job-dialog.tsx    # Modal to post new job
│   │   └── edit-job-dialog.tsx    # Modal to edit job details
│   └── ui/
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── chart.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── progress.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── table.tsx
│       ├── textarea.tsx
│       └── toast.tsx              # Toast notification component
├── lib/
│   ├── config.ts                  # Environment and API config
│   ├── utils.ts                   # Utility functions
│   └── api/
│       ├── http.ts                # Fetch wrapper with token injection
│       ├── endpoints.ts           # API client methods typed
│       └── types.ts               # Shared types (User, Job, Application, etc.)
└── public/
    └── logo.png                   # Platform logo
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Environment variables configured (see below)

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Frontend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   ```bash
   # Create .env.local with:
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001  # Backend API URL
   ```

4. **Start development server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## 🔐 Authentication & Authorization

### Flow

1. User logs in via `/` (public page) with email & password
2. Backend returns `accessToken` + `user` object with `role` (RECRUITER, APPLICANT, ADMIN)
3. Token stored in localStorage (persisted across tabs)
4. HTTP client automatically injects token in all requests
5. When token expires, refresh endpoint is called transparently
6. `RequireRole` component protects routes by role
7. Logout clears token and redirects to home

### Role-Based Access

- **RECRUITER** — Access `/recruiter/*` routes, manage jobs and applications
- **APPLICANT** — Access `/candidate/*` routes, search and apply to jobs
- **ADMIN** — Access `/admin/*` routes, manage platform users and analytics

## 🎨 UI Components & Patterns

### Toast System

- **Location**: `src/components/ui/toast.tsx`
- **Usage**: Call `addToast(message, type)` in any page component to show notifications
- **Auto-dismiss**: Toasts disappear after 4 seconds (customizable)
- **Types**: success, error, info

### Card-Based Layouts

- **Stat Cards** — KPI displays with icon, value, title, and subtitle
- **Application Cards** — Expandable cards showing applicant details on click
- **Job Cards** — Job listings with company, location, salary, type badge, and apply CTA
- **Status Badges** — Color-coded by application stage (SUBMITTED, REVIEWED, SHORTLISTED, INTERVIEW, OFFERED, REJECTED)

### Forms & Modals

- **Job Application Form** — Cover letter textarea, job selection dropdown, apply button
- **Resume Upload** — Drag-and-drop zone with file type validation
- **Interview Modal** — Schedule interview with type (VIDEO/IN_PERSON), date, location
- **Feedback Modal** — Score (1-5 slider), feedback textarea
- **Note Modal** — Add note to bulk/single status updates

### Responsive Design

- Desktop sidebar (hidden on mobile)
- Mobile-friendly hamburger menu with sheet navigation
- Grid layouts that adapt from 1 → 2 → 3+ columns
- Touch-friendly button sizes and spacing

## 📡 API Integration

### Key Endpoints Used

**Authentication**

- `POST /auth/login` — Login with email & password
- `POST /auth/logout` — Logout
- `POST /auth/refresh` — Refresh access token
- `POST /auth/registerApplicant` — Register as candidate
- `POST /auth/registerRecruiter` — Register as recruiter

**Jobs**

- `GET /jobs` — List all jobs (paginated)
- `GET /jobs/{id}` — Job details
- `POST /jobs` — Create job (recruiter only)
- `PATCH /jobs/{id}` — Update job (recruiter/admin only)

**Recruiter-specific**

- `GET /recruiter/me` — Get recruiter profile
- `GET /recruiter/myJobs` — Recruiter's posted jobs
- `GET /recruiter/candidatesForJob/{jobId}` — Applicants for a job
- `PATCH /applications/{id}/status` — Move applicant to stage (includes note)
- `PATCH /jobs/{id}/applications/bulk-status` — Bulk update applications
- `POST /applications/{id}/interviews` — Schedule interview
- `PATCH /interviews/{id}/feedback` — Submit interview feedback

**Candidate-specific**

- `GET /applicant/me` — Get candidate profile
- `POST /applicant/apply` — Submit job application (includes cover letter)
- `GET /applicant/myApplications` — Candidate's applications
- `POST /applicant/uploadResume` — Upload resume file
- `GET /applicant/resumeStatus` — Parse status and score

## 🎯 Development Workflow

### Adding a New Page

1. Create route file at `src/app/(role)/role/page-name/page.tsx`
2. Use `"use client"` directive for client components
3. Import `useAuth()` for API access and user data
4. Wrap in `<RequireRole role="ROLE">` if route-specific

### Styling Guidelines

- Use Tailwind CSS classes
- Prefer `bg-linear-to-br` over `bg-gradient-to-br`
- Use design tokens: `slate-*/slate-950/slate-100`, `indigo-*/emerald-*`, etc.
- Rounded corners: `rounded-2xl` for cards, `rounded-3xl` for major sections
- Spacing: Use `space-y-*` and `gap-*` for consistency

### State Management

- Local component state for forms and modals
- Context API (`useAuth()`) for global auth state
- No external state library (keep it simple)

### Error Handling

- Try/catch blocks in async functions
- Type `ApiError` for backend errors
- Show user-friendly error messages in toasts or error cards
- Log errors to console in development

## 📊 Key Data Structures

### Job

```typescript
{
  id: string;
  title: string;
  description: string;
  requirements: string[];
  requiredSkills: string[];
  location: string;
  type: "FULL_TIME" | "PART_TIME" | "REMOTE" | "CONTRACT" | "INTERN";
  category?: string;
  salaryMin?: number;
  salaryMax?: number;
  deadline?: string;
  applicantCount: number;
  postedAt: string;
  recruiter: { id: string; companyName: string; industry: string; website?: string };
}
```

### Application

```typescript
{
  id: string;
  status: "SUBMITTED" | "REVIEWED" | "SHORTLISTED" | "INTERVIEW" | "OFFERED" | "REJECTED";
  coverLetter?: string;
  matchScore: number;
  appliedAt: string;
  job: { id: string; title: string; company: string; location: string; type: string };
}
```

### RecruiterProfile

```typescript
{
  id: string;
  companyName: string;
  industry: string;
  isVerified: boolean;
  employeeCount: number;
  website?: string;
  email: string;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
  activeJobs: number;
  totalHires: number;
  createdAt: string;
}
```

## 🔍 Common Tasks

### Refresh Dashboard Data

```typescript
// Fetch latest data and update state
const loadData = async () => {
  const [profile, jobs, apps] = await Promise.all([
    api.recruiter.me(),
    api.recruiter.myJobs({ page: 1, limit: 100 }),
    api.recruiter.candidatesForJob(jobId, { page: 1, limit: 100 }),
  ]);
  // Update state...
};
```

### Update Job and Show Toast

```typescript
try {
  await api.jobs.update(jobId, { title, description, salary_min, salary_max });
  addToast("Job updated successfully!", "success");
  await loadData(); // Refresh
} catch (e) {
  addToast(e.message, "error");
}
```

### Filter and Sort Applications

```typescript
const filtered = applications
  .filter((app) => normalizeStatus(app.status) === selectedStatus)
  .filter((app) => app.applicant?.fullName?.toLowerCase().includes(search))
  .sort((a, b) => b.matchScore - a.matchScore);
```

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow prompts to deploy. Automatically builds and deploys on git push.

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables (Production)

- `NEXT_PUBLIC_API_BASE_URL` — Production backend URL (e.g., https://api.negarit.com)

## 📝 Notes

- **Hydration Safety**: The `AuthProvider` delays localStorage reads to `useEffect` to prevent server/client mismatch
- **Active Navigation**: Sidebar links use longest-prefix matching for accurate "current page" highlighting
- **Toast Stacking**: Multiple toasts stack at top-right, auto-dismiss independently
- **Responsive Images**: The logo uses Next.js `Image` component for optimization
- **Type Safety**: All API responses are typed; check `types.ts` for definitions

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and test locally
3. Commit with clear messages: `git commit -m "Add feature description"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For issues, questions, or feature requests, please open an issue on the repository or contact the development team.
