#!/bin/bash
# SuperAgents Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/rinaldofesta/superagents/main/install.sh | bash

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print banner
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   ███████╗██╗   ██╗██████╗ ███████╗██████╗                    ║"
echo "║   ██╔════╝██║   ██║██╔══██╗██╔════╝██╔══██╗                   ║"
echo "║   ███████╗██║   ██║██████╔╝█████╗  ██████╔╝                   ║"
echo "║   ╚════██║██║   ██║██╔═══╝ ██╔══╝  ██╔══██╗                   ║"
echo "║   ███████║╚██████╔╝██║     ███████╗██║  ██║                   ║"
echo "║   ╚══════╝ ╚═════╝ ╚═╝     ╚══════╝╚═╝  ╚═╝                   ║"
echo "║                                                               ║"
echo "║   █████╗  ██████╗ ███████╗███╗   ██╗████████╗███████╗         ║"
echo "║  ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝██╔════╝         ║"
echo "║  ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║   ███████╗         ║"
echo "║  ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║   ╚════██║         ║"
echo "║  ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║   ███████║         ║"
echo "║  ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝         ║"
echo "║                                                               ║"
echo "║  Goal-Aware Claude Code Configuration Generator               ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo -e "${BLUE}Installing SuperAgents...${NC}"
echo ""

# Check for Node.js
check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed.${NC}"
        echo -e "Please install Node.js 20+ from: ${BLUE}https://nodejs.org${NC}"
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        echo -e "${RED}Error: Node.js 20+ is required. You have $(node -v)${NC}"
        echo -e "Please upgrade Node.js from: ${BLUE}https://nodejs.org${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} Node.js $(node -v) detected"
}

# Check for npm
check_npm() {
    if ! command -v npm &> /dev/null; then
        echo -e "${RED}Error: npm is not installed.${NC}"
        exit 1
    fi
    echo -e "${GREEN}✓${NC} npm $(npm -v) detected"
}

# Installation directory
INSTALL_DIR="$HOME/.superagents"
BIN_DIR="$HOME/.local/bin"

# Create directories
create_dirs() {
    mkdir -p "$INSTALL_DIR"
    mkdir -p "$BIN_DIR"
    echo -e "${GREEN}✓${NC} Created installation directories"
}

# Download and install
install_superagents() {
    echo ""
    echo -e "${BLUE}Downloading SuperAgents...${NC}"

    # Clone or download
    if command -v git &> /dev/null; then
        # Use git if available
        rm -rf "$INSTALL_DIR"
        git clone --depth 1 https://github.com/rinaldofesta/superagents.git "$INSTALL_DIR" 2>/dev/null || {
            echo -e "${YELLOW}Git clone failed, trying npm install...${NC}"
            npm install -g superagents 2>/dev/null || {
                echo -e "${RED}Installation failed. Please try: npm install -g superagents${NC}"
                exit 1
            }
            return
        }
    else
        # Fallback to npm global install
        echo -e "${YELLOW}Git not found, using npm install...${NC}"
        npm install -g superagents
        return
    fi

    echo -e "${GREEN}✓${NC} Downloaded SuperAgents"

    # Install dependencies
    echo ""
    echo -e "${BLUE}Installing dependencies...${NC}"
    cd "$INSTALL_DIR"
    npm install --production
    echo -e "${GREEN}✓${NC} Dependencies installed"

    # Create symlink (dist/ is pre-built in the repo)
    echo ""
    echo -e "${BLUE}Creating command link...${NC}"
    ln -sf "$INSTALL_DIR/bin/superagents" "$BIN_DIR/superagents"
    chmod +x "$INSTALL_DIR/bin/superagents"
    echo -e "${GREEN}✓${NC} Created 'superagents' command"
}

# Add to PATH if needed
setup_path() {
    if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
        echo ""
        echo -e "${YELLOW}Adding $BIN_DIR to PATH...${NC}"

        # Detect shell
        SHELL_NAME=$(basename "$SHELL")

        case "$SHELL_NAME" in
            bash)
                PROFILE="$HOME/.bashrc"
                ;;
            zsh)
                PROFILE="$HOME/.zshrc"
                ;;
            *)
                PROFILE="$HOME/.profile"
                ;;
        esac

        # Add to profile if not already there
        if ! grep -q "$BIN_DIR" "$PROFILE" 2>/dev/null; then
            echo "" >> "$PROFILE"
            echo "# SuperAgents" >> "$PROFILE"
            echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$PROFILE"
            echo -e "${GREEN}✓${NC} Added to $PROFILE"
        fi

        echo ""
        echo -e "${YELLOW}Please run: ${NC}source $PROFILE"
        echo -e "${YELLOW}Or restart your terminal.${NC}"
    fi
}

# Print success
print_success() {
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}  SuperAgents installed successfully!${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "  Run ${BLUE}superagents${NC} in any project directory to get started."
    echo ""
    echo -e "  ${YELLOW}Quick Start:${NC}"
    echo -e "  1. cd into your project"
    echo -e "  2. Run: ${BLUE}superagents${NC}"
    echo -e "  3. Describe what you're building"
    echo -e "  4. Get AI-generated agents and skills!"
    echo ""
    echo -e "  ${YELLOW}Need help?${NC}"
    echo -e "  GitHub: https://github.com/rinaldofesta/superagents"
    echo ""
}

# Main installation flow
main() {
    check_node
    check_npm
    create_dirs
    install_superagents
    setup_path
    print_success
}

main
