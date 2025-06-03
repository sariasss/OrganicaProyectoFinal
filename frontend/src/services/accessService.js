import { fetchWithAuth } from "../helpers/fetch";

// Crear invitación
export const createInvitationApi = async (email, projectId, rol) => {
    return fetchWithAuth("invitations", 'POST', { email, projectId, rol });
};

// Obtener invitaciones (con query param como espera el backend)
export const getProjectInvitationsApi = async (projectId) => {
    return fetchWithAuth(`invitations?projectId=${projectId}`, 'GET');
};

// Obtener permisos del proyecto
export const getProjectPermissionsApi = async (projectId) => {
    return fetchWithAuth(`permissions/${projectId}`, 'GET');
};

// Actualizar el rol de un permiso
export const updatePermissionRoleApi = async (permissionId, newRol) => {
    return fetchWithAuth(`permissions/${permissionId}`, 'PATCH', { rol: newRol });
};

// Eliminar permiso
export const deletePermissionApi = async (permissionId) => {
    return fetchWithAuth(`permissions/${permissionId}`, 'DELETE');
};

// Eliminar invitación (corregida la ruta)
export const deleteInvitationApi = async (invitationId) => {
    return fetchWithAuth(`invitations/${invitationId}`, 'DELETE');
};

export const getUserInvitationsApi = async (email) => {
  return fetchWithAuth(`invitations?email=${email}`, 'GET');
};

export const acceptInvitationApi = async (invitation) => {
  const { projectId, rol, _id } = invitation;

  await fetchWithAuth("permissions", "POST", {
    projectId,
    userId: null, // el backend debe detectar el usuario autenticado
    rol
  });

  await fetchWithAuth(`invitations/${_id}`, "DELETE");
};

export const rejectInvitationApi = async (invitationId) => {
  return fetchWithAuth(`invitations/${invitationId}`, 'DELETE');
};
