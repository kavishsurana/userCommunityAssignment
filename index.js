const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); 
const roleRoutes = require('./routes/roleRoutes');
const userRoutes = require('./routes/userRoutes');
const communityRoutes = require('./routes/communityRoutes');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/v1', roleRoutes);
app.use('/v1', userRoutes);
app.use('/v1', communityRoutes);
// app.use('/v1', memberRoutes);

app.listen(PORT, async () => {
  try {
    await prisma.$connect();
    console.log(`Server is running on port ${PORT}`);
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1); 
  }
});
