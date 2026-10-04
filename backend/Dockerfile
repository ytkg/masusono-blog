# syntax=docker/dockerfile:1
# check=error=true

# This Dockerfile is designed for production, not development. Build and run directly:
# docker build -t backend .
# docker run -d -p 80:80 -e RAILS_MASTER_KEY=<value from config/master.key> --name backend backend

# For a containerized dev environment, see Dev Containers: https://guides.rubyonrails.org/getting_started_with_devcontainer.html

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version
ARG RUBY_VERSION=4.0.1
FROM node:22-bookworm-slim AS frontend
WORKDIR /rails
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY vite.config.ts ./
COPY config/vite.json config/vite.json
COPY app/frontend app/frontend
RUN npm run build

FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

# Rails app lives here
WORKDIR /rails

# Install base packages (optionally include build tools for development)
ARG INSTALL_DEV_TOOLS=0
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips sqlite3 && \
    if [ "$INSTALL_DEV_TOOLS" = "1" ]; then \
      apt-get install --no-install-recommends -y build-essential git libyaml-dev pkg-config nodejs npm; \
    fi && \
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# SSR runs alongside Puma; the runtime does not need npm or node_modules.
COPY --from=frontend /usr/local/bin/node /usr/local/bin/node

# Set environment variables (overridable via build args) and enable jemalloc for reduced memory usage and latency.
ARG RAILS_ENV=production
ARG BUNDLE_DEPLOYMENT=1
ARG BUNDLE_PATH=/usr/local/bundle
ARG BUNDLE_WITHOUT=development
ENV RAILS_ENV="${RAILS_ENV}" \
    BUNDLE_DEPLOYMENT="${BUNDLE_DEPLOYMENT}" \
    BUNDLE_PATH="${BUNDLE_PATH}" \
    BUNDLE_WITHOUT="${BUNDLE_WITHOUT}" \
    LD_PRELOAD="/usr/local/lib/libjemalloc.so"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build gems
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libssl-dev libyaml-dev pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install application gems
COPY vendor/* ./vendor/
COPY Gemfile Gemfile.lock ./

RUN bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git && \
    # -j 1 disable parallel compilation to avoid a QEMU bug: https://github.com/rails/bootsnap/issues/495
    bundle exec bootsnap precompile -j 1 --gemfile

# Copy application code
COPY . .
COPY --from=frontend /rails/public/vite /rails/public/vite
COPY --from=frontend /rails/ssr /rails/ssr

# Precompile bootsnap code for faster boot times.
# -j 1 disable parallel compilation to avoid a QEMU bug: https://github.com/rails/bootsnap/issues/495
RUN bundle exec bootsnap precompile -j 1 app/ lib/




# Final stage for app image
FROM base

# Run and own only the runtime files as a non-root user for security
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash
USER 1000:1000

# Copy built artifacts: gems, application
COPY --chown=rails:rails --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --chown=rails:rails --from=build /rails /rails

# Entrypoint prepares the database.
ENTRYPOINT ["/rails/bin/docker-entrypoint"]

# Start server via Thruster by default, this can be overwritten at runtime
EXPOSE 8080
CMD ["/bin/sh", "-c", "./bin/thrust ./bin/rails server -b 0.0.0.0 -p ${PORT:-8080}"]
