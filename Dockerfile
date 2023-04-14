FROM node:16-alpine3.14

# Setup working directory
WORKDIR /usr/src/app

# Install
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy remaining files
COPY . ./

# Bundle
RUN NODE_ENV=production npm run build

# Start server
CMD NODE_ENV=production npm run serve
