import { Truck } from "lucide-react";

export default function DeliveryPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
            </div>

            <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <Truck className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Delivery Status</h3>
                <p className="text-gray-500 mt-2 max-w-sm">
                    Track shipments, delivery schedules, and logistics.
                </p>
            </div>
        </div>
    );
}
