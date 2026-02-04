# Installation

Install SuperAgents using one of the following methods.

## Prerequisites

SuperAgents requires Node.js 20 or later.

Check your Node.js version:

```bash
node --version
```

If you need to upgrade, visit [nodejs.org](https://nodejs.org/).

## One-Line Install (Recommended)

The fastest way to install SuperAgents:

```bash
curl -fsSL https://superagents.playnew.com/install.sh | bash
```

This script downloads the latest version and adds it to your PATH.

After installation, restart your terminal or reload your shell configuration:

```bash
# For zsh (default on macOS)
source ~/.zshrc

# For bash
source ~/.bashrc
```

Verify the installation:

```bash
superagents --version
```

## Install via npm

If you prefer npm:

```bash
npm install -g superagents
```

The `-g` flag installs SuperAgents globally, making it available from any directory.

## Install via npx (No Install)

Run SuperAgents without installing:

```bash
npx superagents
```

This downloads and runs the latest version each time. Useful for trying SuperAgents or one-time usage.

## Development Installation

If you're contributing to SuperAgents or want to run from source:

```bash
# Clone the repository
git clone https://github.com/Play-New/superagents.git
cd superagents

# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev
```

## Verify Installation

After installing, verify SuperAgents is working:

```bash
superagents --help
```

You should see the help text with available commands and options.

## Troubleshooting

### Command Not Found

If you see `command not found: superagents` after the curl install:

1. Restart your terminal
2. Reload shell config: `source ~/.zshrc` or `source ~/.bashrc`
3. Check PATH: `echo $PATH` should include the installation directory

### Permission Errors with npm

If npm install fails with permission errors, use one of these solutions:

**Option 1: Use npx (no installation needed)**
```bash
npx superagents
```

**Option 2: Change npm's default directory**
```bash
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g superagents
```

**Option 3: Use a Node.js version manager**

Install [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage Node.js versions without sudo.

### Node.js Version Too Old

SuperAgents requires Node.js 20+. If you have an older version:

1. Install nvm: [nvm installation guide](https://github.com/nvm-sh/nvm#installing-and-updating)
2. Install Node.js 20:
   ```bash
   nvm install 20
   nvm use 20
   ```

## Next Steps

- [Quickstart Guide](quickstart.md) - Run SuperAgents for the first time
- [Authentication](authentication.md) - Set up API access
