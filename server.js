const express = require('express');
const dotenv = require('dotenv');
dotenv.config({ path: './config/env.js' });

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.send('Time Capsule API'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));