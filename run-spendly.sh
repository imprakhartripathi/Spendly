#!/bin/bash

# Spendly Application Runner (Bash version)
# Interactive script to run Spendly in Production (Docker) or Development mode

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# Logging functions
log_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}  $1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_step() {
    echo -e "${MAGENTA}🔄 $1${NC}"
}

log_separator() {
    echo -e "${GRAY}───────────────────────────────────────────────────────────────${NC}"
}

# ASCII Art Banner
show_banner() {
    echo ""
    echo -e "${GREEN}  ███████╗██████╗ ███████╗███╗   ██╗██████╗ ██╗  ██╗   ██╗${NC}"
    echo -e "${GREEN}  ██╔════╝██╔══██╗██╔════╝████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝${NC}"
    echo -e "${GREEN}  ███████╗██████╔╝█████╗  ██╔██╗ ██║██║  ██║██║   ╚████╔╝ ${NC}"
    echo -e "${GREEN}  ╚════██║██╔═══╝ ██╔══╝  ██║╚██╗██║██║  ██║██║    ╚██╔╝  ${NC}"
    echo -e "${GREEN}  ███████║██║     ███████╗██║ ╚████║██████╔╝███████╗██║   ${NC}"
    echo -e "${GREEN}  ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝   ${NC}"
    echo ""
    echo -e "${GRAY}                    Personal Finance Management${NC}"
    echo ""
}

