// backend/utils/routeLogger.js
const registeredRoutes = [];

export function registerRoute(path, name) {
    registeredRoutes.push({ path, name });
    console.log(`  ✅ ${name}: ${path}`);
}

export function showAllRoutes() {
    console.log("📦 Systems Loaded:");
    registeredRoutes.forEach(route => {
        console.log(`  ✅ ${route.name}: ${route.path}`);
    });
}

export default { registerRoute, showAllRoutes };
