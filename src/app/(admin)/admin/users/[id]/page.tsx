import { use } from "react";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <div className="max-w-4xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
      <p className="text-sm text-gray-500">
        This page previously used demo data. The backend API does not currently provide an endpoint to fetch a user profile by ID for admins
        (only list + status update), so this route is disabled.
      </p>
      <p className="text-xs text-gray-400">User ID: {id}</p>
    </div>
  );
}
