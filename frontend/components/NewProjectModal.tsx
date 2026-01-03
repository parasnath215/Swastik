import { useState } from 'react';
import { ProjectCreate } from '@/lib/api';

interface NewProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectCreate) => Promise<void>;
}

export default function NewProjectModal({ isOpen, onClose, onSubmit }: NewProjectModalProps) {
    const [formData, setFormData] = useState<ProjectCreate>({
        client_name: '',
        contact_details: '',
        location: '',
        project_type: 'Kitchen',
        estimated_area: 0,
        priority: 'medium',
        status: 'intake'
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
            onClose();
        } catch (error) {
            console.error("Error creating project:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                <h2 className="text-xl font-bold mb-4">New Project</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client Name</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                            value={formData.client_name}
                            onChange={e => setFormData({ ...formData, client_name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contact Details</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                            value={formData.contact_details}
                            onChange={e => setFormData({ ...formData, contact_details: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Project Type</label>
                            <select
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                                value={formData.project_type}
                                onChange={e => setFormData({ ...formData, project_type: e.target.value })}
                            >
                                <option value="Kitchen">Kitchen</option>
                                <option value="Wardrobe">Wardrobe</option>
                                <option value="Living">Living</option>
                                <option value="Full Home">Full Home</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Est. Area (sq ft)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-black"
                                value={formData.estimated_area}
                                onChange={e => setFormData({ ...formData, estimated_area: parseFloat(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
