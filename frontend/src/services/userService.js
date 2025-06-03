import { fetchWithAuth, fetchWithAuthAndFiles } from '../helpers/fetch'

export const updateUser = async (id, data) => {
    let responseData; // Para almacenar la respuesta JSON

    if (data instanceof FormData) {
        responseData = await fetchWithAuthAndFiles(`users/${id}`, 'PATCH', data);
    } else {
        responseData = await fetchWithAuth(`users/${id}`, 'PATCH', data);
    }

    if (responseData && responseData.user) {
        return responseData.user;
    } else {
        return responseData;
    }
};


export const getUser = async (id) => {
    return fetchWithAuth(`users/${id}`);
}

export const deleteUser = async (id) => {
    return fetchWithAuth(`auth/${id}`, 'DELETE');
};

