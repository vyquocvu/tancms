# TanCMS Development Makefile
# Simplifies common development tasks

.PHONY: help setup dev build test lint fix clean db-reset db-seed check-env

# Default target
help:
	@echo "TanCMS Development Commands:"
	@echo ""
	@echo "Setup & Environment:"
	@echo "  make setup       - Complete project setup (install deps, env, db)"
	@echo "  make check-env   - Validate environment configuration"
	@echo ""
	@echo "Development:"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make preview     - Preview production build"
	@echo ""
	@echo "Code Quality:"
	@echo "  make lint        - Run linter"
	@echo "  make fix         - Fix linting issues automatically"
	@echo "  make format      - Format code with Prettier"
	@echo "  make test        - Run all tests"
	@echo "  make test-watch  - Run tests in watch mode"
	@echo ""
	@echo "Database:"
	@echo "  make db-setup    - Initialize database (generate + migrate + seed)"
	@echo "  make db-reset    - Reset database completely"
	@echo "  make db-seed     - Seed database with sample data"
	@echo "  make db-studio   - Open Prisma Studio"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean       - Clean build artifacts and dependencies"
	@echo "  make doctor      - Run full health check"

# Setup and Environment
setup: check-env install db-setup
	@echo "✅ TanCMS setup complete!"
	@echo "Run 'make dev' to start development server"

check-env:
	@echo "🔍 Checking environment configuration..."
	@node scripts/check-env.js

install:
	@echo "📦 Installing dependencies..."
	@npm install

# Development
dev: check-env
	@echo "🚀 Starting development server..."
	@npm run dev

build:
	@echo "🏗️  Building for production..."
	@npm run build

preview: build
	@echo "👀 Starting preview server..."
	@npm run preview

# Code Quality
lint:
	@echo "🔍 Running linter..."
	@npm run lint

fix:
	@echo "🛠️  Fixing linting issues..."
	@npm run lint:fix

format:
	@echo "✨ Formatting code..."
	@npx prettier --write .

test:
	@echo "🧪 Running tests..."
	@npm test --run

test-watch:
	@echo "🧪 Running tests in watch mode..."
	@npm test

test-coverage:
	@echo "📊 Running tests with coverage..."
	@npm run test:coverage

# Database
db-setup: db-generate db-migrate db-seed

db-generate:
	@echo "🔧 Generating Prisma client..."
	@npm run db:generate

db-migrate:
	@echo "🗃️  Running database migrations..."
	@npm run db:migrate

db-seed:
	@echo "🌱 Seeding database..."
	@npm run db:seed

db-reset:
	@echo "⚠️  Resetting database..."
	@npm run db:reset

db-studio:
	@echo "🎛️  Opening Prisma Studio..."
	@npm run db:studio

# Utilities
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf dist .tanstack node_modules/.vite
	@echo "💿 Cleaned build artifacts"

clean-all: clean
	@echo "🧹 Cleaning all dependencies..."
	@rm -rf node_modules package-lock.json
	@echo "💿 Cleaned all dependencies"

doctor: check-env lint test build
	@echo "🏥 Health check complete - all systems operational!"

# Development helpers
logs:
	@echo "📋 Showing recent logs..."
	@if [ -f "logs/error.log" ]; then tail -n 50 logs/error.log; else echo "No error logs found"; fi

status:
	@echo "📊 TanCMS Status:"
	@echo "Node.js: $(shell node --version)"
	@echo "npm: $(shell npm --version)"
	@echo "Git branch: $(shell git branch --show-current)"
	@echo "Git status: $(shell git status --porcelain | wc -l) uncommitted changes"
	@if [ -f ".env" ]; then echo "Environment: ✅ .env file exists"; else echo "Environment: ❌ .env file missing"; fi
	@if [ -f "prisma/dev.db" ]; then echo "Database: ✅ SQLite database exists"; else echo "Database: ❌ Database not initialized"; fi