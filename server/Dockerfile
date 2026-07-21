# Build/run context for this Dockerfile is the REPO ROOT (BrowserBoot/),
# because the server needs the sibling ../kernels folder.
# e.g. docker build -f server/Dockerfile -t browserboot-server .

FROM node:22-bookworm-slim

# qemu-system-x86 provides qemu-system-x86_64, which VMManager.ts spawns directly.
# No KVM / -enable-kvm flag is used in the code, so this runs fine with plain
# software emulation (TCG) and does not require --device /dev/kvm.
RUN apt-get update && apt-get install -y --no-install-recommends \
        qemu-system-x86 \
        qemu-utils \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first for better layer caching
COPY server/package.json server/package-lock.json ./server/
RUN cd server && npm ci

# App source + the image the server boots
COPY server ./server

# config.ts resolves kernels as ../kernels relative to process.cwd() (=/app/server),
# and websocket/VMManager write qmp sockets under ../runtime/qmp relative to /app/server.
RUN mkdir -p /app/runtime/qmp
RUN mkdir -p /app/runtime/qcow2

WORKDIR /app/server

ENV NODE_ENV=production
EXPOSE 3000

# No compiled "dist" is produced by this project (no tsc build step defined),
# so we run the TypeScript source directly with tsx, same as "npm run dev" does.
CMD ["npx", "tsx", "src/index.ts"]
