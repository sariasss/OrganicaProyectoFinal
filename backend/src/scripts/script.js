// backend/src/scripts/script.js

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Modelos
import Content from "../models/Content.js";
import Pages from "../models/Pages.js";
import Project from "../models/Project.js";
import User from "../models/User.js"; // Asegúrate de que tu modelo User tiene el campo 'avatar'
import Permission from "../models/Permission.js";
import Invitation from "../models/Invitation.js";

const createData = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/organica_db';
        
        await mongoose.connect(mongoUrl, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log("🟢 Conectado a MongoDB:", mongoUrl);

        // Limpiar colecciones
        console.log("🧹 Limpiando colecciones existentes...");
        await User.deleteMany({});
        await Project.deleteMany({});
        await Pages.deleteMany({});
        await Content.deleteMany({});
        await Permission.deleteMany({});
        await Invitation.deleteMany({});
        console.log("✅ Colecciones limpiadas exitosamente.");

        // --- Usuario 1: Alice ---
        const alice = new User({
            username: "AliceSmith",
            email: "alice.smith@example.com",
            password: "123456",
            theme: "light",
            highlightColor: "blue",
            avatar: "avatar-base.jpg" // 👈 ASIGNADO AVATAR
        });
        await alice.save();
        console.log(`👤 Usuario creado: ${alice.username} (ID: ${alice._id}) con avatar: ${alice.avatar}`);

        // Proyecto 1 de Alice - Asignando 'fondo.jpg' como coverImage
        const aliceProject1 = new Project({
            userId: alice._id,
            title: "Planificador de Viajes: Aventura por Italia",
            description: "Este proyecto detalla un viaje épico de 15 días por las ciudades más emblemáticas de Italia, incluyendo consejos de presupuesto y actividades diarias.",
            coverImage: "fondo.jpg"
        });
        await aliceProject1.save();
        console.log(`📦 Proyecto creado: ${aliceProject1.title} para ${alice.username} (ID: ${aliceProject1._id}) con cover: ${aliceProject1.coverImage}`);

        // Permiso para Alice como dueña de su proyecto
        await Permission.create({
            projectId: aliceProject1._id,
            userId: alice._id,
            rol: "owner"
        });
        console.log(`🔑 Permiso 'owner' asignado a ${alice.username} para ${aliceProject1.title}`);

        // Páginas de Alice - Proyecto 1 (restante contenido igual)
        const aliceProject1Page1 = new Pages({
            projectId: aliceProject1._id,
            title: "Itinerario Detallado - Roma y Vaticano",
            order: 1
        });
        await aliceProject1Page1.save();
        console.log(`📄 Página creada: ${aliceProject1Page1.title} (ID: ${aliceProject1Page1._id})`);

        await Content.insertMany([
            {
                pageId: aliceProject1Page1._id,
                type: "text",
                content: "<h3><span class=\"ql-size-large\">Día 1: Llegada a Roma y Primer Contacto con la Antigüedad</span></h3><p>Nuestro viaje comienza con la emoción de aterrizar en el Aeropuerto de Fiumicino. Tras el check-in en el hotel cerca del <b>Coliseo</b>, nos sumergiremos de lleno en la historia romana. Por la tarde, una visita guiada al <b>Coliseo</b> y al <b>Foro Romano</b> nos transportará a la época de los gladiadores y emperadores. Terminaremos el día con una deliciosa cena en el Trastevere, disfrutando de auténtica pasta cacio e pepe.</p>",
                order: 1
            },
            {
                pageId: aliceProject1Page1._id,
                type: "text",
                content: "<h3><span class=\"ql-size-large\">Día 2: Esplendor de la Ciudad del Vaticano</span></h3><p>Dedicaremos el día completo a explorar la <b>Ciudad del Vaticano</b>. Por la mañana, los <b>Museos Vaticanos</b> y la Capilla Sixtina nos dejarán sin aliento con las obras de Miguel Ángel. La tarde será para la majestuosa <b>Basílica de San Pedro</b> y la subida a su cúpula para vistas panorámicas de Roma. Recordar vestir adecuadamente para los sitios religiosos.</p>",
                order: 2
            }
        ]);

        const aliceProject1Page2 = new Pages({
            projectId: aliceProject1._id,
            title: "Presupuesto y Gastos Esenciales",
            order: 2
        });
        await aliceProject1Page2.save();
        console.log(`📄 Página creada: ${aliceProject1Page2.title} (ID: ${aliceProject1Page2._id})`);

        await Content.create({
            pageId: aliceProject1Page2._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">Presupuesto y Gastos Esenciales</span></h3><p><b>Transporte Aéreo:</b> $500 (Vuelo ida y vuelta Madrid-Roma)<br><b>Alojamiento (14 noches):</b> $800 (Hostales y B&B con buena ubicación)<br><b>Comida y Bebida:</b> $700 (Estimado, incluyendo cenas en restaurantes locales)<br><b>Entradas y Tours:</b> $350 (Coliseo, Vaticano, Galleria Uffizi, etc.)<br><b>Extras y Souvenirs:</b> $200 (Para imprevistos y caprichos)</p><h3>Total Estimado: $2550 por persona.</h3>",
            order: 1
        });

        const aliceProject1Page3 = new Pages({
            projectId: aliceProject1._id,
            title: "Consejos Prácticos y Documentos",
            order: 3
        });
        await aliceProject1Page3.save();
        console.log(`📄 Página creada: ${aliceProject1Page3.title} (ID: ${aliceProject1Page3._id})`);

        await Content.create({
            pageId: aliceProject1Page3._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">Consejos Prácticos y Documentos</span></h3><p><b>Documentos Necesarios:</b> Pasaporte/DNI, billetes de avión, reservas de hotel, seguro de viaje. ¡Todo en formato digital y copia física!</p><p><b>Moneda:</b> Euro (€). Recomendado llevar algo de efectivo para pequeños gastos.</p><p><b>Idioma:</b> Italiano. Saber algunas frases básicas siempre ayuda.</p><p><b>Adaptador de Corriente:</b> Tipo F (dos clavijas redondas).</p>",
            order: 1
        });


        // --- Usuario 2: Bob ---
        const bob = new User({
            username: "BobJohnson",
            email: "bob.johnson@example.com",
            password: "123456",
            theme: "dark",
            highlightColor: "purple",
            avatar: "avatar-base.jpg" // 👈 ASIGNADO AVATAR
        });
        await bob.save();
        console.log(`👤 Usuario creado: ${bob.username} (ID: ${bob._id}) con avatar: ${bob.avatar}`);

        // Proyecto 1 de Bob - Asignando 'programacion.jpg' como coverImage
        const bobProject1 = new Project({
            userId: bob._id,
            title: "Notas Avanzadas de Desarrollo Web",
            description: "Colección de apuntes y recursos sobre React, Node.js y la arquitectura de microservicios.",
            coverImage: "programacion.jpg"
        });
        await bobProject1.save();
        console.log(`📦 Proyecto creado: ${bobProject1.title} para ${bob.username} (ID: ${bobProject1._id}) con cover: ${bobProject1.coverImage}`);

        // Permiso para Bob como dueño de su proyecto
        await Permission.create({
            projectId: bobProject1._id,
            userId: bob._id,
            rol: "owner"
        });
        console.log(`🔑 Permiso 'owner' asignado a ${bob.username} para ${bobProject1.title}`);


        // Páginas de Bob - Proyecto 1 (restante contenido igual)
        const bobProject1Page1 = new Pages({
            projectId: bobProject1._id,
            title: "Conceptos Fundamentales de React",
            order: 1
        });
        await bobProject1Page1.save();
        console.log(`📄 Página creada: ${bobProject1Page1.title} (ID: ${bobProject1Page1._id})`);

        await Content.insertMany([
            {
                pageId: bobProject1Page1._id,
                type: "text", 
                content: "<h3><span class=\"ql-size-large\">Ejemplo de Componente Funcional</span></h3><p><img src=\"/images/programacion.jpg\" alt=\"Código de programación\" style=\"max-width:100%;\"></p><p>```javascript\n// Ejemplo de Componente Funcional en React\nimport React from 'react';\n\nfunction WelcomeMessage(props) {\n  return <h1>¡Hola, {props.name}!</h1>;\n}\n\nexport default WelcomeMessage;\n```</p>",
                order: 1
            },
            {
                pageId: bobProject1Page1._id,
                type: "text",
                content: "<h3><span class=\"ql-size-large\">Componentes: Funcionales vs. de Clase</span></h3><p>Mientras que los <b>componentes funcionales</b> son más sencillos y se han vuelto el estándar con los Hooks (<code>useState</code>, <code>useEffect</code>), los <b>componentes de clase</b> (más antiguos) requieren extender <code>React.Component</code> y manejar el estado y el ciclo de vida de forma diferente. Hoy en día, se prefiere la simplicidad de los componentes funcionales.</p>",
                order: 2
            }
        ]);

        const bobProject1Page2 = new Pages({
            projectId: bobProject1._id,
            title: "Gestión de Estado con Redux (Conceptos)",
            order: 2
        });
        await bobProject1Page2.save();
        console.log(`📄 Página creada: ${bobProject1Page2.title} (ID: ${bobProject1Page2._id})`);

        await Content.create({
            pageId: bobProject1Page2._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">¿Qué es Redux?</span></h3><p><b>Redux</b> es una librería para la gestión del estado de aplicaciones JavaScript. Su principal ventaja es que proporciona un almacén (store) centralizado e inmutable para todo el estado de la aplicación, facilitando la depuración y la coherencia del estado.</p><p>Los tres principios fundamentales de Redux son: <b>Single Source of Truth</b>, <b>State is Read-Only</b> y <b>Changes are Made with Pure Functions</b> (Reducers).</p>",
            order: 1
        });

        // Proyecto 2 de Bob - Asignando 'carbonara.jpg' como coverImage
        const bobProject2 = new Project({
            userId: bob._id,
            title: "Recetas de Cocina Internacional",
            description: "Mi colección personal de recetas favoritas de diferentes partes del mundo, desde clásicos italianos hasta exóticos platos asiáticos.",
            coverImage: "carbonara.jpg"
        });
        await bobProject2.save();
        console.log(`📦 Proyecto creado: ${bobProject2.title} para ${bob.username} (ID: ${bobProject2._id}) con cover: ${bobProject2.coverImage}`);

        // Permiso para Bob como dueño de su proyecto
        await Permission.create({
            projectId: bobProject2._id,
            userId: bob._id,
            rol: "owner"
        });
        console.log(`🔑 Permiso 'owner' asignado a ${bob.username} para ${bobProject2.title}`);

        // Páginas de Bob - Proyecto 2 (restante contenido igual)
        const bobProject2Page1 = new Pages({
            projectId: bobProject2._id,
            title: "Receta: Pasta Carbonara Auténtica",
            order: 1
        });
        await bobProject2Page1.save();
        console.log(`📄 Página creada: ${bobProject2Page1.title} (ID: ${bobProject2Page1._id})`);

        await Content.create({
            pageId: bobProject2Page1._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">Receta: Pasta Carbonara Auténtica</span></h3><p><img src=\"/images/carbonara.jpg\" alt=\"Pasta Carbonara\" style=\"max-width:100%;\"></p><ul><li>300g de guanciale (o panceta curada)</li><li>300g de pasta (espagueti o rigatoni)</li><li>2 huevos grandes + 1 yema</li><li>80g de Pecorino Romano rallado</li><li>Pimienta negra recién molida</li></ul><h3>Preparación:</h3><p>1. Cortar el guanciale en cubos y dorar en una sartén sin aceite hasta que esté crujiente. Retirar y reservar la grasa.</p><p>2. Cocer la pasta. Mientras, batir los huevos con el Pecorino y la pimienta. Añadir un poco de la grasa del guanciale a la mezcla.</p><p>3. Escurrir la pasta al dente y añadirla directamente a la sartén con el guanciale. Retirar del fuego. Incorporar la mezcla de huevo y Pecorino, revolviendo rápidamente para crear una salsa cremosa sin cocinar el huevo.</p><p>4. Servir inmediatamente con más Pecorino y pimienta.</p>",
            order: 1
        });

        const bobProject2Page2 = new Pages({
            projectId: bobProject2._id,
            title: "Receta: Curry de Garbanzos y Espinacas",
            order: 2
        });
        await bobProject2Page2.save();
        console.log(`📄 Página creada: ${bobProject2Page2.title} (ID: ${bobProject2Page2._id})`);

        await Content.create({
            pageId: bobProject2Page2._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">Receta: Curry de Garbanzos y Espinacas</span></h3><ul><li>1 lata de garbanzos</li><li>200g de espinacas frescas</li><li>1 cebolla, 2 dientes de ajo, jengibre fresco</li><li>Leche de coco, pasta de curry, especias</li></ul><h3>Preparación:</h3><p>Un plato vegano aromático y lleno de sabor, perfecto para una cena rápida y nutritiva.</p>",
            order: 1
        });


        // --- Usuario 3: Carol ---
        const carol = new User({
            username: "CarolWhite",
            email: "carol.white@example.com",
            password: "123456",
            theme: "dark",
            highlightColor: "green",
            avatar: "avatar-base.jpg" // 👈 ASIGNADO AVATAR
        });
        await carol.save();
        console.log(`👤 Usuario creado: ${carol.username} (ID: ${carol._id}) con avatar: ${carol.avatar}`);

        // Proyecto 1 de Carol (propio) - Asignando 'fondo.jpg' como coverImage
        const carolProject1 = new Project({
            userId: carol._id,
            title: "Diario Personal de Gratitud",
            description: "Un espacio para reflexionar y documentar las cosas por las que estoy agradecida cada día.",
            coverImage: "fondo.jpg"
        });
        await carolProject1.save();
        console.log(`📦 Proyecto creado: ${carolProject1.title} para ${carol.username} (ID: ${carolProject1._id}) con cover: ${carolProject1.coverImage}`);

        // Permiso para Carol como dueña de su proyecto
        await Permission.create({
            projectId: carolProject1._id,
            userId: carol._id,
            rol: "owner"
        });
        console.log(`🔑 Permiso 'owner' asignado a ${carol.username} para ${carolProject1.title}`);

        // Páginas de Carol - Proyecto 1 (restante contenido igual)
        const carolProject1Page1 = new Pages({
            projectId: carolProject1._id,
            title: "1 de Junio, 2025: Un Día Tranquilo",
            order: 1
        });
        await carolProject1Page1.save();
        console.log(`📄 Página creada: ${carolProject1Page1.title} (ID: ${carolProject1Page1._id})`);

        await Content.create({
            pageId: carolProject1Page1._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">1 de Junio, 2025: Un Día Tranquilo</span></h3><p><img src=\"/images/fondo.jpg\" alt=\"Paisaje relajante\" style=\"max-width:100%;\"></p><p>Hoy fue un día increíblemente tranquilo. Empecé la mañana con una sesión de yoga suave, lo que me ayudó a centrarme. Después, pasé varias horas en el parque leyendo un libro fascinante sobre filosofía estoica. Agradecida por la paz y el tiempo para mí misma. Pequeños momentos de calma son los más valiosos.</p>",
            order: 1
        });

        const carolProject1Page2 = new Pages({
            projectId: carolProject1._id,
            title: "2 de Junio, 2025: Conexiones Significativas",
            order: 2
        });
        await carolProject1Page2.save();
        console.log(`📄 Página creada: ${carolProject1Page2.title} (ID: ${carolProject1Page2._id})`);

        await Content.create({
            pageId: carolProject1Page2._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">2 de Junio, 2025: Conexiones Significativas</span></h3><p>Hoy me siento especialmente agradecida por mis amigos. Tuve un almuerzo muy animado con Laura y Juan, donde reímos sin parar y compartimos nuevas ideas para proyectos. Es una bendición tener personas que te inspiran y te apoyan. La conexión humana es, sin duda, una de las mayores fuentes de felicidad.</p>",
            order: 1
        });

        const carolProject1Page3 = new Pages({
            projectId: carolProject1._id,
            title: "3 de Junio, 2025: Pequeñas Victorias",
            order: 3
        });
        await carolProject1Page3.save();
        console.log(`📄 Página creada: ${carolProject1Page3.title} (ID: ${carolProject1Page3._id})`);

        await Content.create({
            pageId: carolProject1Page3._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">3 de Junio, 2025: Pequeñas Victorias</span></h3><p>Logré terminar la tarea del trabajo que me estaba dando vueltas desde hace días. La sensación de alivio y satisfacción es inmensa. A veces, las pequeñas victorias son las que más impulsan. También agradezco el sol brillante de la tarde, que hizo mi paseo por el río mucho más agradable.</p>",
            order: 1
        });

        // --- Configuración de Proyectos Compartidos e Invitaciones ---

        // Un proyecto de Alice que será compartido con Bob (lector)
        // Asignando 'programacion.jpg' como coverImage para este proyecto compartido
        const aliceProject2 = new Project({
            userId: alice._id,
            title: "Recursos de Desarrollo Frontend",
            description: "Un compendio de enlaces, tutoriales y notas sobre React, Vue y Svelte.",
            coverImage: "programacion.jpg"
        });
        await aliceProject2.save();
        console.log(`📦 Proyecto creado: ${aliceProject2.title} para ${alice.username} (ID: ${aliceProject2._id}) con cover: ${aliceProject2.coverImage}`);

        // Permiso para Alice como dueña del proyecto compartido
        await Permission.create({
            projectId: aliceProject2._id,
            userId: alice._id,
            rol: "owner"
        });
        console.log(`🔑 Permiso 'owner' asignado a ${alice.username} para ${aliceProject2.title}`);

        // Bob es invitado como 'viewer' a aliceProject2 y acepta la invitación
        await Invitation.create({
            projectId: aliceProject2._id,
            recipientEmail: bob.email, // Correo de Bob
            inviter: alice._id, // Alice invita
            rol: "viewer",
            status: "pending"
        });
        console.log(`✉️ Invitación pendiente de ${alice.username} a ${bob.username} para ${aliceProject2.title} como 'viewer'.`);

        // Para simular una invitación ACEPTADA, tendrías que crear el permiso directamente
        await Permission.create({
            projectId: aliceProject2._id,
            userId: bob._id,
            rol: "viewer"
        });
        console.log(`🔑 Permiso 'viewer' asignado a ${bob.username} para ${aliceProject2.title} (simulando invitación aceptada).`);

        const aliceProject2Page1 = new Pages({
            projectId: aliceProject2._id,
            title: "Introducción a React Hooks",
            order: 1
        });
        await aliceProject2Page1.save();
        await Content.create({
            pageId: aliceProject2Page1._id,
            type: "text",
            content: "<h3><span class=\"ql-size-large\">Introducción a React Hooks</span></h3><p>Explorando los <b>Hooks</b> en React para una mejor gestión del estado y efectos secundarios en componentes funcionales. Conceptos clave: useState, useEffect, useContext.</p>",
            order: 1
        });
        console.log(`📄 Página creada en proyecto compartido: ${aliceProject2Page1.title}`);

        console.log("🎉 ¡Datos de ejemplo y configuración de permisos/invitaciones completados exitosamente!");

    } catch (error) {
        console.error("❌ Error al crear datos de ejemplo:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Desconectado de MongoDB");
    }
};

createData();