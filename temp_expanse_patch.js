// REMOVE any duplicate expanseRoutes code ABOVE this line.

// Insert this once at the top with your other imports:
import expanseRoutes from './backend/expanse/index.js';

// Keep this route registration ONCE only:
app.use('/api/expanse', expanseRoutes);

// REMOVE any other expanseRoutes require/import lines (CommonJS or ES).
