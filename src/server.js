import express from 'express';
import 'dotenv/config';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';

// Rutas
import User from './routes/user.js';
import Publicacion from './routes/publicacion.js';
import Comentario from './routes/comentario.js';
import Reaccion from './routes/reaccion.js';
import Donacion from './routes/donacion.js';
import Notificacion from './routes/notificacion.js';
import Lista from './routes/lista.js';

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT;
        this.middelwares();
        this.routes();
    }

    middelwares() {
        this.app.use(express.json());
        this.app.use(bodyParser.json());
        this.app.use(cors());
        this.app.use(express.static('public'));
    }

    routes() {
        this.app.use('/api/user', User);
        this.app.use('/api/publicacion', Publicacion);
        this.app.use('/api/comentario', Comentario);
        this.app.use('/api/reaccion', Reaccion);
        this.app.use('/api/donacion', Donacion);
        this.app.use('/api/notificacion', Notificacion);
        this.app.use('/api/lista', Lista);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port ${this.port}`);
        });
    }

    connectDB() {
        mongoose
            .connect(process.env.mongoDB, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }).then(() => {
                console.log('DB connected');
                this.listen();
            }).catch((err) => {
                console.log('DB connection error', err);
                process.exit(1);
            });
    }
}

export { Server };