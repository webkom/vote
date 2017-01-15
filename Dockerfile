FROM node:6
MAINTAINER Abakus Webkom <webkom@abakus.no>

# Create app directory
RUN mkdir -p /app
WORKDIR /app

EXPOSE 3000

# Copy application
COPY . /app

# Build image
RUN npm install

ENTRYPOINT ["npm", "start"]
