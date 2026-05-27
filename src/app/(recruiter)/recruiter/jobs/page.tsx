"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Filter, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostJobDialog } from "@/components/recruiter/post-job-dialog";
import { useAuth } from "@/components/auth/auth-provider";
import { useEffect, useState } from "react";
import type { Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

export default function RecruiterJobsPage() {
  const { api } = useAuth();
  const { tr } = useLocale();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function loadJobs() {
    let cancelled = false;
    api.recruiter
      .myJobs({ page: 1, limit: 50 })
      .then((res) => {
        if (cancelled) return;
        setJobs(res.data);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load jobs.");
      });
    return () => { cancelled = true; };
  }

  useEffect(loadJobs, [api]);

  async function handleDelete(jobId: string, e: React.MouseEvent) {
    e.preventDefault();
    if (!confirm("Delete this job? This cannot be undone.")) return;
    setDeletingId(jobId);
    setError(null);
    try {
      await api.jobs.remove(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete job.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{tr("jobs")}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr("rjNoJobs")}</p>
        </div>
        <div className="flex items-center gap-3">
          <PostJobDialog
            onSuccess={loadJobs}
            trigger={<Button className="bg-[#4238b8] hover:bg-[#342c94] text-white font-semibold">+ {tr("rjPostJob")}</Button>}
          />
          <Button variant="outline" className="flex items-center gap-2 font-semibold" disabled>
            <Filter size={16} /> Filter
          </Button>
        </div>
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="relative group">
            <Link href={`/recruiter/jobs/${job.id}`}>
              <Card className="border-gray-100 shadow-sm rounded-xl overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
                        <path d="M12 2.22l-6 3.89 6 3.89 6-3.89-6-3.89zM6 10l-6 3.89 6 3.89 6-3.89-6-3.89zM18 10l-6 3.89 6 3.89 6-3.89-6-3.89zM12 21.78l-6-3.89v-3.89l6 3.89 6-3.89v3.89l-6 3.89z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 truncate">{job.title}</h3>
                      <p className="text-sm text-gray-500 font-medium">{job.recruiter?.companyName ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4 flex-wrap">
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-none font-medium text-xs">
                      {job.type}
                    </Badge>
                    {job.category ? (
                      <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 shadow-none font-medium text-xs">
                        {job.category}
                      </Badge>
                    ) : null}
                  </div>

                  <p className="text-sm text-gray-500 mb-6 leading-relaxed line-clamp-2">{job.description}</p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center text-gray-400 text-xs font-medium">
                      <MapPin size={14} className="mr-1" />
                      {job.location}
                    </div>
                    <div className="text-sm font-bold text-gray-900">{job.applicantCount} {tr("rjApplicants")}</div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <button
              onClick={(e) => handleDelete(job.id, e)}
              disabled={deletingId === job.id}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete job"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {jobs.length === 0 ? (
          <div className="text-sm text-gray-500">{tr("rjNoJobs")}</div>
        ) : null}
      </div>
    </div>
  );
}
