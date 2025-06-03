// src/contexts/ProjectAccess/ProjectAccessContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import {
    createInvitationApi,
    getProjectInvitationsApi,
    getProjectPermissionsApi,
    updatePermissionRoleApi,
    deletePermissionApi,
    deleteInvitationApi,
} from '../services/accessService'; // Asegúrate de la ruta

const ProjectAccessContext = createContext();

export const useProjectAccess = () => useContext(ProjectAccessContext);

export const ProjectAccessProvider = ({ children }) => {
    const [permissions, setPermissions] = useState([]);
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Función para cargar permisos de un proyecto específico
    const loadProjectPermissions = useCallback(async (projectId) => {
        if (!projectId) {
            setPermissions([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await getProjectPermissionsApi(projectId);
            setPermissions(data);
        } catch (err) {
            setError(err.message || 'Error al cargar los permisos del proyecto.');
            console.error("Error al cargar permisos:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para cargar invitaciones pendientes de un proyecto específico
    const loadProjectInvitations = useCallback(async (projectId) => {
        if (!projectId) {
            setInvitations([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const data = await getProjectInvitationsApi(projectId);
            setInvitations(data);
        } catch (err) {
            setError(err.message || 'Error al cargar las invitaciones del proyecto.');
            console.error("Error al cargar invitaciones:", err);
        } finally {
            setLoading(false);
        }
    }, []);


    // Función para crear una nueva invitación
    const createInvitation = useCallback(async (email, projectId, rol) => {
        setLoading(true);
        setError(null);
        try {
            const newInvitation = await createInvitationApi(email, projectId, rol);
            // Si la invitación fue exitosa, actualiza la lista de invitaciones localmente
            setInvitations(prev => [...prev, newInvitation]);
            return newInvitation;
        } catch (err) {
            setError(err.message || 'Error al crear la invitación.');
            console.error("Error al crear invitación:", err);
            throw err; // Vuelve a lanzar para que el componente que llama pueda manejarlo
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para cambiar el rol de un permiso existente
    const updatePermissionRole = useCallback(async (permissionId, newRol, projectId) => {
        setLoading(true);
        setError(null);
        try {
            await updatePermissionRoleApi(permissionId, newRol);
            // Actualiza el estado local
            setPermissions(prev => prev.map(p =>
                p._id === permissionId ? { ...p, rol: newRol } : p
            ));
            return true;
        } catch (err) {
            setError(err.message || 'Error al actualizar el rol del permiso.');
            console.error("Error al actualizar permiso:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para eliminar un permiso
    const removePermission = useCallback(async (permissionId, projectId) => {
        setLoading(true);
        setError(null);
        try {
            await deletePermissionApi(permissionId);
            // Actualiza el estado local
            setPermissions(prev => prev.filter(p => p._id !== permissionId));
            return true;
        } catch (err) {
            setError(err.message || 'Error al eliminar el permiso.');
            console.error("Error al eliminar permiso:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Función para eliminar una invitación pendiente
    const removeInvitation = useCallback(async (invitationId, projectId) => {
        setLoading(true);
        setError(null);
        try {
            await deleteInvitationApi(invitationId);
            // Actualiza el estado local
            setInvitations(prev => prev.filter(inv => inv._id !== invitationId));
            return true;
        } catch (err) {
            setError(err.message || 'Error al eliminar la invitación.');
            console.error("Error al eliminar invitación:", err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);


    const value = {
        permissions,
        invitations,
        loading,
        error,
        loadProjectPermissions,
        loadProjectInvitations,
        createInvitation,
        updatePermissionRole,
        removePermission,
        removeInvitation,
    };

    return (
        <ProjectAccessContext.Provider value={value}>
            {children}
        </ProjectAccessContext.Provider>
    );
};