import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createData } from '../scripts/script.js'; // asegúrate de usar la extensión .js si usas ES Modules

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`🟢 MongoDB Conectado: ${conn.connection.host}`);

        if (process.env.RUN_SEED === 'true') {
            console.log("🚨 Ejecutando script de seeding...");
            await createData();
            console.log("✅ Seeding completo.");
        }

    } catch (error) {
        console.error(`❌ Error conectando a MongoDB: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;
