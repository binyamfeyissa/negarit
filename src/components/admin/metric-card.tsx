import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: string;
  isPositive: boolean;
  icon: ReactNode;
}

export function MetricCard({ title, value, trend, isPositive, icon }: MetricCardProps) {
  return (
    <Card className="shadow-sm border-gray-100 rounded-xl">
      <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-600 border border-indigo-100/50">
            {icon}
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <ArrowRight size={18} />
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-bold">{value}</h2>
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {isPositive ? '+' : ''}{trend}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
