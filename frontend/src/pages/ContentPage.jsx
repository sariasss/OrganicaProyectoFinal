import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPageById, updatePage, deletePage } from '../services/pageService';
import { createBlock, updateBlock, deleteBlock } from '../services/contentService';
import { useAuth } from '../contexts/AuthContext'; // Asegúrate de la ruta correcta si es AuthContext
import { useTheme } from '../contexts/ThemeContext'; // Importa useTheme

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableBlockItem } from '../components/SortableBlockItem';
import { getProjectById } from '../services/projectService';

const VITE_BASE_URL_IMAGE = import.meta.env.VITE_BASE_URL_IMAGE || 'http://localhost:3000';

const ContentPage = () => {
    const { projectId, pageId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    // **INTEGRACIÓN DEL TEMA:** Importar las funciones y valores necesarios de useTheme
    const { getHighlightTextColor, getBaseColors } = useTheme();
    const { bgColor, textColor, secondaryBg } = getBaseColors(); // Obtener los colores del tema actual

    const [page, setPage] = useState(null);
    const [project, setProject] = useState(null);
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditingPage, setIsEditingPage] = useState(false);
    const [editedPageTitle, setEditedPageTitle] = useState('');

    const handleGoBack = () => navigate("/project/" + projectId);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const canEditPage = page && project && (
        String(project?.userId) === String(user._id) ||
        (project.permissions && project.permissions.some(p => String(p.userId) === String(user._id) && (p.rol === 'owner' || p.rol === 'editor')))
    );

    const isPageOwner = page && project && (
        String(project?.userId) === String(user._id) ||
        (project.permissions && project.permissions.some(p => String(p.userId) === String(user._id) && p.rol === 'owner'))
    );

    useEffect(() => {
        const fetchPageDetails = async () => {
            try {
                setLoading(true);

                const data = await getPageById(pageId);
                setPage(data.page);

                const dataProject = await getProjectById(projectId);
                setProject(dataProject.project);

                setEditedPageTitle(data.page.title);
                setBlocks(data.blocks ? data.blocks.sort((a, b) => a.order - b.order) : []);
            } catch (err) {
                console.error("Error al obtener los detalles de la página:", err);
                setError("No se pudo cargar la página. Por favor, inténtalo de nuevo.");
            } finally {
                setLoading(false);
            }
        };

        if (pageId && user?._id) {
            fetchPageDetails();
        }
    }, [pageId, projectId, user?._id]);

    const handlePageUpdate = async () => {
        try {
            await updatePage(pageId, { title: editedPageTitle });
            setPage(prevPage => ({ ...prevPage, title: editedPageTitle }));
            setIsEditingPage(false);
        } catch (err) {
            console.error("Error al actualizar la página:", err);
            setError("Error al actualizar el título de la página.");
        }
    };

    const handlePageDelete = async () => {
        if (!isPageOwner) {
            alert("No tienes permisos para eliminar esta página.");
            return;
        }
        if (window.confirm("¿Estás seguro de que quieres eliminar esta página y todo su contenido?")) {
            try {
                await deletePage(pageId);
                navigate(`/project/${projectId}`);
            } catch (err) {
                console.error("Error al eliminar la página:", err);
                setError("Error al eliminar la página.");
            }
        }
    };

    const handleAddBlock = async (type) => {
        try {
            const order = blocks.length;
            const response = await createBlock(pageId, type, '', order);
            setBlocks(prevBlocks => [...prevBlocks, response.block].sort((a, b) => a.order - b.order));
        } catch (err) {
            console.error(`Error al crear bloque de tipo ${type}:`, err);
            setError(`Error al crear bloque de tipo ${type}.`);
        }
    };

    const handleBlockUpdate = async (blockId, type, content, order) => {
        try {
            let dataToSend;
            if (type === 'image' && content instanceof File) {
                const formData = new FormData();
                formData.append('content', content);
                formData.append('type', type);
                formData.append('order', order);
                dataToSend = formData;
            } else {
                dataToSend = { content, order };
            }
            await updateBlock(blockId, dataToSend);

            setBlocks(prevBlocks =>
                prevBlocks.map(block => {
                    if (block._id === blockId) {
                        const updatedContent = (type === 'image' && content instanceof File)
                            ? block.content
                            : content;
                        return { ...block, content: updatedContent, order: order };
                    }
                    return block;
                }).sort((a, b) => a.order - b.order)
            );
        } catch (err) {
            console.error(`Error al actualizar bloque ${blockId}:`, err);
            setError(`Error al actualizar bloque ${blockId}.`);
        }
    };

    const handleBlockDelete = async (blockId) => {
        if (window.confirm("¿Estás seguro de que quieres eliminar este bloque?")) {
            try {
                await deleteBlock(blockId);
                setBlocks(prevBlocks => {
                    const filteredBlocks = prevBlocks.filter(block => block._id !== blockId);
                    return filteredBlocks.map((block, index) => ({ ...block, order: index }));
                });
            } catch (err) {
                console.error(`Error al eliminar bloque ${blockId}:`, err);
                setError(`Error al eliminar bloque ${blockId}.`);
            }
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (!active || !over || active.id === over.id) {
            return;
        }

        setBlocks((prevBlocks) => {
            const oldIndex = prevBlocks.findIndex(block => block._id === active.id);
            const newIndex = prevBlocks.findIndex(block => block._id === over.id);

            if (oldIndex === -1 || newIndex === -1) {
                console.error("No se pudo encontrar el bloque arrastrado o el bloque de destino.");
                return prevBlocks;
            }

            const newOrderedBlocks = arrayMove(prevBlocks, oldIndex, newIndex);

            const updatePromises = newOrderedBlocks.map(async (block, index) => {
                if (block.order !== index) {
                    try {
                        await updateBlock(block._id, { order: index });
                        return { ...block, order: index };
                    } catch (apiError) {
                        console.error(`Error al actualizar el orden del bloque ${block._id}:`, apiError);
                        return block;
                    }
                }
                return block;
            });

            Promise.all(updatePromises).then(finalBlocks => {
                setBlocks(finalBlocks.sort((a, b) => a.order - b.order));
            }).catch(error => {
                console.error("Error en alguna de las actualizaciones de orden:", error);
            });

            return newOrderedBlocks.map((block, index) => ({ ...block, order: index }));
        });
    };

    if (loading) {
        // Usar los colores del tema aquí también
        return <div className={`min-h-screen ${bgColor} ${textColor} flex justify-center items-center`}>Cargando página...</div>;
    }

    if (error) {
        return <div className={`min-h-screen ${bgColor} ${textColor} flex justify-center items-center text-red-500`}>{error}</div>;
    }

    if (!page) {
        return <div className={`min-h-screen ${bgColor} ${textColor} flex justify-center items-center`}>Página no encontrada o no tienes acceso.</div>;
    }

    return (
        // Aplicar los colores del tema al contenedor principal
        <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col`}>
            {/* Header */}
            <div className={`relative h-35 flex items-center justify-center p-4 sm:p-6 `}> {/* Reduced padding for smaller screens */}
                <button onClick={handleGoBack} className={`p-2 rounded-full ${textColor} absolute top-4 left-4 z-50 transition hover:opacity-80`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>

                <div className="absolute top-4 right-4 flex space-x-2">
                    {canEditPage && (
                        <button
                            onClick={() => {
                                if (isEditingPage) {
                                    handlePageUpdate();
                                }
                                setIsEditingPage(!isEditingPage);
                            }}
                            className={`rounded-full px-3 py-1 text-sm sm:px-4 sm:py-2 font-medium transition duration-300 ${ // Smaller padding/text for mobile
                                isEditingPage
                                    ? `bg-green-500 text-white` // Direct text-white as getHighlightTextColor is for secondaryBg
                                    : `${secondaryBg} ${getHighlightTextColor()} hover:opacity-80`
                            }`}
                        >
                            {isEditingPage ? 'Guardar' : 'Modo Edición'}
                        </button>
                    )}

                    {isPageOwner && (
                        <button
                            onClick={handlePageDelete}
                            className="bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition duration-300"
                            title="Eliminar página"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Page Title */}
            <div className={`relative z-10 text-center ${bgColor}`}>
                {page && (
                    isEditingPage ? (
                        <input
                            type="text"
                            className={`text-3xl sm:text-5xl font-bold ${textColor} mb-4 ${secondaryBg} p-2 rounded-2xl text-center w-11/12 sm:w-auto mx-auto`} // Added w-11/12 and mx-auto for better input width on small screens
                            value={editedPageTitle}
                            onChange={(e) => setEditedPageTitle(e.target.value)}
                        />
                    ) : (
                        <h1 className={`text-3xl sm:text-5xl font-bold ${textColor} mb-4 px-4`}>{page.title}</h1> // Added px-4 for title padding on small screens
                    )
                )}
            </div>

            {/* Content Area */}
            <div className={`flex-grow p-4 sm:px-16 md:px-28 lg:px-36 ${bgColor}`}> {/* Reduced padding for small screens */}
                <hr className={`border-t ${textColor === 'text-white' ? 'border-gray-600' : 'border-gray-400'} mb-6`} />

                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={blocks.map(block => block._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-6">
                            {blocks && blocks.length > 0 ? (
                                blocks.map(block => (
                                    <SortableBlockItem
                                        key={block._id}
                                        block={block}
                                        canEditPage={canEditPage && isEditingPage}
                                        handleBlockUpdate={handleBlockUpdate}
                                        handleBlockDelete={handleBlockDelete}
                                        // Pasar los colores del tema a los bloques para que también los utilicen
                                        bgColor={bgColor}
                                        textColor={textColor}
                                        secondaryBg={secondaryBg}
                                        getHighlightTextColor={getHighlightTextColor}
                                        VITE_BASE_URL_IMAGE={VITE_BASE_URL_IMAGE} // Pasar la URL base para imágenes
                                    />
                                ))
                            ) : (
                                <p className={`${textColor} text-center`}>Esta página aún no tiene contenido.</p>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>

                {canEditPage && isEditingPage && (
                    <div className="flex justify-center mt-8 relative">
                        <button
                            onClick={() => handleAddBlock('text')}
                            className={`${getHighlightTextColor()} ${secondaryBg} rounded-full p-3 flex items-center justify-center transition-all duration-300 hover:opacity-80 hover:scale-105`}
                            title="Añadir nuevo bloque"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                className={`${getHighlightTextColor()}`}>
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentPage;