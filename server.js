require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/oauth');
const authRoutes = require('./routes/authRoutes');
const capsuleRoutes = require('./routes/capsuleRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swaggerConfig');
require('./config/db');

const app = express();

// Debug environment variables
console.log("NODE_ENV:", process.env.NODE_ENV || "undefined");
console.log("Env variables:", {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  MONGO_URI: process.env.MONGO_URI ? "Set" : "Undefined",
});

// Configure CORS for all routes
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://time-capsule-3kgt.onrender.com",
      "http://localhost:3000/api-docs",
      "https://time-capsule-3kgt.onrender.com/api-docs",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Enable trust proxy for Render
app.set("trust proxy", 1);

// Serve Swagger UI without session or passport
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
console.log('Passport initialized');

app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to the Time Capsule API</h1>
    <p>Explore the API documentation and test endpoints:</p>
    <a href="/api-docs">Go to API Documentation</a>
    <br>
    <a href="api/auth/login">Login with Google</a>
  `);
});

console.log('Server routes configured');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));