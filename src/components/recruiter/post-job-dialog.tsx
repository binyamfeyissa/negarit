"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api/types";
import type { JobType } from "@/lib/api/types";

export function PostJobDialog({ trigger, onSuccess }: { trigger: ReactNode; onSuccess?: () => void }) {
  const { api } = useAuth();
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<JobType>("FULL_TIME");
  const [category, setCategory] = useState("");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");

  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [deadline, setDeadline] = useState<string>("");
  const [requirementsRaw, setRequirementsRaw] = useState("");
  const [skillsRaw, setSkillsRaw] = useState("");

  const requirements = useMemo(
    () =>
      requirementsRaw
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    [requirementsRaw],
  );
  const requiredSkills = useMemo(
    () =>
      skillsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [skillsRaw],
  );

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) {
      setStep(1);
      setError(null);
      setLoading(false);
      setTitle("");
      setType("FULL_TIME");
      setCategory("");
      setSalaryMin("");
      setSalaryMax("");
      setDescription("");
      setLocation("");
      setDeadline("");
      setRequirementsRaw("");
      setSkillsRaw("");
    }
  };

  async function publish() {
    setError(null);
    setLoading(true);
    try {
      await api.jobs.create({
        title,
        description,
        location,
        type,
        category: category || undefined,
        requirements,
        requiredSkills,
        salaryMin: salaryMin ? Number(salaryMin) : undefined,
        salaryMax: salaryMax ? Number(salaryMax) : undefined,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      });
      onSuccess?.();
      setOpen(false);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to publish job.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-150 border-none shadow-xl bg-white rounded-xl overflow-hidden p-0">
        <DialogHeader className="px-6 py-5 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-gray-900">Post a Job</DialogTitle>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 1 ? 'bg-emerald-400 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
              <span className={`text-sm font-semibold ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Basic Information</span>
            </div>
            <div className="flex items-center space-x-1 px-1">
              {[1,2,3,4,5].map(i => <div key={i} className={`w-1 h-1 rounded-full ${step >= 2 ? 'bg-emerald-400' : 'bg-gray-200'}`} />)}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step >= 2 ? 'bg-emerald-400 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
              <span className={`text-sm font-semibold ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Job Details</span>
            </div>
            <div className="flex items-center space-x-1 px-1">
              {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-200" />)}
            </div>
          </div>
        </div>

        {step === 1 && (
          <>
            <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
              <h3 className="text-base font-bold text-gray-800">Basic Information</h3>
              {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Job Title <span className="text-red-500">*</span></label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Job Type <span className="text-red-500">*</span></label>
                <Select value={type} onValueChange={(v) => setType(v as JobType)}>
                  <SelectTrigger className="w-full rounded-lg border-gray-200"><SelectValue placeholder="Select type" /></SelectTrigger>
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
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Engineering" className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Salary Range</label>
                <div className="grid grid-cols-2 gap-3">
                  <Input value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} inputMode="numeric" placeholder="Min" className="rounded-lg border-gray-200" />
                  <Input value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} inputMode="numeric" placeholder="Max" className="rounded-lg border-gray-200" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-end space-x-3 border-t border-gray-100">
              <Button
                onClick={() => setStep(2)}
                disabled={!title.trim() || !type}
                className="bg-[#4238b8] hover:bg-[#342c94] text-white font-semibold px-6"
              >
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
              <h3 className="text-base font-bold text-gray-800">Job Details</h3>
              {error ? <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div> : null}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Job Description <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the role..." className="rounded-lg border-gray-200 min-h-35 resize-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Location <span className="text-red-500">*</span></label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Addis Ababa" className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Application Deadline</label>
                <Input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" className="rounded-lg border-gray-200" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Requirements <span className="text-red-500">*</span></label>
                <Textarea
                  value={requirementsRaw}
                  onChange={(e) => setRequirementsRaw(e.target.value)}
                  placeholder={"One per line, e.g.\nBachelor degree in CS\n3+ years experience"}
                  className="rounded-lg border-gray-200 min-h-25 resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Required Skills <span className="text-red-500">*</span></label>
                <Input value={skillsRaw} onChange={(e) => setSkillsRaw(e.target.value)} placeholder="TypeScript, Node.js, PostgreSQL" className="rounded-lg border-gray-200" />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
              <Button variant="ghost" onClick={() => setStep(1)} className="font-semibold text-gray-600">← Back</Button>
              <div className="flex items-center space-x-3">
                <Button
                  disabled={loading || !title.trim() || !description.trim() || !location.trim() || requirements.length === 0 || requiredSkills.length === 0}
                  onClick={publish}
                  className="bg-[#4238b8] hover:bg-[#342c94] text-white font-semibold px-6"
                >
                  {loading ? "Publishing..." : "Publish Job"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
