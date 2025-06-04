// src/pages/HomePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProjectCard from "../components/ProjectCard";
import { getProjects, getProjectById } from "../services/projectService";
import { useAuth } from "../contexts/AuthContext";
import {
  getUserInvitationsApi,
  acceptInvitationApi,
  rejectInvitationApi
} from "../services/accessService";
import { getUser } from "../services/userService";
import { useTheme } from "../contexts/ThemeContext";

const HomePage = () => {
  const [projects, setProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [invitationsWithNames, setInvitationsWithNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const {
    getHighlightTextColor,
    getBgColor,
    getBaseColors,
    theme
  } = useTheme();

  const { bgColor, textColor, secondaryBg } = getBaseColors();

  useEffect(() => {
    const fetchProjectsAndInvitations = async () => {
      try {
        const data = await getProjects();
        const allFetchedProjects = data.projects || [];

        const currentUserId = user?._id ? String(user._id) : null;

        const ownedProjects = allFetchedProjects.filter(project =>
          String(project.userId) === currentUserId
        );
        setProjects(ownedProjects);

        const collaborativeProjects = allFetchedProjects.filter(project =>
          String(project.userId) !== currentUserId
        );
        setSharedProjects(collaborativeProjects);

        if (user?.email) {
          const invites = await getUserInvitationsApi(user.email);
          setInvitations(invites);

          const invitesWithNames = await Promise.all(
            invites.map(async (invite) => {
              try {
                const projectData = await getProjectById(invite.projectId);

                let inviterName = "Usuario desconocido";
                if (invite.inviter) {
                  try {
                    const userData = await getUser(invite.inviter._id || invite.inviter);
                    if (userData?.username) {
                      inviterName = userData.username;
                    }
                  } catch (e) {
                    console.error(
                      `Error al obtener datos de usuario para el invitado ${invite.inviter}:`,
                      e
                    );
                  }
                }

                return {
                  ...invite,
                  projectName:
                    projectData.title ||
                    projectData.project?.title ||
                    projectData.name ||
                    invite.projectId,
                  inviterName,
                };
              } catch (error) {
                console.error(
                  `Error obteniendo datos de invitación para ${invite._id}:`,
                  error
                );
                return {
                  ...invite,
                  projectName: invite.projectId,
                  inviterName: "Usuario desconocido",
                };
              }
            })
          );

          setInvitationsWithNames(invitesWithNames);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectsAndInvitations();
  }, [user?._id, user?.email]);

  const handleSettingsClick = () => {
    navigate("/config");
  };

  const handleNewProjectClick = () => {
    navigate("/newProject");
  };

  const handleAccept = async (invitation) => {
    try {
      await acceptInvitationApi(invitation);
      setInvitations((prev) => prev.filter((i) => i._id !== invitation._id));
      setInvitationsWithNames((prev) => prev.filter((i) => i._id !== invitation._id));

      const data = await getProjects();
      const allUpdatedProjects = data.projects || [];
      const currentUserId = user?._id ? String(user._id) : null;

      const ownedProjects = allUpdatedProjects.filter(project =>
        String(project.userId) === currentUserId
      );
      setProjects(ownedProjects);

      const collaborativeProjects = allUpdatedProjects.filter(project =>
        String(project.userId) !== currentUserId
      );
      setSharedProjects(collaborativeProjects);

    } catch (err) {
      console.error("Error al aceptar la invitación:", err);
    }
  };

  const handleReject = async (invitationId) => {
    try {
      await rejectInvitationApi(invitationId);
      setInvitations((prev) => prev.filter((i) => i._id !== invitationId));
      setInvitationsWithNames((prev) => prev.filter((i) => i._id !== invitationId));
    } catch (err) {
      console.error("Error al rechazar la invitación:", err);
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#212121] text-white">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
        </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} py-4 px-4 sm:py-6 sm:px-6 md:px-8 lg:px-16 xl:px-24`}>
      <div className="flex justify-between items-center mb-6">
        <div className="w-10 sm:w-12"></div>

        <h1 className="text-xl sm:text-2xl font-medium text-center flex-grow">
          Hola de nuevo, <span className={`${getHighlightTextColor()}`}>
            {user?.username ? String(user.username) : 'Invitado'}
          </span>
        </h1>

        <div className="flex justify-end">
          <button
            onClick={handleSettingsClick}
            className={`${secondaryBg} rounded-full p-2 sm:p-3 hover:opacity-80 transition duration-300 transform hover:scale-105`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${getHighlightTextColor()} sm:w-6 sm:h-6`}>
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l-.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-6 sm:mb-8">
        <img src={theme === 'dark' ? "/imagenes/logo/logo_light.png" : "/imagenes/logo/logo_dark.png"} alt="Logo de la aplicación" className="w-32 sm:w-40" />
      </div>

      {/* Invitaciones Pendientes */}
      {invitationsWithNames.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg sm:text-xl pb-2 mr-2 sm:mr-4 whitespace-nowrap">Invitaciones pendientes</h2>
            <div className="flex-grow">
              <hr className={`${textColor}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {invitationsWithNames.map(invite => (
              <div key={invite._id} className={`${secondaryBg} p-3 rounded-lg border-secondary-dark transition-all duration-300`}>
                <div className="space-y-2">
                  <div>
                    <p className={`${getHighlightTextColor()} font-medium text-sm truncate`}>
                      {invite.projectName ? String(invite.projectName) : 'Proyecto sin nombre'}
                    </p>
                    <p className={`${textColor} text-xs`}>
                      Rol: <span className={`${getHighlightTextColor()}`}>{invite.rol ? String(invite.rol) : 'Sin rol'}</span>
                    </p>
                    <p className={`text-gray-400 text-xs`}>
                      Invitado por: <span className={`${textColor}`}>{invite.inviterName ? String(invite.inviterName) : 'Usuario desconocido'}</span>
                    </p>
                  </div>

                  <div className="flex space-x-2 pt-1">
                    <button
                      onClick={() => handleAccept(invite)}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-300 flex-1"
                    >
                      Aceptar
                    </button>
                    <button
                      onClick={() => handleReject(invite._id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors duration-300 flex-1"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tus Proyectos */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <h2 className="text-lg sm:text-xl pb-2 mr-2 sm:mr-4 whitespace-nowrap">Tus proyectos</h2>
          <div className="flex-grow">
            <hr className={`${textColor}`} />
          </div>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Botón para crear nuevo proyecto - CORREGIDO: eliminado el parámetro true */}
          <div
            onClick={handleNewProjectClick}
            className={`${getBgColor()} rounded-lg aspect-[3/2] flex items-center justify-center cursor-pointer transition-all duration-300 hover:opacity-80 hover:scale-105`}
          >
            <div className="flex flex-col items-center">
              <div className={`${secondaryBg} rounded-full p-2 mb-2`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${getHighlightTextColor()}`}>
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
            </div>
          </div>

          {/* Renderiza los proyectos que posees */}
          {projects.map((project) => {
            if (!project || typeof project !== 'object') {
              console.warn('Proyecto inválido encontrado en "Tus proyectos":', project);
              return null;
            }
            return (
              <ProjectCard key={project._id || Math.random()} project={project} />
            );
          })}
        </div>
      </div>

      {/* Compartidos Conmigo */}
      {sharedProjects.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <h2 className="text-lg sm:text-xl pb-2 mr-2 sm:mr-4 whitespace-nowrap">Compartidos conmigo</h2>
            <div className="flex-grow">
              <hr className={`${textColor}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Renderiza los proyectos compartidos contigo */}
            {sharedProjects.map((project) => {
              if (!project || typeof project !== 'object') {
                console.warn('Proyecto compartido inválido encontrado:', project);
                return null;
              }
              return (
                <ProjectCard key={project._id || Math.random()} project={project} />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;