import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Add this to your existing imports at the top of server.js

mongoose.connect('mongodb://localhost:27017/expanse', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Import admin routes
import adminRoutes from './routes/admin.js';
app.use('/api/admin', adminRoutes);

app.get('/admin', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'admin.html'));
});
