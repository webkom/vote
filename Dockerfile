FROM node:16-alpine as builder
LABEL org.opencontainers.image.authors="Abakus Webkom <webkom@abakus.no>"

# Create app directory
RUN mkdir -p /app
WORKDIR /app

EXPOSE 3000

# Copy application
COPY . /app

# Build image
RUN yarn --ignore-scripts
ENV NODE_ENV production
RUN yarn build && yarn build:cli

FROM node:16-alpine

WORKDIR /app

COPY --from=builder /app/bin bin
COPY --from=builder /app/public public
COPY --from=builder /app/dist dist
COPY --from=builder /app/app/views app/views
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules node_modules

ARG RELEASE
ENV RELEASE ${RELEASE}
ENV NODE_ENV production
ENV HOST 0.0.0.0

ENTRYPOINT ["yarn", "start"]
