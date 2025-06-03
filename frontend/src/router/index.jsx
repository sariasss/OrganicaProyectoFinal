import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import HomePage from "../pages/HomePage";
import ConfigPage from "../pages/ConfigPage";
import RootLayout from "../layouts/RootLayout";
import ErrorPage from "../pages/ErrorPage";
import LandingPage from "../pages/LandingPage";
import ProtectedRoute from "../components/ProtectedRoute";
import NewProjectPage from "../pages/NewProjectPage";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import NewPage from "../pages/NewPage";
import ContentPage from "../pages/ContentPage";
import PermissionsPage from "../pages/PermissionsPage";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index:true,
        element:<Navigate to="landing" replace />,
      },
      {
        path:"login",
        element: <LoginPage />
      },
      {
        path:"register",
        element: <RegisterPage />
      },
      {
        path: "landing",
        element: <LandingPage />
      },
      {
        path: "home",
        element: (
            <ProtectedRoute >
                <HomePage />
            </ProtectedRoute>
        )
      },
      {
        path: "config",
        element: (
          <ProtectedRoute>
            <ConfigPage />
          </ProtectedRoute>
        )
      },
      {
        path: "newProject",
        element: (
          <ProtectedRoute>
            <NewProjectPage />
          </ProtectedRoute>
        )
      },
      {
        path: "project/:id",
        element: (
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        )
      },
      {
        path: "newPage/:id",
        element: (
          <ProtectedRoute>
            <NewPage />
          </ProtectedRoute>
        )
      },
      {
        path: "project/:projectId/page/:pageId",
        element: (
          <ProtectedRoute>
            <ContentPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "permissions/:projectId",
        element: (
          <ProtectedRoute>
            <PermissionsPage />
          </ProtectedRoute>
        ),
      },
    ]
  }
]);