import React, { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ReactQuill, { Quill } from 'react-quill-new';
import { useTheme } from '../contexts/ThemeContext'; // Agregar esta importación

import 'react-quill-new/dist/quill.snow.css';

const Video = Quill.import('formats/video');

class CustomVideo extends Video {
    static blotName = 'video';
    static tagName = 'video';

    static create(value) {
        const node = super.create(value);
        node.setAttribute('src', value);
        node.setAttribute('controls', 'controls');
        node.setAttribute('playsinline', true);
        node.setAttribute('preload', 'auto');
        node.setAttribute('style', 'width: 100%; height: auto; max-width: 100%;');
        return node;
    }

    static formats(node) {
        let formats = {};
        if (node.hasAttribute('height')) {
            formats.height = node.getAttribute('height');
        }
        if (node.hasAttribute('width')) {
            formats.width = node.getAttribute('width');
        }
        if (node.hasAttribute('class')) {
            formats.class = node.getAttribute('class');
        }
        return formats;
    }

    format(name, value) {
        if (['height', 'width', 'class'].indexOf(name) > -1) {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}
Quill.register(CustomVideo);

let Scroll = Quill.import('blots/scroll');
class NoDragScroll extends Scroll {
    handleDragStart(e) {
        e.preventDefault();
        e.stopPropagation();
    }
}
Quill.register('blots/scroll', NoDragScroll, true);

const VITE_BASE_URL_IMAGE = import.meta.env.VITE_BASE_URL_IMAGE || 'http://localhost:3000';

export const SortableBlockItem = ({
    block,
    canEditPage,
    handleBlockUpdate,
    handleBlockDelete,
    isNewBlock = false,
    textColor,
    secondaryBg,
}) => {
    const { theme } = useTheme(); // Agregar esta línea
    const isEditable = canEditPage;

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: block._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const formats = [
        'header', 'font', 'size',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'script',
        'blockquote', 'code-block',
        'list', 'indent',
        'direction', 'align',
        'link', 'image', 'video'
    ];

    const quillRef = useRef();
    const [editedContent, setEditedContent] = useState(block.content || '');
    const [isEditingBlockContent, setIsEditingBlockContent] = useState(isNewBlock || (!block.content || block.content.trim() === ''));

    useEffect(() => {
        if (block.content !== editedContent) {
            setEditedContent(block.content || '');
        }
    }, [block.content]);

    useEffect(() => {
        if (isEditingBlockContent && quillRef.current) {
            setTimeout(() => {
                quillRef.current.getEditor().focus();
                
                // Aplicar estilos para modo oscuro
                if (theme === 'dark') {
                    const toolbar = quillRef.current.getEditor().container.previousSibling;
                    if (toolbar) {
                        const buttons = toolbar.querySelectorAll('button');
                        const pickerLabels = toolbar.querySelectorAll('.ql-picker-label');
                        
                        buttons.forEach(btn => {
                            btn.style.color = '#ffffff';
                        });
                        
                        pickerLabels.forEach(label => {
                            label.style.color = '#ffffff';
                        });
                    }
                }
            }, 100);
        }
    }, [isEditingBlockContent, theme]);

    const handleTextChange = (value) => setEditedContent(value);

    const handleSaveTextBlock = () => {
        handleBlockUpdate(block._id, block.type, editedContent, block.order);
        setIsEditingBlockContent(false);
    };

    const handleCancelTextBlock = () => {
        setEditedContent(block.content || '');
        setIsEditingBlockContent(false);
    };

    const modules = {
        toolbar: {
            container: [
                [{ font: [] }],
                [{ size: ['small', false, 'large', 'huge'] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ color: [] }, { background: [] }],
                [{ script: 'sub' }, { script: 'super' }],
                ['blockquote', 'code-block'],
                [{ list: 'ordered' }],
                [{ indent: '-1' }, { indent: '+1' }],
                [{ direction: 'rtl' }],
                [{ align: [] }],
                ['link', 'image', 'video'],
                ['clean']
            ],
            handlers: {
                video: () => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'video/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files[0];
                        const formData = new FormData();
                        formData.append('file', file);

                        try {
                            const res = await fetch(`${VITE_BASE_URL_IMAGE}/blocks/upload-media`, {
                                method: 'POST',
                                credentials: 'include',
                                body: formData
                            });

                            if (!res.ok) {
                                const errorText = await res.text();
                                console.error("Error al subir el video:", res.status, res.statusText, errorText);
                                alert("Error al subir el video.");
                                return;
                            }

                            const data = await res.json();
                            console.log("Respuesta de la API para video:", data);

                            if (data.filename) {
                                const videoUrl = `${VITE_BASE_URL_IMAGE}/uploads/content_media/${data.filename}`;
                                console.log("URL del video generada:", videoUrl);

                                const range = quillRef.current.getEditor().getSelection();
                                if (range) {
                                    quillRef.current.getEditor().insertEmbed(range.index, 'video', videoUrl);
                                } else {
                                    quillRef.current.getEditor().insertEmbed(quillRef.current.getEditor().getLength(), 'video', videoUrl);
                                }

                            } else {
                                console.error("La respuesta de la API para video no contiene 'filename':", data);
                                alert("La subida de video fue exitosa pero no se recibió el nombre del archivo.");
                            }

                        } catch (error) {
                            console.error("Error en la subida de video o en la red:", error);
                            alert("Hubo un problema de conexión al subir el video.");
                        }
                    };
                },
                image: () => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.click();

                    input.onchange = async () => {
                        const file = input.files[0];
                        const formData = new FormData();
                        formData.append('file', file);
                        try {
                            const res = await fetch(`${VITE_BASE_URL_IMAGE}/blocks/upload-media`, {
                                method: 'POST',
                                credentials: 'include',
                                body: formData
                            });
                            if (!res.ok) {
                                const errorText = await res.text();
                                console.error("Error al subir la imagen:", res.status, res.statusText, errorText);
                                alert("Error al subir la imagen.");
                                return;
                            }
                            const data = await res.json();
                            const range = quillRef.current.getEditor().getSelection();
                            if (range) {
                                quillRef.current.getEditor().insertEmbed(range.index, 'image', `${VITE_BASE_URL_IMAGE}/uploads/content_media/${data.filename}`);
                            } else {
                                quillRef.current.getEditor().insertEmbed(quillRef.current.getEditor().getLength(), 'image', `${VITE_BASE_URL_IMAGE}/uploads/content_media/${data.filename}`);
                            }
                        } catch (error) {
                            console.error("Error en la subida de imagen o en la red:", error);
                            alert("Hubo un problema de conexión al subir la imagen.");
                        }
                    };
                }
            }
        },
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className="relative group mb-4"
        >
            <div className={`${secondaryBg} ${textColor} rounded-xl p-4 sm:p-6 transition-all duration-300 hover:${textColor === 'text-white' ? 'bg-white/10 border-white/20' : 'bg-gray-100 border-gray-400'} hover:shadow-lg hover:shadow-black/20`}>

                {isEditable && (
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-all duration-300 transform md:translate-y-1 md:group-hover:translate-y-0 z-20">

                        <button
                            {...listeners}
                            className="w-8 h-8 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group/drag"
                            title="Arrastrar bloque"
                        >
                            <svg className="w-4 h-4 group-hover/drag:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                            </svg>
                        </button>

                        {block.type === 'text' && !isEditingBlockContent && (
                            <button
                                onClick={() => setIsEditingBlockContent(true)}
                                className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group/edit"
                                title="Editar contenido"
                            >
                                <svg className="w-4 h-4 group-hover/edit:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                        )}

                        <button
                            onClick={() => handleBlockDelete(block._id)}
                            className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group/delete"
                            title="Eliminar bloque"
                        >
                            <svg className="w-4 h-4 group-hover/delete:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                )}

                {block.type === 'text' && (
                    <div className="min-h-[60px] w-full">
                        {isEditable && isEditingBlockContent ? (
                            <div className="space-y-4">
                                <div className={`rounded-lg overflow-hidden border-2 ${textColor === 'text-white' ? 'border-gray-600' : 'border-gray-400'} shadow-lg ${textColor === 'text-white' ? 'shadow-gray-500/20' : 'shadow-gray-300/50'}`}>
                                    <div style={theme === 'dark' ? {
                                        '--quill-toolbar-button-color': '#ffffff',
                                        '--quill-toolbar-picker-color': '#ffffff'
                                    } : {}}>
                                        <ReactQuill
                                            ref={quillRef}
                                            theme="snow"
                                            value={editedContent}
                                            onChange={handleTextChange}
                                            modules={modules}
                                            formats={formats}
                                            className={`quill-custom-theme ${theme === 'dark' ? 'quill-dark-theme' : 'quill-light-theme'}`}
                                            placeholder="Escribe tu contenido aquí..."
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={handleCancelTextBlock}
                                        className="bg-pink-300 text-black rounded-full px-4 py-1 text-sm sm:px-6 sm:py-2 hover:bg-pink-500 transition-colors duration-200 font-medium shadow-md"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveTextBlock}
                                        className="bg-green-300 text-black rounded-full px-4 py-1 text-sm sm:px-6 sm:py-2 hover:bg-green-500 transition-colors duration-200 font-medium shadow-md"
                                    >
                                        Guardar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={`ql-editor max-w-none prose ${textColor} ${textColor === 'text-white' ? 'prose-invert' : 'prose-base'} [&_blockquote]:border-l-4 ${textColor === 'text-white' ? '[&_blockquote]:border-gray-400 [&_blockquote]:bg-white/5' : '[&_blockquote]:border-gray-600 [&_blockquote]:bg-gray-100'} [&_pre]:${textColor === 'text-white' ? 'bg-black/30' : 'bg-gray-200'} [&_pre]:rounded-lg [&_pre]:border ${textColor === 'text-white' ? '[&_pre]:border-white/10' : '[&_pre]:border-gray-400'} min-h-[40px] cursor-text`}
                                dangerouslySetInnerHTML={{ __html: block.content || `<p class="${textColor.replace('text-', 'text-')}/50 italic">Haz clic para empezar a escribir...</p>` }}
                                onClick={() => isEditable && setIsEditingBlockContent(true)}
                            />
                        )}
                    </div>
                )}
            </div>

            <div className={`absolute left-0 top-0 bottom-0 w-1 ${textColor === 'text-white' ? 'bg-gray-500' : 'bg-gray-400'} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-2 hidden md:block`}></div>
        </div>
    );
};