# Check if Docker is running
check_docker() {
    if command -v docker &> /dev/null && docker version &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Check if Node.js is installed
check_node() {
    if command -v node &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Production mode - Docker
start_production_mode() {
    log_header "🚀 PRODUCTION MODE - DOCKER DEPLOYMENT"
    
    log_step "Checking Docker availability..."
    if ! check_docker; then
        log_error "Docker is not running or not installed!"
        log_info "Please start Docker and try again."
        return 1
    fi
    log_success "Docker is running"
    
    log_separator
    log_step "Stopping any existing containers..."
    docker-compose down &> /dev/null
    
    log_step "Starting Spendly in production mode..."
    log_info "Building and starting containers..."
    
    start_time=$(date +%s)
    if docker-compose up -d; then
        end_time=$(date +%s)
        duration=$((end_time - start_time))
        
        log_separator
        log_success "Spendly started successfully in ${duration} seconds!"
        
        log_info "Container Status:"
        docker-compose ps
        
        log_separator
        log_header "🌐 APPLICATION URLS"
        echo -e "  Frontend (Client): ${CYAN}http://localhost:5000${NC}"
        echo -e "  Backend (Server):  ${CYAN}http://localhost:4200${NC}"
        
        log_separator
        log_info "Useful commands:"
        echo -e "  • View logs:        ${WHITE}docker-compose logs -f${NC}"
        echo -e "  • Stop application: ${WHITE}docker-compose down${NC}"
        echo -e "  • Restart:          ${WHITE}docker-compose restart${NC}"
        
    else
        log_error "Failed to start containers!"
        log_info "Check logs with: docker-compose logs"
        return 1
    fi
}

# Development mode - Local
start_development_mode() {
    log_header "🛠️  DEVELOPMENT MODE - LOCAL ENVIRONMENT"
    
    log_step "Checking Node.js availability..."
    if ! check_node; then
        log_error "Node.js is not installed!"
        log_info "Please install Node.js and try again."
        return 1
    fi
    
    node_version=$(node --version)
    log_success "Node.js $node_version is available"
    
    log_separator
    log_step "Checking project dependencies..."
    
    # Check server dependencies
    if [ ! -d "server/node_modules" ]; then
        log_warning "Server dependencies not found. Installing..."
        cd server && npm install && cd ..
        log_success "Server dependencies installed"
    else
        log_success "Server dependencies found"
    fi
    
    # Check client dependencies
    if [ ! -d "client/node_modules" ]; then
        log_warning "Client dependencies not found. Installing..."
        cd client && npm install && cd ..
        log_success "Client dependencies installed"
    else
        log_success "Client dependencies found"
    fi
    
    log_separator
    log_header "🚀 STARTING DEVELOPMENT SERVERS"
    
    log_info "Starting servers in development mode..."
    log_warning "This will run servers in background"
    
    # Start server in background
    log_step "Starting backend server..."
    cd server
    echo -e "${GREEN}🔧 SPENDLY BACKEND SERVER${NC}"
    echo -e "${CYAN}Starting Node.js server with hot reload...${NC}"
    npm start &
    SERVER_PID=$!
    cd ..
    
    sleep 2
    
    # Start client in background
    log_step "Starting frontend development server..."
    cd client
    echo -e "${BLUE}🌐 SPENDLY FRONTEND CLIENT${NC}"
    echo -e "${CYAN}Starting React development server...${NC}"
    npm run dev &
    CLIENT_PID=$!
    cd ..
    
    log_separator
    log_success "Development servers are starting..."
    log_info "Please wait a moment for both servers to initialize"
    
    log_separator
    log_header "🌐 DEVELOPMENT URLS (will be available shortly)"
    echo -e "  Frontend (Client): ${CYAN}http://localhost:5173${NC} ${GRAY}(Vite dev server)${NC}"
    echo -e "  Backend (Server):  ${CYAN}http://localhost:4200${NC} ${GRAY}(Node.js with nodemon)${NC}"
    
    log_separator
    log_info "Development features enabled:"
    echo -e "  ${GREEN}• Hot Module Replacement (HMR)${NC}"
    echo -e "  ${GREEN}• Auto-restart on file changes${NC}"
    echo -e "  ${GREEN}• Source maps for debugging${NC}"
    echo -e "  ${GREEN}• Development error overlay${NC}"
    
    log_separator
    log_info "Process IDs - Server: $SERVER_PID, Client: $CLIENT_PID"
    log_warning "To stop development servers, run: kill $SERVER_PID $CLIENT_PID"
    
    # Create a stop script
    echo "#!/bin/bash" > stop-dev.sh
    echo "kill $SERVER_PID $CLIENT_PID 2>/dev/null" >> stop-dev.sh
    echo "echo 'Development servers stopped'" >> stop-dev.sh
    chmod +x stop-dev.sh
    log_info "Created stop-dev.sh script to stop development servers"
}

# Interactive mode selection
show_mode_selection() {
    log_header "🎯 SELECT DEPLOYMENT MODE"
    
    echo -e "  ${GREEN}[1] 🚀 Production Mode  ${GRAY}- Run with Docker containers (recommended for production)${NC}"
    echo -e "  ${YELLOW}[2] 🛠️  Development Mode ${GRAY}- Run locally with hot reload (for development)${NC}"
    echo -e "  ${RED}[3] ❌ Exit${NC}"
    echo ""
    
    while true; do
        read -p "Enter your choice (1-3): " choice
        case $choice in
            1) echo "production"; return ;;
            2) echo "development"; return ;;
            3) log_info "Goodbye! 👋"; exit 0 ;;
            *) log_warning "Invalid choice. Please enter 1, 2, or 3." ;;
        esac
    done
}

# Main execution
main() {
    clear
    show_banner
    
    # Change to script directory
    cd "$(dirname "$0")"
    log_info "Working directory: $(pwd)"
    log_separator
    
    # Determine mode
    if [ $# -eq 0 ]; then
        selected_mode=$(show_mode_selection)
    else
        selected_mode=$(echo "$1" | tr '[:upper:]' '[:lower:]')
    fi
    
    # Execute based on mode
    case $selected_mode in
        "production"|"prod")
            start_production_mode
            ;;
        "development"|"dev")
            start_development_mode
            ;;
        *)
            log_error "Invalid mode: $1"
            log_info "Valid modes: production, development, prod, dev"
            exit 1
            ;;
    esac
    
    log_separator
    log_success "Script completed successfully!"
}

# Run main function with all arguments
main "$@"