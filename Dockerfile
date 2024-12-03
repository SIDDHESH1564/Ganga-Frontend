FROM node:18-alpine

WORKDIR /app

# Install basic dependencies
RUN apk add --no-cache \
    bash \
    curl \
    python3 \
    make \
    g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose ports for development
EXPOSE 8081
EXPOSE 19000
EXPOSE 19001

# Start development server by default
CMD ["npm", "start"]