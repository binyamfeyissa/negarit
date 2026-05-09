"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { Job } from "@/lib/api/types";
import { ApiError } from "@/lib/api/types";
import { EditJobDialog } from "@/components/recruiter/edit-job-dialog";

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { api } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const j = await api.jobs.get(id);
        if (cancelled) return;
        setJob(j);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof ApiError ? e.message : "Failed to load job.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, id]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
         <Link href="/admin/jobs" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
           <ArrowLeft size={16} className="mr-1" /> Back to jobs
         </Link>
      </div>

      {/* Top Banner */}
      <div className="bg-[#2D1B89] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shadow-sm">
        <div className="flex items-center space-x-6 mb-6 md:mb-0">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm relative overflow-hidden">
             {/* Mock Logo */}
             <div className="w-8 h-8 rounded-full border-[3px] border-amber-400 bg-red-500"></div>
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-bold mb-1">{job?.title ?? "Loading..."}</h1>
            <p className="text-indigo-100/90 text-sm mb-1">{job?.location ?? "—"}</p>
            <p className="text-indigo-200/80 text-xs">
              {job?.recruiter?.companyName ? `${job.recruiter.companyName} • ` : ""}
              {job?.postedAt ? new Date(job.postedAt).toLocaleString() : ""}
            </p>
          </div>
        </div>

        {job ? (
          <EditJobDialog
            job={job}
            onSaved={setJob}
            trigger={
              <Button className="font-bold text-[#2c1d8c] bg-white hover:bg-gray-100 rounded-lg px-8">
                Edit Job
              </Button>
            }
          />
        ) : (
          <Button disabled className="font-bold text-[#2c1d8c] bg-white hover:bg-gray-100 rounded-lg px-8">
            Edit Job
          </Button>
        )}
      </div>

      {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3 mb-6">{error}</div> : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Qualifications</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-600 leading-relaxed text-sm">
              {(job?.requirements?.length ? job.requirements : ["—"]).map((req, idx) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>
          
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Job Description</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{job?.description ?? "—"}</p>
          </div>
        </div>

        {/* Right Column - Attributes */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardContent className="p-6 text-center flex flex-col justify-center items-center">
                <h3 className="text-xs text-gray-500 font-medium mb-1">Category</h3>
                <p className="font-semibold text-gray-900">{job?.category ?? "—"}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardContent className="p-6 text-center flex flex-col justify-center items-center">
                <h3 className="text-xs text-gray-500 font-medium mb-1">Type</h3>
                <p className="font-semibold text-gray-900">{job?.type ?? "—"}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardContent className="p-6 text-center flex flex-col justify-center items-center">
                <h3 className="text-xs text-gray-500 font-medium mb-1">Applicants</h3>
                <p className="font-semibold text-gray-900">{job?.applicantCount ?? "—"}</p>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-gray-100 rounded-2xl">
              <CardContent className="p-6 text-center flex flex-col justify-center items-center">
                <h3 className="text-xs text-gray-500 font-medium mb-1">Deadline</h3>
                <p className="font-semibold text-gray-900">{job?.deadline ? new Date(job.deadline).toLocaleDateString() : "—"}</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="shadow-sm border-gray-100 rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-center items-center h-28">
              <h3 className="text-xs text-gray-500 font-medium mb-1">Salary Range</h3>
              <p className="font-semibold text-gray-900">
                {typeof job?.salaryMin === "number" || typeof job?.salaryMax === "number"
                  ? `${job?.salaryMin ?? "—"} - ${job?.salaryMax ?? "—"}`
                  : "—"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
