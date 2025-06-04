import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    creationDate: { type: Date, default: Date.now},
    order: { type: Number, required: true },
    // AÑADIR LOS CAMPOS DE BLOQUEO AQUÍ si aún no los tienes
    isEditing: {
        type: Boolean,
        default: false
    },
    editingUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Asegúrate de que 'User' es el nombre correcto de tu modelo de usuario
        default: null
    },
    editingStartedAt: {
        type: Date,
        default: null
    }
});

// **LA LÍNEA CLAVE PARA EVITAR EL ERROR DE SOBREESCRITURA:**
// Exporta el modelo. Si 'Page' ya ha sido compilado, lo reutiliza. Si no, lo compila por primera vez.
export default mongoose.models.Page || mongoose.model("Page", pageSchema);