# Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint

# Code Style Guidelines
- **Imports**: Group imports by type (React, then third-party libraries, then local files)
- **TypeScript**: Use strict type checking, avoid `any` types when possible
- **Naming**: Use camelCase for variables/functions, PascalCase for components/interfaces
- **Components**: Use functional components with hooks, not class components
- **Formatting**: Follow NextJS conventions, use 2-space indentation
- **Error Handling**: Use proper error boundaries and fallbacks for API calls
- **State Management**: Prefer React hooks (useState, useContext) for state
- **Styling**: Use Tailwind CSS with consistent class ordering
- **Animation**: Use Framer Motion for animations
- **API**: Use the Edge runtime for API routes when possible

This is a NextJS project that implements a Perplexity-style chat interface with animated text streaming.