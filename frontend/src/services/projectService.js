import { fetchWithAuth, fetchWithAuthAndFiles } from "../helpers/fetch";

export const getProjects = async () => {
    return fetchWithAuth('projects', 'GET');
};

export const getProjectById = async (id) => {
    return fetchWithAuth(`projects/${id}`, 'GET');
};

export const createProject = async (data) => {
    if (data instanceof FormData) {
        return fetchWithAuthAndFiles('projects', 'POST', data);
    } else {
        return fetchWithAuth('projects', 'POST', data);
    }
};

export const updateProject = async (id, data) => {
    if (data instanceof FormData) {
        return fetchWithAuthAndFiles(`projects/${id}`, 'PATCH', data);
    } else {
        return fetchWithAuth(`projects/${id}`, 'PATCH', data);
    }
};

export const deleteProject = async (id) => {
    return fetchWithAuth(`projects/${id}`, 'DELETE');
};