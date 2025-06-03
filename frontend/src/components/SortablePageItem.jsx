import React, { useState, useEffect } from 'react'; // Importa useState y useEffect
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { Link } from 'react-router-dom';

export const SortablePageItem = ({ page, canEditProject, handlePageEdit, handlePageDelete, projectId, textColor, secondaryBg }) => { // Added textColor, secondaryBg props

    const [editedTitle, setEditedTitle] = useState(page.title);
    const [isEditingTitle, setIsEditingTitle] = useState(false);

    useEffect(() => {
        setEditedTitle(page.title);
    }, [page.title]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: page._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: canEditProject ? 'grab' : 'pointer', // Retained for visual cue
    };

    const handleSaveTitle = async () => {
        if (editedTitle.trim() !== page.title) {
            await handlePageEdit(page._id, editedTitle);
        }
        setIsEditingTitle(false);
    };

    const handleTitleClick = (e) => {
        if (canEditProject) {
            e.preventDefault(); // Prevent navigation if in edit mode
            setIsEditingTitle(true);
        }
        // If not canEditProject, the Link will handle navigation
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveTitle();
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="relative group mb-4"
        >
            {/* Contenedor de la tarjeta - adapted to theme colors */}
            <div className={`flex items-center justify-between ${secondaryBg} border ${textColor === 'text-white' ? 'border-white/10' : 'border-gray-300'} p-4 rounded-lg transition-colors duration-200 hover:${textColor === 'text-white' ? 'bg-white/10 border-white/20' : 'bg-gray-100 border-gray-400'} hover:shadow-lg hover:shadow-black/20`}>

                {/* Título o input de edición */}
                {isEditingTitle && canEditProject ? (
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onBlur={handleSaveTitle}
                        onKeyDown={handleKeyDown}
                        // Input styling based on theme
                        className={`flex-grow text-lg ${textColor} bg-transparent rounded-md py-1 px-2 focus:outline-none focus:ring-2 ${textColor === 'text-white' ? 'focus:ring-gray-400' : 'focus:ring-gray-500'}`}
                        autoFocus
                    />
                ) : (
                    <Link
                        to={`/project/${projectId}/page/${page._id}`}
                        onClick={handleTitleClick} // This will prevent navigation if canEditProject is true
                        className={`flex-grow text-lg ${textColor} hover:${textColor === 'text-white' ? 'text-gray-300' : 'text-gray-600'} transition duration-200 cursor-pointer focus:outline-none focus:ring-2 ${textColor === 'text-white' ? 'focus:ring-white/50' : 'focus:ring-gray-300'} rounded-md py-1 px-2`}
                    >
                        {page.title}
                    </Link>
                )}
            </div>

            {/* Botones flotantes - Adjusted for mobile, using flex-col for stacking */}
            {canEditProject && (
                // On mobile, buttons are always visible at top-right. On larger screens, they appear on hover.
                // Using 'top-2 right-2' and 'gap-1' for tighter spacing.
                <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform md:translate-y-1 md:group-hover:translate-y-0 z-20">
                    {/* Botón de arrastrar - smaller size for mobile */}
                    <button
                        {...listeners}
                        // Reduced size to w-8 h-8 for better mobile fit
                        className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group/drag"
                        title="Arrastrar página"
                    >
                        <svg className="w-4 h-4 group-hover/drag:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                        </svg>
                    </button>

                    {/* Botón de eliminar - smaller size for mobile */}
                    <button
                        onClick={() => handlePageDelete(page._id)}
                        // Reduced size to w-8 h-8 for better mobile fit
                        className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group/delete"
                        title="Eliminar página"
                    >
                        <svg className="w-4 h-4 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            )}
            {/* Drag handle line on the left side - consistent with blocks */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${textColor === 'text-white' ? 'bg-gray-500' : 'bg-gray-400'} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-2 hidden md:block`}></div>
        </div>
    );
};