# syntax=docker/dockerfile:1

# Backend: node:22 full incluye toolchain por si bcrypt compila desde fuente.
FROM node:22 AS backend-build
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

# Frontend: build estatico de Vite.
FROM node:22-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Runtime: layout del repo intacto. backend/dist/app.js resuelve
# ../../frontend/dist -> /app/frontend/dist sin cambios de codigo.
FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app/backend
COPY backend/package*.json ./
COPY --from=backend-build /app/backend/node_modules ./node_modules
COPY --from=backend-build /app/backend/dist ./dist
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
