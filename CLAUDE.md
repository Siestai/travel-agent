# CLAUDE.md

## Project Overview

This is a **Next.js AI Chatbot** application built with modern web technologies and AI capabilities. The project is a comprehensive chat application that supports multiple AI models, document creation and editing, and various artifact types for content generation.

## Key Features

### 🤖 AI Chat Capabilities

- **Multi-Model Support**: Uses Vercel AI Gateway with xAI models (Grok-2-vision-1212, Grok-3-mini) as default
- **Reasoning Mode**: Advanced chain-of-thought reasoning for complex problems
- **Vision Support**: Multimodal capabilities for image understanding and generation
- **Streaming Responses**: Real-time streaming of AI responses for better user experience

### 📝 Document & Artifact System

- **Text Documents**: Rich text editing with markdown support and AI-powered suggestions
- **Code Artifacts**: Code generation and editing with syntax highlighting and execution capabilities
- **Image Generation**: AI-powered image creation and editing tools
- **Spreadsheet Management**: Data manipulation, analysis, and visualization tools

### 🔐 Authentication & User Management

- **Dual User Types**: Regular users and guest users
- **Secure Authentication**: NextAuth.js with credential-based authentication
- **User Registration**: Email/password registration system
- **Session Management**: Persistent user sessions with JWT tokens

### 💾 Data Persistence

- **PostgreSQL Database**: Neon Serverless Postgres for data storage
- **File Storage**: Vercel Blob for efficient file management
- **Chat History**: Persistent conversation storage with versioning
- **Document Management**: Full CRUD operations for documents and artifacts

## Technical Stack

### Frontend

- **Next.js 15** with App Router and React Server Components
- **React 19** with modern hooks and concurrent features
- **TypeScript** for type safety and better development experience
- **Tailwind CSS** for styling with shadcn/ui components
- **Framer Motion** for animations and transitions

### Backend

- **Next.js API Routes** for server-side logic
- **Drizzle ORM** for database operations
- **NextAuth.js** for authentication
- **AI SDK** for AI model integration
- **Vercel AI Gateway** for model routing

### AI & ML

- **Vercel AI SDK** for unified AI model access
- **xAI Integration** with Grok models
- **Streaming Support** for real-time responses
- **Tool Calling** for AI function execution

### Database & Storage

- **PostgreSQL** with Drizzle ORM
- **Vercel Blob** for file storage
- **Redis** for caching (optional)

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   └── (chat)/            # Chat application routes
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── elements/         # Chat-specific components
├── lib/                  # Utility libraries
│   ├── ai/              # AI-related utilities
│   ├── db/              # Database schema and queries
│   └── artifacts/       # Artifact system
├── artifacts/           # Artifact implementations
│   ├── text/           # Text document artifacts
│   ├── code/           # Code artifacts
│   ├── image/          # Image artifacts
│   └── sheet/          # Spreadsheet artifacts
└── hooks/              # Custom React hooks
```

## Available AI Tools

### 1. Document Creation (`createDocument`)

- Creates various types of documents (text, code, image, sheet)
- Supports streaming content generation
- Integrated with artifact system

### 2. Document Updates (`updateDocument`)

- Updates existing documents based on descriptions
- Maintains document history and versioning
- Supports all artifact types

### 3. Suggestion System (`requestSuggestions`)

- AI-powered writing suggestions
- Context-aware improvement recommendations
- Integrated with text editor

### 4. Weather Information (`getWeather`)

- Real-time weather data retrieval
- Supports city names and coordinates
- Uses Open-Meteo API

## Artifact Types

### Text Artifacts

- **Rich Text Editing**: ProseMirror-based editor
- **Markdown Support**: Full markdown rendering
- **AI Suggestions**: Writing improvement recommendations
- **Version Control**: Document history and diff viewing

### Code Artifacts

- **Multi-Language Support**: JavaScript, Python, and more
- **Syntax Highlighting**: CodeMirror integration
- **Execution Capabilities**: Code running and testing
- **Import Detection**: Automatic dependency detection

### Image Artifacts

- **AI Generation**: Text-to-image creation
- **Image Editing**: Basic editing capabilities
- **Version Management**: Image history tracking
- **Export Options**: Multiple format support

### Sheet Artifacts

- **Data Manipulation**: Spreadsheet functionality
- **CSV Import/Export**: Data format conversion
- **AI Analysis**: Data insights and visualization
- **Formatting Tools**: Data cleaning and organization

## Database Schema

### Core Tables

- **User**: User accounts and authentication
- **Chat**: Conversation management
- **Message**: Chat messages with parts and attachments
- **Document**: Artifact storage and metadata
- **Suggestion**: AI-generated writing suggestions
- **Vote**: Message rating system

### Key Features

- **UUID Primary Keys**: Secure, unique identifiers
- **Foreign Key Relationships**: Data integrity
- **JSON Support**: Flexible content storage
- **Timestamp Tracking**: Creation and modification times

## Development Setup

### Prerequisites

- Node.js 18+
- pnpm package manager
- PostgreSQL database
- Vercel account (for AI Gateway)

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linting with Ultracite
- `pnpm format` - Format code with Ultracite
- `pnpm test` - Run Playwright tests
- `pnpm db:studio` - Open Drizzle Studio

## Code Quality & Standards

### Ultracite Integration

- **Zero Configuration**: Automatic code formatting and linting
- **Type Safety**: Strict TypeScript enforcement
- **Accessibility**: WCAG compliance checking
- **Performance**: Subsecond formatting and linting

### Key Rules

- **Accessibility First**: All components must be accessible
- **Type Safety**: No `any` types allowed
- **Consistent Styling**: Tailwind CSS with design system
- **Error Handling**: Comprehensive error management
- **Testing**: Playwright for E2E testing

## Deployment

### Vercel Deployment

- **One-Click Deploy**: Vercel template integration
- **Environment Variables**: Automatic configuration
- **AI Gateway**: Built-in model access
- **Database**: Neon Postgres integration

### Environment Variables

- `AI_GATEWAY_API_KEY` - For non-Vercel deployments
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Authentication secret
- `NEXTAUTH_URL` - Application URL

## API Endpoints

### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/guest` - Guest user creation

### Chat

- `POST /api/chat` - Send message and get AI response
- `GET /api/history` - Retrieve chat history
- `POST /api/vote` - Rate messages

### Documents

- `POST /api/document` - Create new document
- `PUT /api/document` - Update existing document
- `GET /api/suggestions` - Get writing suggestions

## Contributing

### Code Style

- Follow Ultracite rules strictly
- Use TypeScript for all new code
- Write accessible components
- Include proper error handling

### Testing

- Write E2E tests for new features
- Test accessibility compliance
- Verify AI tool functionality
- Test artifact creation and editing

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For questions and support:

- Check the documentation at [chat-sdk.dev](https://chat-sdk.dev)
- Review the README.md for setup instructions
- Examine the codebase for implementation examples
- Use the built-in AI assistant for development help

---

_This CLAUDE.md file provides a comprehensive overview of the project structure, features, and development guidelines. It serves as a reference for developers working on the codebase and helps understand the full scope of the application's capabilities._
