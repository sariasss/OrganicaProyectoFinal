import { fetchWithAuth, fetchWithAuthAndFiles } from "../helpers/fetch";


export const createBlock = async (pageId, type, content, order = null) => {
    const body = { pageId, type, content }; 
    if (order !== null) {
        body.order = order;
    }
    return fetchWithAuth('blocks/', 'POST', body);
};

export const getBlockById = async (blockId) => {
    return fetchWithAuth(`blocks/${blockId}`, 'GET');
};

export const updateBlock = async (blockId, data) => {
    if (data instanceof FormData) {
        return fetchWithAuthAndFiles(`blocks/${blockId}`, 'PATCH', data);
    } else {
        return fetchWithAuth(`blocks/${blockId}`, 'PATCH', data);
    }
};

export const deleteBlock = async (blockId) => {
    return fetchWithAuth(`blocks/${blockId}`, 'DELETE');
};
