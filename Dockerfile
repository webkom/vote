FROM node:8
MAINTAINER Abakus Webkom <webkom@abakus.no>

# Create app directory
RUN mkdir -p /app
WORKDIR /app

EXPOSE 3000

# Copy application
COPY . /app

# Build image
RUN yarn --production

ENV NODE_ENV production
ENTRYPOINT ["yarn", "start"]
