FROM node:20

# Install language runtimes (optional, mainly for fallback)
RUN apt-get update && apt-get install -y \
    python3 python3-pip g++ default-jdk curl git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 8000

CMD ["node", "src/index.js"]
