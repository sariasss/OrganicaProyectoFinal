import { useNavigate } from "react-router-dom";

const VITE_BASE_URL_IMAGE = import.meta.env.VITE_BASE_URL_IMAGE || 'http://localhost:3000';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const defaultImageUrl = "/imagenes/default-cover.jpg";

  const imageUrl = project.coverImage
    ? `${VITE_BASE_URL_IMAGE}/uploads/img/${project.coverImage}`
    : defaultImageUrl;

    console.log(project.coverImage);

  const handleCardClick = () => {
    navigate(`/project/${project._id}`);
  };

  return (

    <div
      onClick={handleCardClick}
      className="bg-primary-light rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-105
                 aspect-[3/2] flex flex-col"
    >
      <div className="relative w-full h-2/3">
        <img
          src={imageUrl}
          alt={project.title}
          className="object-cover w-full h-full rounded-t-lg"
        />
      </div>

      <div className="px-6 py-3 flex-grow">
        <h3 className="font-bold text-sm sm:text-base line-clamp-2 text-black">{project.title}</h3>
      </div>
    </div>
  );
};

export default ProjectCard;