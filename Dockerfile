FROM node:14-slim
MAINTAINER Abakus Webkom <webkom@abakus.no>

# Create app directory
RUN mkdir -p /app
WORKDIR /app

EXPOSE 3000

# Copy application
COPY . /app

# Build image
RUN yarn --production

ARG RELEASE
ENV RELEASE ${RELEASE}
ENV NODE_ENV production
ENV HOST 0.0.0.0

ENTRYPOINT ["yarn", "start"]
