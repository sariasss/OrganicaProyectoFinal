import { fetchWithAuth } from "../helpers/fetch";

export const createPage = async (projectId, title) => {
    return fetchWithAuth('pages', 'POST', { projectId, title });
};

export const getPageById = async (pageId) => {
    return fetchWithAuth(`pages/${pageId}`, 'GET');
};

export const updatePage = async (pageId, data) => {
    return fetchWithAuth(`pages/${pageId}`, 'PATCH', data);
};

export const deletePage = async (pageId) => {
    return fetchWithAuth(`pages/${pageId}`, 'DELETE');
};