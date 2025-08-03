# LLM Chat Integration Guide

This chat application is configured to use OpenRouter for accessing multiple AI models. The integration is already set up and working!

## 🎯 Current Setup

Your application is currently using **OpenRouter** as the AI model provider, which gives you access to multiple AI models through a single API.

### ✅ What's Already Configured

- **OpenRouter Integration**: Using OpenRouter's API for model access
- **Multiple Models**: DeepSeek, Qwen, Z.AI models are available
- **API Routes**: Chat API is properly configured
- **Model Selection**: UI allows switching between different models

## 🔧 Current Configuration

### Environment Variables
Your `.env` file should contain:
```env
OPENAI_API_KEY=your-openrouter-api-key
```

### Available Models
The application currently supports these models:
- `deepseek/deepseek-chat-v3-0324:free` - DeepSeek V3 0324
- `qwen/qwen3-coder:free` - Qwen3 Coder
- `deepseek/deepseek-r1-0528:free` - DeepSeek R1 0528
- `deepseek/deepseek-r1:free` - DeepSeek R1
- `z-ai/glm-4.5-air:free` - Z.AI GLM 4.5 Air

## 🚀 Getting Started with OpenRouter

### 1. Get Your API Key

1. **Sign up** at [OpenRouter](https://openrouter.ai/)
2. **Navigate** to your dashboard
3. **Copy** your API key
4. **Add** it to your `.env` file as `OPENAI_API_KEY`

### 2. Test Your Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/chat`
3. Sign in with your account
4. Try sending a message - you should get a real AI response!

## 🔄 Adding New Models

### Step 1: Find Available Models

Visit [OpenRouter Models](https://openrouter.ai/models) to see all available models.

### Step 2: Update Model List

Edit `src/app/chat/page.tsx` and add new models to the `availableModels` array:

```typescript
const availableModels: Model[] = [
  // ... existing models ...
  {
    id: 'anthropic/claude-3.5-sonnet:free',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic\'s latest model',
    maxTokens: 200000
  },
  {
    id: 'openai/gpt-4o-mini:free',
    name: 'GPT-4o Mini',
    description: 'OpenAI\'s efficient model',
    maxTokens: 16384
  }
];
```

### Step 3: Test the New Model

1. Restart your development server
2. Select the new model from the dropdown
3. Send a test message

## 🔧 Advanced Configuration

### Custom Model Parameters

You can customize model behavior by modifying the API call in `src/app/api/chat/route.ts`:

```typescript
const completion = await openai.chat.completions.create({
  model: model || "deepseek/deepseek-r1:free",
  messages: formattedMessages,
  max_tokens: maxTokens || 2000,
  temperature: 0.7,        // Adjust creativity (0.0-2.0)
  top_p: 0.9,             // Adjust response diversity
  frequency_penalty: 0.0,  // Reduce repetition
  presence_penalty: 0.0,   // Encourage new topics
});
```

### Model-Specific Settings

You can add model-specific configurations:

```typescript
const getModelConfig = (modelId: string) => {
  switch (modelId) {
    case 'deepseek/deepseek-chat-v3-0324:free':
      return { temperature: 0.8, max_tokens: 8192 };
    case 'qwen/qwen3-coder:free':
      return { temperature: 0.2, max_tokens: 4096 };
    default:
      return { temperature: 0.7, max_tokens: 2000 };
  }
};

const config = getModelConfig(model);
const completion = await openai.chat.completions.create({
  model,
  messages: formattedMessages,
  ...config
});
```

## 🛠️ Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Check that your OpenRouter API key is correct
   - Ensure it's added to your `.env` file
   - Restart your development server

2. **"Model Not Found" Error**
   - Verify the model ID is correct
   - Check if the model is available on OpenRouter
   - Some models may require paid credits

3. **Rate Limiting**
   - OpenRouter has rate limits for free tier
   - Consider upgrading for higher limits
   - Implement retry logic for failed requests

### Error Handling

The current implementation includes basic error handling. You can enhance it:

```typescript
try {
  const completion = await openai.chat.completions.create({
    // ... configuration
  });
  return NextResponse.json(completion);
} catch (error: any) {
  console.error('OpenRouter API error:', error);
  
  if (error.status === 429) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  if (error.status === 401) {
    return NextResponse.json(
      { error: 'Invalid API key. Please check your OpenRouter configuration.' },
      { status: 401 }
    );
  }
  
  if (error.status === 400) {
    return NextResponse.json(
      { error: 'Invalid request. Please check your message format.' },
      { status: 400 }
    );
  }
  
  return NextResponse.json(
    { error: 'Failed to get response from AI model.' },
    { status: 500 }
  );
}
```

## 📊 Monitoring Usage

### Track API Usage

OpenRouter provides usage analytics in your dashboard:
- Token consumption
- Cost tracking
- Request history
- Model performance

### Implement Usage Tracking

You can track usage in your application:

```typescript
// In your chat API route
const completion = await openai.chat.completions.create({
  // ... configuration
});

// Log usage for monitoring
console.log('Token usage:', {
  prompt_tokens: completion.usage?.prompt_tokens,
  completion_tokens: completion.usage?.completion_tokens,
  total_tokens: completion.usage?.total_tokens,
  model: model,
  user: session.user.email
});
```

## 🔒 Security Best Practices

1. **Never expose API keys** in client-side code
2. **Use environment variables** for all sensitive data
3. **Implement rate limiting** to prevent abuse
4. **Monitor usage** to detect unusual patterns
5. **Validate user input** before sending to API

## 🚀 Production Deployment

### Environment Variables

For production, ensure these are set:
```env
OPENAI_API_KEY=your-openrouter-api-key
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secure-secret
MONGO_HOST=your-mongodb-connection-string
```

### Performance Optimization

1. **Implement caching** for frequent requests
2. **Add request queuing** for high traffic
3. **Monitor response times** and optimize
4. **Use streaming responses** for better UX

## 📚 Additional Resources

- [OpenRouter Documentation](https://openrouter.ai/docs)
- [OpenRouter Models](https://openrouter.ai/models)
- [OpenRouter Pricing](https://openrouter.ai/pricing)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)

---

Your chat application is now fully integrated with OpenRouter and ready to use! 🎉 