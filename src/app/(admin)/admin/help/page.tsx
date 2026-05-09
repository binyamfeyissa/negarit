"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Users, Briefcase, BarChart3, Building, Settings } from "lucide-react";

export default function AdminHelpPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 rounded-3xl px-8 py-12 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Admin Guide</h1>
        <p className="text-slate-300 text-lg">Learn how to manage the platform effectively</p>
      </div>

      <Card className="shadow-sm border-amber-100 rounded-2xl overflow-hidden bg-amber-50/30">
        <CardHeader className="bg-amber-50 border-b border-amber-100 px-6 py-5">
          <div className="flex items-center space-x-3">
            <AlertCircle size={24} className="text-amber-600" />
            <CardTitle className="text-lg font-bold text-amber-900">Getting Started</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <ol className="space-y-3 text-sm text-amber-900">
            <li className="flex space-x-3">
              <span className="font-bold shrink-0">1.</span>
              <span>Visit the <strong>Dashboard</strong> to view real-time platform metrics and activity</span>
            </li>
            <li className="flex space-x-3">
              <span className="font-bold shrink-0">2.</span>
              <span>Use <strong>User Management</strong> to monitor all registered users and manage access</span>
            </li>
            <li className="flex space-x-3">
              <span className="font-bold shrink-0">3.</span>
              <span>View <strong>Companies</strong> to oversee all recruiter organizations</span>
            </li>
            <li className="flex space-x-3">
              <span className="font-bold shrink-0">4.</span>
              <span>Monitor <strong>Jobs</strong> to ensure quality and compliance of job postings</span>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-r from-indigo-50 to-blue-50 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center space-x-3">
            <BarChart3 size={24} className="text-indigo-600" />
            <div>
              <CardTitle className="text-lg font-bold">Dashboard</CardTitle>
              <CardDescription>Platform Overview & Analytics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Key Metrics</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Total Users:</strong> Count of all registered candidates, recruiters, and admins</li>
              <li>• <strong>Active Jobs:</strong> Number of currently open job postings</li>
              <li>• <strong>Total Applications:</strong> Cumulative applications across all jobs</li>
              <li>• <strong>Average Match Score:</strong> Overall quality indicator for recruiter-candidate matching</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-r from-purple-50 to-pink-50 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center space-x-3">
            <Users size={24} className="text-purple-600" />
            <div>
              <CardTitle className="text-lg font-bold">User Management</CardTitle>
              <CardDescription>Manage Users & Access Control</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">User Roles</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Recruiter:</strong> Company representatives posting jobs and managing applications</li>
              <li>• <strong>Candidate:</strong> Job seekers searching for positions and applying</li>
              <li>• <strong>Admin:</strong> Platform administrators with full system access</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden">
        <CardHeader className="bg-linear-to-r from-emerald-50 to-teal-50 border-b border-gray-100 px-6 py-5">
          <div className="flex items-center space-x-3">
            <Briefcase size={24} className="text-emerald-600" />
            <div>
              <CardTitle className="text-lg font-bold">Companies & Recruiters</CardTitle>
              <CardDescription>Company Oversight & Details</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Company Information Tracked</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <strong>Company Name:</strong> Official business name</li>
              <li>• <strong>Industry:</strong> Business sector/vertical</li>
              <li>• <strong>Website:</strong> Company web presence</li>
              <li>• <strong>Employee Count:</strong> Organization size</li>
              <li>• <strong>Active Jobs:</strong> Currently open positions</li>
              <li>• <strong>Verification Status:</strong> Active, Pending, or Suspended</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-100 rounded-2xl overflow-hidden bg-green-50/30">
        <CardHeader className="bg-green-50 border-b border-green-100 px-6 py-5">
          <CardTitle className="text-lg font-bold text-green-900">✓ Best Practices</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ul className="space-y-3 text-sm text-green-900">
            <li>• <strong>Regular Monitoring:</strong> Check the dashboard daily for platform activity</li>
            <li>• <strong>User Verification:</strong> Verify recruiter companies before approval</li>
            <li>• <strong>Job Quality:</strong> Review and remove inappropriate or spam job postings</li>
            <li>• <strong>Data Security:</strong> Keep admin credentials secure and use strong passwords</li>
            <li>• <strong>Backup Data:</strong> Export user and job data regularly for backup purposes</li>
            <li>• <strong>User Support:</strong> Respond promptly to user reports and complaints</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
