import 'react-quill-new/dist/quill.snow.css';
import { RouterProvider } from "react-router-dom"
import { router } from "./router"
import { Toaster } from "sonner"
import { AuthProvider } from "./contexts/AuthContext"
import { ProjectAccessProvider } from './contexts/ProjectAccessContext';
import { ThemeProvider } from './contexts/ThemeContext';

const App = () => {
  return (
    <>
      <AuthProvider>
        <ThemeProvider>
          <ProjectAccessProvider>
            <Toaster position="bottom-right" duration={2000} />
            <RouterProvider router={router}/>
          </ProjectAccessProvider>
        </ThemeProvider>
      </AuthProvider>
    </>
  )
}

export default App