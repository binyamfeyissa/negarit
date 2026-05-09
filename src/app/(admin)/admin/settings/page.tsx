import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsGeneralPage() {
  return (
    <div className="space-y-8">
      {/* Account Details */}
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="md:w-1/3 mb-4 md:mb-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Account Details</h3>
          <p className="text-sm text-gray-500">Your users will use this information to contact you.</p>
        </div>
        <div className="md:w-2/3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
            <Input defaultValue="Marlina Markova" className="bg-white border-gray-200" />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Address */}
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="md:w-1/3 mb-4 md:mb-0">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Address</h3>
          <p className="text-sm text-gray-500">This address will appear on your invoice.</p>
        </div>
        <div className="md:w-2/3 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Address Name <span className="text-red-500">*</span></label>
            <Input defaultValue="Apartment" className="bg-white border-gray-200" />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Country or Region <span className="text-red-500">*</span></label>
            <Select defaultValue="us">
              <SelectTrigger className="bg-white border-gray-200">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">City <span className="text-red-500">*</span></label>
            <Input defaultValue="Los Angeles" className="bg-white border-gray-200" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Address <span className="text-red-500">*</span></label>
              <Input defaultValue="123 Sunset Boulevard, Los Angeles, CA" className="bg-white border-gray-200" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Postal Code <span className="text-red-500">*</span></label>
              <Input defaultValue="90028" className="bg-white border-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
