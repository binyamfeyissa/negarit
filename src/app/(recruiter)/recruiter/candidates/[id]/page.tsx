import { use } from "react";

export default function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold text-gray-900">Candidate Details</h1>
      <p className="text-sm text-gray-500">
        This route was previously using demo data. The backend API does not currently provide an endpoint to fetch a candidate profile by ID
        (it only lists applications per job and allows stage updates). This page is therefore disabled.
      </p>
      <p className="text-xs text-gray-400">Candidate/Application ID: {id}</p>
    </div>
  );
}
