// server.js
require('dotenv').config(); // Load .env first
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/oauth'); // Load after dotenv
const authRoutes = require('./routes/authRoutes');
const capsuleRoutes = require('./routes/capsuleRoutes');
require('./config/db'); // Connect to MongoDB

//Swagger 
const swaggerDocument = require('./docs/swaggerConfig');
const swaggerUi = require('swagger-ui-express');

const app = express();

app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 1 day
  })
);

app.use(passport.initialize());
app.use(passport.session());
console.log('Passport initialized');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/capsules', capsuleRoutes);

app.get('/', (req, res) => res.send('Time Capsule API'));
console.log('Server routes configured');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));