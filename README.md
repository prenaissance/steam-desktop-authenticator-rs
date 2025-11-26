# Steam Desktop Authenticator

A cross-platform desktop application for managing Steam authentication and confirmations. Built with Tauri, React, and Rust for optimal performance and security.

## Features

### Current
- Multi-account support with easy account switching
- Login via credentials with shared secret and identity secret (mafile)
- Time-based One-Time Password (TOTP) generation
- Trade confirmations management
- Session/login approvals
- Market sale confirmations
- Cross-platform support (Windows, Linux, macOS)
- Local configuration management

### Planned
- Proxy support
- Automatic trade confirmation
- Custom confirmation rules engine
- Additional authentication methods *(multiple maFiles support, etc.)*

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for rapid development and optimized builds
- TailwindCSS for styling with custom animations
- React Router for navigation
- React Hook Form with Zod validation
- Shadcn & Radix UI components for accessible UI
- React Query for server state management
- Framer Motion for animations

### Backend
- Rust backend via Tauri 2
- Async runtime with Tokio
- Protocol Buffer support for Steam API
- Security-focused token management

### Desktop Framework
- Tauri 2 with native platform integration
- Cross-platform tray icon support
- File system access with proper sandboxing
- Window management and lifecycle control

## Requirements

- Node.js >= 18
- pnpm (or npm/yarn)
- Rust >= 1.70
- Platform-specific requirements:
  - Windows: Visual Studio Build Tools or similar
  - Linux: GTK development libraries
  - macOS: Xcode Command Line Tools

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/prenaissance/steam-desktop-authenticator-rs.git
cd steam-desktop-authenticator-rs
```

2. Install dependencies:
```bash
pnpm install
```

3. Development server:
```bash
pnpm tauri dev
```

4. Production build:
```bash
pnpm build
pnpm tauri build
```

### Build Output
- Windows: `.msi` installer
- Linux: `.AppImage` and `.deb` packages
- macOS: `.dmg` disk image and `.app` bundle

## Usage

### Getting Started

1. **Launch the application** - The window will appear in a compact 320x600 format
2. **Add an account** - Login with your Steam credentials along with:
   - Shared Secret (from mafile)
   - Identity Secret (from mafile)
3. **Switch accounts** - Use the account selector to manage multiple Steam accounts
4. **Generate codes** - View current TOTP in the main window

### Features Guide

#### TOTP Authentication
- Automatic time-based code generation
- 30-second refresh cycle
- Copy-to-clipboard functionality
- Real-time countdown display

#### Trade Confirmations
- View pending trade offers
- Accept or reject confirmations
- See confirmation details (items, prices, partners)
- Batch confirmation management

#### Session Approvals
- Approve login attempts from new devices
- View session details (location, device, platform)
- Deny suspicious login attempts
- Manage persistent vs ephemeral sessions

#### Market Sales
- Monitor active market listings
- Quick confirmation for sale completions
- Price verification before acceptance

## Configuration

The application stores user data locally in:
- Windows: `%APPDATA%/steam-desktop-authenticator-rs`
- Linux: `~/.config/steam-desktop-authenticator-rs`
- macOS: `~/Library/Application Support/steam-desktop-authenticator-rs`

Configuration is automatically managed and includes:
- Account credentials (encrypted storage)
- Active account preference
- Application preferences

## Development

### Project Structure

```
src/                    # Frontend (React/TypeScript)
├── api/               # Tauri command interfaces
├── components/        # Reusable React components
├── pages/             # Page-level components
├── stores/            # State management
├── utilities/         # Helper functions
└── hooks/             # Custom React hooks

src-tauri/            # Backend (Rust)
├── src/
│   ├── auth/          # Authentication commands
│   ├── account/       # Account management
│   ├── confirmations/ # Trade/market confirmations
│   ├── authentication_approvals/ # Session approvals
│   └── steamapi/      # Steam API integration
└── Cargo.toml         # Rust dependencies
```

### Available Scripts

```bash
# Development
pnpm dev              # Start frontend dev server
pnpm tauri dev        # Run desktop app in dev mode

# Building
pnpm build            # Build frontend
pnpm tauri build      # Create desktop bundle

# Code Quality
pnpm lint             # Run linter (Biome)
pnpm lint:fix         # Auto-fix linting issues
pnpm format           # Format code

# Maintenance
pnpm prepare          # Setup git hooks
```

### Code Standards

- **Linter**: Biome (configured for strict mode)
- **Commit Format**: Conventional Commits (enforced via commitlint)
- **TypeScript**: Strict mode enabled
- **Rust**: Edition 2024, standard linting

### Git Workflow

The project uses Husky for pre-commit hooks:
- Automatic linting and formatting before commits
- Commit message validation
- Proper hook initialization on clone

## Security Considerations

- Credentials are stored locally only
- Session tokens are properly managed with refresh logic
- Access tokens have configurable expiration
- Device details are automatically included for tracking
- No data is sent to third-party servers except Steam's API

## API Reference

### Frontend Commands (Tauri Invoke)

#### Authentication
- `login(payload: LoginRequest)` - Login with credentials
- `get_otp()` - Get current TOTP code

#### Account Management
- `get_accounts()` - List all stored accounts
- `get_active_account()` - Get current account
- `is_logged_in()` - Check login status
- `get_profile()` - Get account profile details

#### Confirmations
- `get_confirmations()` - Fetch pending confirmations
- `get_confirmation_details(payload)` - Get confirmation details
- `accept_confirmation(payload)` - Accept a confirmation
- `deny_confirmation(payload)` - Reject a confirmation

#### Session Approvals
- `get_sessions()` - List active login sessions
- `approve_session(payload)` - Approve a session
- `deny_session(payload)` - Deny a session

## Troubleshooting

### App won't start
- Ensure all dependencies are installed: `pnpm install`
- Check Rust toolchain: `rustup update`
- Review logs in `%APPDATA%/steam-desktop-authenticator-rs/logs`

### Authentication fails
- Verify shared secret and identity secret are correctly formatted (base64)
- Ensure Steam credentials are correct

### Confirmations won't load
- Refresh the application
- Verify session is still active
- Check if Steam requires re-authentication

### Build issues on Linux
- Install required dependencies: `sudo apt install libgtk-3-dev libssl-dev`
- Update your Rust toolchain: `rustup update`

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit with conventional format
3. Push and create a pull request
4. Ensure CI checks pass

## License

This project is open source. Check the LICENSE file for details.

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for common problems
- Provide logs and system information when reporting bugs