# AI Chat Application

A modern, full-stack AI chat application built with Next.js 15, featuring multiple AI models, user authentication, and persistent chat history.

## ✨ Features

- 🤖 **Multiple AI Models**: Support for DeepSeek, Qwen, Z.AI, and other models via OpenRouter
- 🔐 **User Authentication**: Secure login with Google, GitHub, and email/password
- 💬 **Real-time Chat**: Interactive chat interface with message history
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 💾 **Persistent Storage**: Chat history saved to MongoDB database
- 🎨 **Modern UI**: Clean, intuitive interface with dark/light mode support
- ⚡ **Fast Performance**: Built with Next.js 15 and Turbopack

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB database
- OpenRouter API key (for AI models)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd next-js-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGO_HOST=your-mongodb-connection-string
   JWT_SECRET=your-jwt-secret
   
   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret
   
   # OAuth Providers (Optional)
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GITHUB_ID=your-github-client-id
   GITHUB_SECRET=your-github-client-secret
   
   # AI Models (OpenRouter)
   OPENAI_API_KEY=your-openrouter-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # Authentication API routes
│   │   ├── chat/                   # Chat API endpoints
│   │   └── users/                  # User management API
│   ├── chat/                       # Main chat interface
│   ├── login/                      # Login page
│   ├── signup/                     # Signup page
│   └── components/                 # Reusable components
├── dbConfig/                       # Database configuration
├── models/                         # MongoDB schemas
└── types/                          # TypeScript type definitions
```

## 🤖 Supported AI Models

The application supports multiple AI models through OpenRouter:

- **DeepSeek V3 0324**: Most capable model for complex tasks
- **Qwen3 Coder**: Fast and efficient for coding tasks
- **DeepSeek R1 0528**: High-performance reasoning model
- **DeepSeek R1**: Balanced performance and speed
- **Z.AI GLM 4.5 Air**: Advanced language model

## 🔧 Configuration

### Authentication Setup

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **GitHub OAuth**:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create new OAuth App
   - Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### Database Setup

1. **MongoDB Atlas** (Recommended):
   - Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Get your connection string
   - Add it to your `.env` file

2. **Local MongoDB**:
   - Install MongoDB locally
   - Use connection string: `mongodb://localhost:2700/your-database`

### AI Models Setup

1. **OpenRouter**:
   - Sign up at [OpenRouter](https://openrouter.ai/)
   - Get your API key
   - Add it to your `.env` file as `OPENAI_API_KEY`

## 📱 Usage

1. **Sign Up/Login**: Create an account or sign in with OAuth providers
2. **Select Model**: Choose from available AI models in the dropdown
3. **Start Chatting**: Send messages and get AI responses
4. **View History**: Access your previous conversations
5. **Clear Chat**: Start fresh conversations when needed

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Adding New AI Models

1. Update the `availableModels` array in `src/app/chat/page.tsx`
2. Ensure the model ID matches OpenRouter's model identifiers
3. Test the integration

### Customizing the UI

The application uses Tailwind CSS for styling. Key components:
- Chat interface: `src/app/chat/page.tsx`
- Authentication pages: `src/app/login/` and `src/app/signup/`
- API routes: `src/app/api/`

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing with bcrypt
- OAuth integration for social login
- API route protection
- Environment variable protection

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include your environment details and error logs

## 🔗 Links

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [OpenRouter API Documentation](https://openrouter.ai/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)

---

Built with ❤️ using Next.js, NextAuth.js, and OpenRouter
