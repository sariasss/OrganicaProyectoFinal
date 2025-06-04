import mongoose from 'mongoose';
import dotenv from 'dotenv';
import createData from '../scripts/script.js'; // Asegúrate de que la ruta sea correcta

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        if (process.env.RUN_SEED === 'true') {
            await createData();
            console.log("✅ Datos insertados correctamente.");
        }

    } catch (error) {
        console.error(`❌ Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
