# Variables
IMAGE_NAME := aiquiz
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "latest")
BUILD_DATE := $(shell date -u +'%Y-%m-%dT%H:%M:%SZ')
VCS_REF := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
HOST_PORT := 3000

# Detect docker-compose command (newer Docker installations use 'docker compose')
DOCKER_COMPOSE_CMD := $(shell which docker-compose 2>/dev/null)
ifeq ($(DOCKER_COMPOSE_CMD),)
	DOCKER_COMPOSE_CMD := docker compose
else
	DOCKER_COMPOSE_CMD := docker-compose
endif

.PHONY: help build run dev stop clean push security-scan

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

build: ## Build the Docker image
	@echo "Building $(IMAGE_NAME):$(VERSION)..."
	docker build -t $(IMAGE_NAME):$(VERSION) -t $(IMAGE_NAME):latest .

build-no-cache: ## Build the Docker image without cache
	@echo "Building $(IMAGE_NAME):$(VERSION) without cache..."
	docker build --no-cache -t $(IMAGE_NAME):$(VERSION) -t $(IMAGE_NAME):latest .

run: ## Run the container
	@echo "Running $(IMAGE_NAME) on port $(HOST_PORT)..."
	docker run -d \
		--name aiquiz-app \
		-p $(HOST_PORT):80 \
		--restart unless-stopped \
		$(IMAGE_NAME):latest

dev: ## Start development environment
	@echo "Starting development environment with $(DOCKER_COMPOSE_CMD)..."
	$(DOCKER_COMPOSE_CMD) -f docker-compose.yml -f docker-compose.dev.yml up --build

prod: ## Start production environment
	@echo "Starting production environment with $(DOCKER_COMPOSE_CMD)..."
	BUILD_DATE=$(BUILD_DATE) VERSION=$(VERSION) VCS_REF=$(VCS_REF) \
	$(DOCKER_COMPOSE_CMD) up --build -d

stop: ## Stop and remove containers
	@echo "Stopping containers..."
	$(DOCKER_COMPOSE_CMD) down 2>/dev/null || true
	docker stop aiquiz-app 2>/dev/null || true
	docker rm aiquiz-app 2>/dev/null || true

clean: ## Clean up Docker resources
	@echo "Cleaning up..."
	$(DOCKER_COMPOSE_CMD) down --volumes --remove-orphans 2>/dev/null || true
	docker system prune -f
	docker rmi $(IMAGE_NAME):$(VERSION) $(IMAGE_NAME):latest 2>/dev/null || true

security-scan: ## Run security scan on the image
	@echo "Running security scan..."
	docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
		aquasec/trivy image $(IMAGE_NAME):latest

push: build ## Build and push to registry
	@echo "Pushing $(IMAGE_NAME):$(VERSION)..."
	docker push $(IMAGE_NAME):$(VERSION)
	docker push $(IMAGE_NAME):latest

logs: ## Show container logs
	$(DOCKER_COMPOSE_CMD) logs -f

shell: ## Open shell in running container
	docker exec -it aiquiz-app sh

inspect: ## Inspect the built image
	@echo "Image details:"
	@docker inspect $(IMAGE_NAME):latest | jq '.[0].Config.Labels' 2>/dev/null || docker inspect $(IMAGE_NAME):latest

size: ## Show image size
	@docker images $(IMAGE_NAME) --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

test-compose: ## Test which docker-compose command is available
	@echo "Testing docker-compose commands..."
	@echo "Trying 'docker compose'..."
	@docker compose version 2>/dev/null && echo "✓ 'docker compose' works" || echo "✗ 'docker compose' not available"
	@echo "Trying 'docker-compose'..."
	@docker-compose version 2>/dev/null && echo "✓ 'docker-compose' works" || echo "✗ 'docker-compose' not available"
	@echo "Using: $(DOCKER_COMPOSE_CMD)"
