"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { Search, MapPin, DollarSign, Briefcase } from "lucide-react";
import Link from "next/link";

function typeClass(type: string) {
  return type === "FULL_TIME"
    ? "bg-indigo-50 text-indigo-700 border-indigo-100"
    : type === "REMOTE"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : type === "CONTRACT"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-slate-50 text-slate-700 border-slate-100";
}

function prettyTypeLabel(type?: string) {
  switch (type) {
    case 'FULL_TIME':
      return 'Full time';
    case 'PART_TIME':
      return 'Part time';
    case 'REMOTE':
      return 'Remote';
    case 'CONTRACT':
      return 'Contract';
    case 'INTERN':
      return 'Intern';
    default:
      return type ?? '—';
  }
}

function formatSalary(min?: number | null, max?: number | null) {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min != null) return `${min.toLocaleString()}+`;
  return `${max?.toLocaleString()}`;
}

export default function CandidateJobsPage() {
  const { api } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const res = await api.jobs.list({ page: 1, limit: 100 });
        if (cancelled) return;
        setJobs(res.data ?? []);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load jobs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [api]);

  const filteredJobs = jobs.filter((job) =>
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.recruiter?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-56 rounded bg-slate-200" />
              <div className="grid gap-4 pt-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-32 rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="text-lg text-slate-950">Available Jobs</CardTitle>
          <CardDescription>Browse and apply to opportunities</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by title, company, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

          {filteredJobs.length > 0 ? (
            <div className="space-y-3">
              {filteredJobs.map((job) => {
                const salaryLabel = formatSalary(job.salaryMin, job.salaryMax);
                return (
                  <Link
                    key={job.id}
                    href={`/candidate/jobs/${job.id}`}
                    className="block rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-950">{job.title ?? 'Untitled role'}</p>
                        <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                          <Briefcase size={16} />
                          <span>{job.recruiter?.companyName ?? '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                          <MapPin size={16} />
                          <span>{job.location ?? '—'}</span>
                        </div>
                        {salaryLabel && (
                          <div className="flex items-center gap-2 mt-1 text-sm text-slate-600">
                            <DollarSign size={16} />
                            <span>{salaryLabel}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className={typeClass(job.type)}>{prettyTypeLabel(job.type)}</Badge>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-3 text-xs text-slate-500">
                      <span>{job.applicantCount ?? 0} applicants</span>
                      <span className="text-indigo-600 hover:underline font-semibold">
                        View details →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm font-medium text-slate-900">No jobs found</p>
              <p className="mt-1 text-sm text-slate-500">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
