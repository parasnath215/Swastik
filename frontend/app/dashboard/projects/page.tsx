"use client";

import { useEffect, useState } from "react";
import { FolderPlus, MapPin, Ruler } from "lucide-react";
import { fetchProjects, createProject, Project, ProjectCreate } from "@/lib/api";
import NewProjectModal from "@/components/NewProjectModal";

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadProjects = async () => {
        try {
            const data = await fetchProjects();
            setProjects(data);
        } catch (error) {
            // Silently fail for now or add toast notification later
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProjects();
    }, []);

    const handleCreateProject = async (data: ProjectCreate) => {
        await createProject(data);
        loadProjects(); // Reload list
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                    + New Project
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-12 text-gray-500">Loading projects...</div>
            ) : projects.length === 0 ? (
                <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                        <FolderPlus className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No projects found</h3>
                    <p className="text-gray-500 mt-2 max-w-sm">
                        Get started by creating a new project to track progress, costs, and schedules.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{project.client_name}</h3>
                                    <p className="text-sm text-gray-500">{project.project_type}</p>
                                </div>
                                <span className="px-2 py-1 text-xs rounded-full bg-blue-50 text-blue-700 capitalize">
                                    {project.status || 'Intake'}
                                </span>
                            </div>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>{project.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Ruler className="w-4 h-4" />
                                    <span>{project.estimated_area} sq ft</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateProject}
            />
        </div>
    );
}
