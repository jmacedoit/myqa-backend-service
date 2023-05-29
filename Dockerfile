FROM --platform=linux/amd64 node:16-alpine3.16

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
