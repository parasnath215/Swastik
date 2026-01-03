export interface Project {
    id?: number;
    client_name: string;
    contact_details: string;
    location: string;
    project_type: string;
    estimated_area: number;
    status: string;
    priority: string;
    created_at?: string;
}

export interface ProjectCreate {
    client_name: string;
    contact_details: string;
    location: string;
    project_type: string;
    estimated_area: number;
    priority?: string;
    status?: string;
}

const API_Base_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchProjects(): Promise<Project[]> {
    const response = await fetch(`${API_Base_URL}/projects/`);
    if (!response.ok) {
        throw new Error("Failed to fetch projects");
    }
    return response.json();
}

export async function createProject(project: ProjectCreate): Promise<Project> {
    const response = await fetch(`${API_Base_URL}/projects/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(project),
    });
    if (!response.ok) {
        throw new Error("Failed to create project");
    }
    return response.json();
}
