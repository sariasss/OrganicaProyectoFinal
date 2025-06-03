import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectAccess } from '../contexts/ProjectAccessContext';
import { useTheme } from '../contexts/ThemeContext';

const PermissionsPage = () => {
    const { projectId } = useParams();
    const {
        permissions,
        invitations,
        loading,
        error,
        loadProjectPermissions,
        loadProjectInvitations,
        createInvitation,
        updatePermissionRole,
        removePermission,
        removeInvitation
    } = useProjectAccess();
    const navigate = useNavigate();
    const { getHighlightTextColor, getBaseColors, theme, getBgColor } = useTheme();

    const { bgColor, textColor, secondaryBg } = getBaseColors();

    // State for custom modal/message box
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    // Function to display a custom message
    const displayMessage = (message) => {
        setModalMessage(message);
        setShowModal(true);
    };

    // Function to close the custom message box
    const closeMessage = () => {
        setShowModal(false);
        setModalMessage('');
    };

    const handleGoBack = () => navigate("/project/" + projectId);

    useEffect(() => {
        if (projectId) {
            loadProjectPermissions(projectId);
            loadProjectInvitations(projectId);
        }
    }, [projectId, loadProjectPermissions, loadProjectInvitations]);


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#212121] text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen ${bgColor} ${textColor} flex items-center justify-center text-lg text-red-500`}>
                Error: {error}
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${bgColor} ${textColor} py-4 px-4 sm:py-6 sm:px-6 md:px-8 lg:px-16 xl:px-24 font-inter relative`}>
            {/* Botón de volver */}
            <button onClick={handleGoBack} className={`p-2 rounded-full ${secondaryBg} ${textColor} absolute top-4 left-4 z-50 transition hover:opacity-80 focus:outline-none focus:ring-2 ${getHighlightTextColor()}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </button>
            <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center pt-12 sm:pt-0 ${textColor}`}>Gestión de Acceso al Proyecto</h1>


            {/* Sección de Miembros del Proyecto */}
            <div className="mb-8 max-w-4xl mx-auto">
                <div className="flex items-center mb-4">
                    <h2 className={`text-lg sm:text-xl md:text-2xl pb-2 mr-2 sm:mr-4 whitespace-nowrap ${textColor}`}>Miembros del Proyecto</h2>
                    <div className="flex-grow">
                        <hr className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'}`} />
                    </div>
                </div>
                {permissions.length === 0 ? (
                    <p className={`text-center ${textColor} text-base sm:text-lg`}>No hay miembros con permisos explícitos.</p>
                ) : (
                    <ul className="space-y-3">
                        {permissions.map(p => (
                            <li key={p._id} className={`flex flex-col sm:flex-row justify-between items-center ${secondaryBg} p-4 rounded-lg shadow-md transition-all duration-300`}>
                                <span className={`text-base sm:text-lg mb-2 sm:mb-0 ${textColor} text-center sm:text-left`}>
                                    <strong className={`${getHighlightTextColor()}`}>{p.userId?.username || 'Usuario Desconocido'}</strong>
                                </span>
                                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto items-center">
                                    <select
                                        value={p.rol}
                                        onChange={(e) => updatePermissionRole(p._id, e.target.value, projectId)}
                                        className={`${bgColor} ${textColor} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'} rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 ${getHighlightTextColor()} w-full sm:w-auto`}
                                        disabled={loading || p.rol === 'owner'}
                                    >
                                        <option value="owner">Propietario</option>
                                        <option value="editor">Editor</option>
                                        <option value="viewer">Lector</option>
                                    </select>
                                    <button
                                        onClick={() => removePermission(p._id, projectId)}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                        disabled={loading || p.rol === 'owner'}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>


            {/* Sección de Invitaciones */}
            <div className="mb-8 max-w-4xl mx-auto">
                <div className="flex items-center mb-4">
                    <h2 className={`text-lg sm:text-xl md:text-2xl pb-2 mr-2 sm:mr-4 whitespace-nowrap ${textColor}`}>Invitaciones Pendientes</h2>
                    <div className="flex-grow">
                        <hr className={`border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'}`} />
                    </div>
                </div>
                {invitations.length === 0 ? (
                    <p className={`text-center ${textColor} text-base sm:text-lg`}>No hay invitaciones pendientes para este proyecto.</p>
                ) : (
                    <ul className="space-y-3">
                        {invitations.map(inv => (
                            <li key={inv._id} className={`flex flex-col sm:flex-row justify-between items-center ${secondaryBg} p-4 rounded-lg shadow-md transition-all duration-300`}>
                                <span className={`text-base sm:text-lg mb-2 sm:mb-0 ${textColor} text-center sm:text-left`}>
                                    <strong className={`${getHighlightTextColor()}`}>{inv.email}</strong> - Rol: <span className="font-semibold">{inv.rol}</span> (Estado: <span className={`${textColor}`}>{inv.status}</span>)
                                </span>
                                <button
                                    onClick={() => removeInvitation(inv._id, projectId)}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-all duration-300 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                                    disabled={loading}
                                >
                                    Cancelar
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Formulario para enviar invitación */}
            <div className={`${secondaryBg} p-6 max-w-md mx-auto mt-8 rounded-lg shadow-xl`}>
                <h2 className={`text-xl sm:text-2xl font-semibold mb-4 text-center ${textColor}`}>Invitar a un nuevo usuario</h2>
                <form onSubmit={async (e) => {
                    e.preventDefault();
                    const email = e.target.email.value;
                    const rol = e.target.rol.value;
                    try {
                        await createInvitation(email, projectId, rol);
                        displayMessage('Invitación enviada con éxito!');
                        e.target.reset(); // Limpia el formulario
                        loadProjectInvitations(projectId); // Recargar invitaciones
                    } catch (err) {
                        displayMessage(`Error al enviar invitación: ${err.message}`);
                    }
                }} className="flex flex-col space-y-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email del usuario"
                        required
                        className={`${bgColor} ${textColor} p-3 rounded-md border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'} focus:outline-none focus:ring-2 ${getHighlightTextColor()} text-base`}
                    />
                    <select
                        name="rol"
                        required
                        className={`${bgColor} ${textColor} p-3 rounded-md border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-400'} focus:outline-none focus:ring-2 ${getHighlightTextColor()} text-base`}
                    >
                        <option value="viewer">Lector</option>
                        <option value="editor">Editor</option>
                    </select>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${getBgColor()} ${theme === 'light' ? 'text-white' : "text-black"} hover:opacity-80 font-bold py-3 px-4 rounded-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-base`}
                    >
                        {loading ? 'Enviando...' : 'Enviar Invitación'}
                    </button>
                </form>
            </div>

            {/* Custom Modal for messages */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`${secondaryBg} ${textColor} p-6 rounded-lg shadow-xl max-w-sm w-full text-center`}>
                        <p className="mb-4 text-lg">{modalMessage}</p>
                        <button
                            onClick={closeMessage}
                            className={`${getBgColor()} ${theme === 'light' ? 'text-white' : "text-black"} hover:opacity-80 font-bold py-2 px-4 rounded-md transition-all duration-300`}
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PermissionsPage;
