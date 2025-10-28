import express from 'express';
import loreAdminRoutes from './routes/lore-admin.js';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

console.log('Lore routes type:', typeof loreAdminRoutes);

app.use('/api/lore', loreAdminRoutes);

app.get('/', (req, res) => {
  res.send('Test server running');
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
