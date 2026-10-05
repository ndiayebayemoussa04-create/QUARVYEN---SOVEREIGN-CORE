# QARVYEN 2.0 Sovereign Intelligence Multi-stage Dockerfile
# Production-ready, Air-Gapped and GPU-Ready

FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM python:3.11-slim AS production
WORKDIR /app

# Install system GIS & BLAS dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gdal-bin \
    libgdal-dev \
    libgl1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python requirements
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy built frontend into static serve directory
COPY --from=frontend-builder /app/dist ./frontend/dist
COPY . .

ENV VITE_SOVEREIGN_MODE="true"
ENV PORT=3000

EXPOSE 3000 8000

CMD ["python", "backend/main.py"]
