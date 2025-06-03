import { fetchWithAuth } from '../helpers/fetch'

export const updateUser = async (id, data) => {
  const isFormData = data instanceof FormData;

  const response = await fetch(`/users/${id}`, {
    method: 'PATCH',
    credentials: 'include', // incluye cookies si usas auth
    headers: isFormData
      ? undefined // 🚫 NO seteamos Content-Type, fetch lo hace solo con FormData
      : {
          'Content-Type': 'application/json',
        },
    body: isFormData ? data : JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar usuario');
  }

  return await response.json();
};



export const getUser = async (id) => {
    return fetchWithAuth(`users/${id}`);
}

export const deleteUser = async (id) => {
    return fetchWithAuth(`auth/${id}`, 'DELETE');
};

