const mongoose = require("mongoose");
const Logger = require('./logger').pino

mongoose.connection.on('connected', () => Logger.info('Connecté à la base de donnée'));
mongoose.connection.on('open', () => Logger.info('Connexion ouverte à la base de donnée.'));
mongoose.connection.on('disconnected', () => Logger.error('Déconnecté à la base de donnée'));
mongoose.connection.on('reconnected', () => Logger.info('Reconnecté à la base de donnée.'));
mongoose.connection.on('disconnecting', () => Logger.error('Déconnection à la base de donnée.'));
mongoose.connection.on('close', () => Logger.info('Connexion à la base de donnée fermé.'));

mongoose.connect(`mongodb://localhost:27017/${process.env.npm_lifecycle_event == 'test' ? "CDA_SERVER_TRAINING" : "CDA_SERVER_PRODUCTION"}`); 