"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToastContainer, type Toast } from "@/components/ui/toast";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError, type Job, type JobType } from "@/lib/api/types";

type Props = {
  job: Job;
  trigger: ReactNode;
  onSaved?: (job: Job) => void;
};

export function EditJobDialog({ job, trigger, onSaved }: Props) {
  const { api } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [title, setTitle] = useState(job.title);
  const [type, setType] = useState<JobType>(job.type);
  const [category, setCategory] = useState(job.category ?? "");
  const [salaryMin, setSalaryMin] = useState<string>(job.salaryMin != null ? String(job.salaryMin) : "");
  const [salaryMax, setSalaryMax] = useState<string>(job.salaryMax != null ? String(job.salaryMax) : "");
  const [description, setDescription] = useState(job.description);
  const [location, setLocation] = useState(job.location);
  const [deadline, setDeadline] = useState<string>(job.deadline ? job.deadline.slice(0, 10) : "");
  const [requirementsRaw, setRequirementsRaw] = useState(job.requirements.join("\n"));
  const [skillsRaw, setSkillsRaw] = useState(job.requiredSkills.join(", "));

  const requirements = useMemo(
    () =>
      requirementsRaw
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean),
    [requirementsRaw],
  );

  const requiredSkills = useMemo(
    () =>
      skillsRaw
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    [skillsRaw],
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    setTitle(job.title);
    setType(job.type);
    setCategory(job.category ?? "");
    setSalaryMin(job.salaryMin != null ? String(job.salaryMin) : "");
    setSalaryMax(job.salaryMax != null ? String(job.salaryMax) : "");
    setDescription(job.description);
    setLocation(job.location);
    setDeadline(job.deadline ? job.deadline.slice(0, 10) : "");
    setRequirementsRaw(job.requirements.join("\n"));
    setSkillsRaw(job.requiredSkills.join(", "));
  }, [job, open]);

  const pushToast = (message: string, type: Toast["type"] = "success") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => setToasts((prev) => prev.filter((toast) => toast.id !== id));

  async function save() {
    setLoading(true);
    setError(null);
    try {
      const updated = await api.jobs.update(job.id, {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        type,
        category: category.trim() || undefined,
        requirements,
        requiredSkills,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      onSaved?.(updated);
      pushToast("Job updated successfully", "success");
      setOpen(false);
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Failed to update job.";
      setError(message);
      pushToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={trigger as any} />
        <DialogContent className="sm:max-w-180 border-none shadow-xl bg-white rounded-xl overflow-hidden p-0">
          <DialogHeader className="px-6 py-5 border-b border-gray-100">
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Job Post</DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Job Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border-gray-200" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Job Type</label>
              <Select value={type} onValueChange={(value) => setType(value as JobType)}>
                <SelectTrigger className="w-full rounded-lg border-gray-200">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FULL_TIME">Full-time</SelectItem>
                  <SelectItem value="PART_TIME">Part-time</SelectItem>
                  <SelectItem value="REMOTE">Remote</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="INTERN">Intern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border-gray-200" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Salary Range</label>
              <div className="grid grid-cols-2 gap-3">
                <Input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} inputMode="numeric" placeholder="Min" className="rounded-lg border-gray-200" />
                <Input value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} inputMode="numeric" placeholder="Max" className="rounded-lg border-gray-200" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Job Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-lg border-gray-200 min-h-35 resize-none" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Location</label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-lg border-gray-200" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Deadline</label>
              <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" className="rounded-lg border-gray-200" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Requirements</label>
              <Textarea
                value={requirementsRaw}
                onChange={(e) => setRequirementsRaw(e.target.value)}
                placeholder={"One per line, e.g.\nBachelor degree in CS\n3+ years experience"}
                className="rounded-lg border-gray-200 min-h-25 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Required Skills</label>
              <Input value={skillsRaw} onChange={(e) => setSkillsRaw(e.target.value)} placeholder="TypeScript, Node.js, PostgreSQL" className="rounded-lg border-gray-200" />
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3 border-t border-gray-100">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={save} disabled={loading || !title.trim() || !description.trim() || !location.trim() || requirements.length === 0 || requiredSkills.length === 0} className="bg-[#4238b8] hover:bg-[#342c94] text-white font-semibold px-6">
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}