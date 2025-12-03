/* Connexion à la base de donnée */

require("../utils/database");

const mongoose = require('mongoose')

// Si tu veux quand même exécuter le code de connexion global (optionnel)
// require("../utils/database"); // tu peux conserver ou commenter

/**
 * BEFORE : essayer de se connecter explicitement et rapidement.
 * - serverSelectionTimeoutMS réduit le temps d'attente à 5s si Mongo n'est pas joignable.
 * - on error on rejette pour échouer tôt.
 */
before(async function () {
  this.timeout(25000); // laisse un peu plus de marge pour la connexion initiale

  // Construire l'URI à utiliser pour les tests :
  // Si tu uses URL_DATABASE_TEST dans ton .env, préférer celle-ci.
  const uri = process.env.URL_DATABASE_TEST || process.env.URL_DATABASE;
  if (!uri) {
    throw new Error("Aucune URL de BDD trouvée : définis URL_DATABASE ou URL_DATABASE_TEST dans .env");
  }

//   console.log("🔌 Tentative de connexion à MongoDB pour les tests ->", uri);

  try {
    // Se connecter explicitement ici avec timeout court pour échouer vite si besoin
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // <- si Mongo n'est pas joignable, on aura une erreur en ~5s
    });

    // attendre le 'open' pour être sûr (normalement resolved après connect)
    if (mongoose.connection.readyState === 1) {
    //   console.log("✅ MongoDB connecté (readyState=1)");
    } else {
      await new Promise((resolve, reject) => {
        mongoose.connection.once("open", () => {
        //   console.log("✅ MongoDB open event reçu");
          resolve();
        });
        mongoose.connection.once("error", (err) => {
          console.error("❌ Erreur connection event:", err);
          reject(err);
        });
      });
    }
  } catch (err) {
    console.error("❌ Impossible de connecter MongoDB dans before():", err);
    throw err; // fait échouer les tests tôt — apporte l'info sur pourquoi ça bloque
  }
});

after(async function () {
  this.timeout(10000);
  try {
    if (mongoose.connection && mongoose.connection.db) {
      if (process.env.npm_lifecycle_event === 'test') {
        // console.log("🧹 Drop database for tests");
        await mongoose.connection.db.dropDatabase();
      }
      await mongoose.disconnect();
    //   console.log("🔌 MongoDB déconnecté proprement");
    } else {
    //   console.log("ℹ️  Pas de connexion Mongo active au moment du after(), rien à nettoyer");
    }
  } catch (err) {
    // console.error("❌ Erreur dans after():", err);
    // ne pas masquer les erreurs, mais laisser mocha rapporter
    throw err;
  }
});

describe("UserService", () => {
    require("./services/UserService.test");
});

describe("UserController", () => {
    require("./controllers/UserController.test")
})

describe("SettingService", () => {
    require('./services/SettingService.test')
})

describe("SettingController", () => {
    require("./controllers/SettingController.test")
})

describe("WeatherService", () => {
    require("./services/WeatherService.test")
})

describe("WeatherController", () => {
    require("./controllers/WeatherController.test")
})


describe("API - Mongo", () => {
    it("Vider les dbs. - S", () => {
        if (process.env.npm_lifecycle_event == 'test')
            mongoose.connection.db.dropDatabase();
    })
})
