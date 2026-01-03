# Foundry Docker Image
FROM ghcr.io/foundry-rs/foundry:latest

# Set working directory
WORKDIR /app

# Copy smart contract files
COPY . .

# Default command
CMD ["forge", "build"]
