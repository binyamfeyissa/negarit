import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RecruiterSettingsGeneralPage() {
  return (
    <div className="space-y-0 divide-y divide-gray-100">
      {/* Account Details Section */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 pb-8">
        <div className="md:w-56 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">Account Details</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">Your users will use this information to contact you.</p>
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Full Name <span className="text-red-500">*</span></label>
            <Input defaultValue="Marlina Markova" className="border-gray-200 rounded-lg max-w-sm" />
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 pt-8">
        <div className="md:w-56 flex-shrink-0">
          <h2 className="text-base font-bold text-gray-900">Address</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">This address will appear on your invoice.</p>
        </div>
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Address Name <span className="text-red-500">*</span></label>
            <Input defaultValue="Apartment" className="border-gray-200 rounded-lg" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Country or Region <span className="text-red-500">*</span></label>
            <Select defaultValue="us">
              <SelectTrigger className="w-full border-gray-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="et">Ethiopia</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">City <span className="text-red-500">*</span></label>
            <Input defaultValue="Los Angeles" className="border-gray-200 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Address <span className="text-red-500">*</span></label>
              <Input defaultValue="123 Sunset Boulevard, Los Angeles, CA" className="border-gray-200 rounded-lg" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Postal Code <span className="text-red-500">*</span></label>
              <Input defaultValue="90028" className="border-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
