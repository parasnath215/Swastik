import { DollarSign, HardHat, TrendingUp, AlertTriangle } from "lucide-react";
import Link from "next/link";

// Placeholder components - in real app, these would come from ui folder
// Simulating the Card components if not yet created via shadcn
interface StatsCardProps {
    title: string;
    value: string;
    icon: any;
    description: string;
    trend: 'up' | 'down';
}

function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
                <p className={`text-sm mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {description}
                </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg">
                <Icon className="w-6 h-6 text-indigo-600" />
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <Link href="/dashboard/projects" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                    + New Project
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Projects"
                    value="12"
                    icon={HardHat}
                    description="+2 from last month"
                    trend="up"
                />
                <StatsCard
                    title="Total Revenue"
                    value="₹ 24.5L"
                    icon={DollarSign}
                    description="+15% from last month"
                    trend="up"
                />
                <StatsCard
                    title="Active Machines"
                    value="3/3"
                    icon={TrendingUp}
                    description="100% Utilization"
                    trend="up"
                />
                <StatsCard
                    title="Pending Issues"
                    value="4"
                    icon={AlertTriangle}
                    description="Needs attention"
                    trend="down"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-gray-900 mb-4">Recent Projects</h3>
                    <div className="space-y-4">
                        {/* List placeholder */}
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">Villa Project #{100 + i}</p>
                                    <p className="text-xs text-gray-500">Kitchen & Wardrobe</p>
                                </div>
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">In Progress</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[300px]">
                    <h3 className="font-bold text-gray-900 mb-4">Machine Schedule</h3>
                    {/* Calendar placeholder */}
                    <div className="flex items-center justify-center h-48 text-gray-400">
                        Calendar View Loading...
                    </div>
                </div>
            </div>
        </div>
    );
}
