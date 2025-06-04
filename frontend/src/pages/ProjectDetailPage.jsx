import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deleteProject, getProjectById, updateProject } from '../services/projectService';
import { updatePage, deletePage } from '../services/pageService';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';

import { SortablePageItem } from '../components/SortablePageItem';

const VITE_BASE_URL_IMAGE = import.meta.env.VITE_BASE_URL_IMAGE || 'https://organicaproyectofinal-production-d5a4.up.railway.app';

const ProjectDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { getHighlightTextColor, getBgColor, getBaseColors, theme } = useTheme();

    const { bgColor, textColor, secondaryBg } = getBaseColors();

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');
    const [pages, setPages] = useState([]);
    const [newCoverImageFile, setNewCoverImageFile] = useState(null);
    const [activeId, setActiveId] = useState(null);

    const handleGoBack = () => navigate("/home");

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const canEditProject = project && user && (
        String(project?.userId) === String(user._id) ||
        (project.permissions && project.permissions.some(p => String(p.userId) === String(user._id) && (p.rol === 'owner' || p.rol === 'editor')))
    );

    const isOwner = project && user && (
        String(project?.userId) === String(user._id) ||
        (project.permissions && project.permissions.some(p => String(p.userId) === String(user._id) && p.rol === 'owner'))
    );

    useEffect(() => {
        const fetchProjectDetails = async () => {
            try {
                setLoading(true);
                const data = await getProjectById(id);
                setProject(data.project);
                setEditedTitle(data.project.title);
                setEditedDescription(data.project.description || '');

                setPages(data.pages ? data.pages.sort((a, b) => a.order - b.order) : []);

            } catch (err) {
                console.error("Error al obtener los detalles del proyecto:", err);
                setError("No se pudo cargar el proyecto. Por favor, inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProjectDetails();
    }, [id, user?._id]);

    const defaultImageUrl = "/imagenes/default-cover.jpg";
    const coverImageUrl = project?.coverImage
        ? `${VITE_BASE_URL_IMAGE}/uploads/img/${project.coverImage}`
        : defaultImageUrl;

    const handleSettingsClick = () => navigate("/config");
    const handleInviteClick = () => navigate(`/permissions/${id}`);

    const handleDeleteProjectClick = async () => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este proyecto y todo su contenido?")) {
            try {
                await deleteProject(project._id);
                navigate("/home");
            } catch (err) {
                console.error("Error al eliminar el proyecto:", err);
                setError("Error al eliminar el proyecto.");
            }
        }
    };

    const handleNewPageClick = () => navigate(`/newPage/${project._id}`);
    const handlePageEdit = (pageId) => navigate(`/page/${pageId}/edit`);

    const handlePageDelete = async (pageId) => {
        if (!canEditProject) {
            alert("No tienes permisos para eliminar páginas en este proyecto.");
            return;
        }
        if (window.confirm("¿Estás seguro de que quieres eliminar esta página?")) {
            try {
                await deletePage(pageId);
                setPages(prevPages => prevPages.filter(page => page._id !== pageId));
                console.log(`Página ${pageId} eliminada.`);
            } catch (err) {
                console.error(`Error al eliminar la página ${pageId}:`, err);
                setError("Error al eliminar la página.");
            }
        }
    };

    const handleCoverImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setNewCoverImageFile(file);
        }
    };

    const handleProjectUpdate = async () => {
        try {
            const formData = new FormData();
            formData.append('title', editedTitle);
            formData.append('description', editedDescription);

            if (newCoverImageFile) {
                formData.append('coverImage', newCoverImageFile);
            }

            const updatedProjectResult = await updateProject(id, formData);
            setProject(updatedProjectResult.project);
            setIsEditing(false);
            setNewCoverImageFile(null);
        } catch (err) {
            console.error("Error al actualizar el proyecto:", err);
            setError("Error al actualizar el proyecto. Por favor, inténtalo de nuevo.");
        }
    };

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;

        if (!active || !over || active.id === over.id) {
            setActiveId(null);
            return;
        }

        const oldIndex = pages.findIndex(page => page._id === active.id);
        const newIndex = pages.findIndex(page => page._id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            console.error("No se encontró el elemento arrastrado o soltado en el estado.");
            setActiveId(null);
            return;
        }

        const newOrderedPages = arrayMove(pages, oldIndex, newIndex);
        setPages(newOrderedPages);

        const updates = newOrderedPages
            .filter((page, index) => page.order !== index)
            .map((page, index) => ({
                id: page._id,
                order: index
            }));

        try {
            await Promise.all(
                updates.map(update => updatePage(update.id, { order: update.order }))
            );
            console.log("Orden de las páginas actualizado exitosamente en el servidor.");
        } catch (apiError) {
            console.error("Error al actualizar el orden de las páginas:", apiError);
            setError("Error al actualizar el orden de las páginas. Por favor, recarga la página.");
        } finally {
            setActiveId(null);
        }
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#212121] text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return <div className={`min-h-screen ${bgColor} ${textColor} flex justify-center items-center text-red-500`}>{error}</div>;
    }

    if (!project) {
        return <div className={`min-h-screen ${bgColor} ${textColor} flex justify-center items-center`}>Proyecto no encontrado.</div>;
    }

    const displayedCoverImage = newCoverImageFile ? URL.createObjectURL(newCoverImageFile) : coverImageUrl;

    const activePage = activeId ? pages.find(page => page._id === activeId) : null;

    const gradientStyle = {
        background: `linear-gradient(to top, ${theme === 'dark' ? '#212121' : '#D9D9D9'}, transparent)`
    };

    return (
        <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col`}>
            {/* Header del proyecto con imagen de portada y degradado */}
            <div
                className="relative h-48 sm:h-64 md:h-80 lg:h-96 bg-cover bg-center p-4 sm:p-6"
                style={{ backgroundImage: `url(${displayedCoverImage})` }}
            >
                {/* Botón de volver */}
                <button 
                    onClick={handleGoBack} 
                    className={`p-2 sm:p-3 rounded-full ${textColor} absolute z-50 transition backdrop-blur-sm`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-6 sm:h-6">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <div className="absolute inset-0" style={gradientStyle}></div>
                
                {isEditing && (
                    <div className="absolute bottom-4 left-4 z-20">
                        <label htmlFor="cover-image-upload" className={`${secondaryBg} ${getHighlightTextColor()} px-3 py-2 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:opacity-80 transition duration-300 cursor-pointer`}>
                            Cambiar portada
                        </label>
                        <input
                            id="cover-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            className="hidden"
                        />
                    </div>
                )}
            </div>

            {/* Contenido principal del proyecto */}
            <div className={`relative z-10 w-full px-4 sm:px-6 md:px-10 pt-6 md:pt-15 pb-6 lg:px-28 xl:px-36 flex-grow flex flex-col ${bgColor}`}>

                {/* Layout móvil/tablet */}
                <div className="block lg:hidden mb-6">
                    {/* Título y descripción */}
                    <div className="mb-4">
                        {isEditing ? (
                            <input
                                type="text"
                                className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textColor} mb-3 sm:mb-4 ${secondaryBg} p-2 sm:p-3 rounded-xl sm:rounded-2xl w-full`}
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                placeholder="Título del proyecto"
                            />
                        ) : (
                            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${textColor} mb-3 sm:mb-4 break-words`}>
                                {project.title}
                            </h1>
                        )}
                        
                        {isEditing ? (
                            <textarea
                                className={`${textColor} text-sm sm:text-base ${secondaryBg} p-2 sm:p-3 rounded-xl sm:rounded-2xl w-full resize-none`}
                                value={editedDescription}
                                onChange={(e) => setEditedDescription(e.target.value)}
                                rows="3"
                                placeholder="Descripción del proyecto"
                            />
                        ) : (
                            project.description && (
                                <p className={`${textColor} text-sm sm:text-base break-words`}>
                                    {project.description}
                                </p>
                            )
                        )}
                    </div>

                    {/* Botones de acción móvil */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                        {canEditProject && (
                            <div className="flex gap-2 sm:gap-3">
                                <button
                                    onClick={() => {
                                        if (isEditing) {
                                            handleProjectUpdate();
                                        }
                                        setIsEditing(!isEditing);
                                    }}
                                    className={`flex-1 sm:flex-none rounded-full px-4 py-2.5 sm:px-6 sm:py-3 font-medium text-sm sm:text-base transition duration-300 ${
                                        isEditing ? 'bg-green-500 text-white hover:bg-green-600' : `${secondaryBg} ${getHighlightTextColor()} hover:opacity-80`
                                    }`}
                                >
                                    {isEditing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                            <span className="hidden sm:inline">Guardar</span>
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                            </svg>
                                            <span className="hidden sm:inline">Editar</span>
                                        </span>
                                    )}
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleSettingsClick}
                            className={`${secondaryBg} rounded-full p-2.5 sm:p-3 hover:opacity-80 transition duration-300 transform hover:scale-105 self-end sm:self-auto`}
                            title="Configuración"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor"
                                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${getHighlightTextColor()}`}>
                                <circle cx="12" cy="12" r="3" />
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Layout desktop (original) */}
                <div className="hidden lg:block">
                    <div className="flex justify-between items-start mb-6">
                        <div className="max-w-3xl">
                            {isEditing ? (
                                <input
                                    type="text"
                                    className={`text-4xl sm:text-5xl font-bold ${textColor} mb-4 ${secondaryBg} p-2 rounded-2xl w-full`}
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                />
                            ) : (
                                <h1 className={`text-4xl sm:text-5xl font-bold ${textColor} mb-4`}>{project.title}</h1>
                            )}
                            {isEditing ? (
                                <textarea
                                    className={`${textColor} text-base mt-8 sm:text-lg ${secondaryBg} p-2 rounded-2xl w-full`}
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    rows="3"
                                />
                            ) : (
                                project.description && (
                                    <p className={`${textColor} text-base mt-8 sm:text-lg`}>{project.description}</p>
                                )
                            )}
                        </div>
                        <div className="flex flex-col items-end">
                            {canEditProject && (
                                <button
                                    onClick={() => {
                                        if (isEditing) {
                                            handleProjectUpdate();
                                        }
                                        setIsEditing(!isEditing);
                                    }}
                                    className={`rounded-full px-4 py-2 mb-4 font-medium transition duration-300 ${
                                        isEditing ? 'bg-green-500 text-white' : `${secondaryBg} ${getHighlightTextColor()}`
                                    } hover:opacity-80`}
                                >
                                    {isEditing ? 'Guardar Cambios' : 'Modo Edición'}
                                </button>
                            )}

                            <button
                                onClick={handleSettingsClick}
                                className={`${secondaryBg} rounded-full p-2 sm:p-3 hover:opacity-80 transition duration-300 transform hover:scale-105 ml-4 mt-2`}
                                title="Configuración"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${getHighlightTextColor()} sm:w-6 sm:h-6`}>
                                    <circle cx="12" cy="12" r="3" />
                                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82A1.65 1.65 0 0 0 3 13H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sección de páginas */}
                <div className="py-4 sm:py-6">
                    <div className="flex items-center mb-4">
                        <h2 className={`${textColor} text-sm sm:text-base lg:text-lg pb-2 mr-4 whitespace-nowrap font-medium`}>
                            Páginas
                        </h2>
                        <div className="flex-grow">
                            <hr className={`border-t ${textColor === 'text-white' ? 'border-gray-600' : 'border-gray-400'}`} />
                        </div>
                    </div>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCorners}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragCancel={handleDragCancel}
                    >
                        <SortableContext
                            items={pages.map(page => page._id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="space-y-3 sm:space-y-4">
                                {pages && pages.length > 0 ? (
                                    pages.map(page => (
                                        <SortablePageItem
                                            key={page._id}
                                            page={page}
                                            canEditProject={canEditProject && isEditing}
                                            handlePageEdit={handlePageEdit}
                                            handlePageDelete={handlePageDelete}
                                            projectId={id}
                                            isEditing={isEditing}
                                            bgColor={bgColor}
                                            textColor={textColor}
                                            secondaryBg={secondaryBg}
                                            getHighlightTextColor={getHighlightTextColor}
                                        />
                                    ))
                                ) : (
                                    <p className={`${textColor} text-center text-sm sm:text-base py-8`}>
                                        Este proyecto aún no tiene páginas.
                                    </p>
                                )}
                            </div>
                        </SortableContext>

                        <DragOverlay>
                            {activePage ? (
                                <SortablePageItem
                                    page={activePage}
                                    canEditProject={false}
                                    handlePageEdit={() => {}}
                                    handlePageDelete={() => {}}
                                    projectId={id}
                                    isEditing={isEditing}
                                    bgColor={bgColor}
                                    textColor={textColor}
                                    secondaryBg={secondaryBg}
                                    getHighlightTextColor={getHighlightTextColor}
                                    style={{ opacity: 0.8, boxShadow: '0 8px 16px rgba(0,0,0,0.2)' }}
                                />
                            ) : null}
                        </DragOverlay>
                    </DndContext>

                    {/* Botón para agregar nueva página */}
                    {isOwner && isEditing && (
                        <button
                            onClick={handleNewPageClick}
                            className={`${getBgColor()} rounded-full p-3 sm:p-4 flex items-center justify-center transition-all duration-300 hover:opacity-80 hover:scale-105 mx-auto mt-6`}
                            title="Agregar nueva página"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className={`${theme === 'light' ? 'text-white' : "text-black"} sm:w-6 sm:h-6`}>
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Botones de administración del proyecto - Layout adaptativo */}
                {isOwner && isEditing && (
                    <div className="mt-8 sm:mt-12 lg:mt-20">
                        {/* Layout móvil/tablet */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:hidden">
                            <button
                                onClick={handleInviteClick}
                                className={`
                                    ${getBgColor()}
                                    rounded-full
                                    px-6 py-3
                                    sm:px-8 sm:py-4
                                    font-medium
                                    text-sm sm:text-base
                                    hover:opacity-80
                                    transition
                                    duration-300
                                    transform
                                    hover:scale-105
                                    ${theme === 'light' ? 'text-white' : "text-black"}
                                    flex items-center justify-center gap-2
                                `.trim()}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" className="sm:w-5 sm:h-5">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                                Invitar colaboradores
                            </button>

                            <button
                                onClick={handleDeleteProjectClick}
                                className="bg-red-600 text-white rounded-full px-6 py-3 sm:px-8 sm:py-4 font-medium text-sm sm:text-base hover:bg-red-700 transition duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                                title="Eliminar proyecto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor"
                                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-5 sm:h-5">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                                Eliminar proyecto
                            </button>
                        </div>

                        {/* Layout desktop (original) */}
                        <div className="hidden lg:block">
                            <div className="p-6 sm:p-8 flex justify-start space-x-4">
                                <button
                                    onClick={handleInviteClick}
                                    className={`
                                        ${getBgColor()}
                                        rounded-full
                                        px-6
                                        py-3
                                        font-medium
                                        hover:opacity-80
                                        transition
                                        duration-300
                                        transform
                                        hover:scale-105
                                        ${theme === 'light' ? 'text-white' : "text-black"}
                                    `.trim()}
                                >
                                    Invitar a alguien
                                </button>

                                <button
                                    onClick={handleDeleteProjectClick}
                                    className="bg-red-600 text-white rounded-full p-3 font-medium hover:bg-red-700 transition duration-300 transform hover:scale-105"
                                    title="Eliminar proyecto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor"
                                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        <line x1="10" y1="11" x2="10" y2="17" />
                                        <line x1="14" y1="11" x2="14" y2="17" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Logo footer */}
                <div className="flex justify-center py-6 sm:py-8 mt-8">
                    <img
                        src={theme === 'dark' ? "/imagenes/logo/logo_light.png" : "/imagenes/logo/logo_dark.png"}
                        alt="Orgánica Logo"
                        className="h-16 sm:h-20 lg:h-24 object-contain"
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetailPage;