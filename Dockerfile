FROM oven/bun:1.3.6

WORKDIR /app

COPY package.json bun.lock ./
COPY prisma ./prisma/

RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY . .

RUN bun run build

EXPOSE 3000

CMD ["bun", "run", "start"]
