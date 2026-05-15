# Visionco AI API ⚡

Standalone Node.js + Express API powered by Groq AI for intelligent video search, summarization, and recommendations.

## Features
- **Security**: Helmet, CORS, and Rate Limiting.
- **Validation**: Strict input validation using Joi.
- **AI Backend**: Integrated with Groq SDK (Llama 3).
- **Production-Ready**: Centralized error handling and JSON body limits.

## Prerequisites
- Node.js (v18+)
- Groq API Key

## Local Setup

1. **Clone and Enter Directory**
   ```bash
   cd visionco-ai-api
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
   Add your `GROQ_API_KEY` to the `.env` file.

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   The API will be available at `http://localhost:3001`.

## API Endpoints

### Health Check
- `GET /health`
- Returns status and timestamp.

### AI Search
- `POST /v1/search`
- **Body**: `{ "query": "string", "clientId": "string" }`
- Returns intelligent search results.

### AI Summarize
- `POST /v1/summarize`
- **Body**: `{ "url": "string", "clientId": "string" }`
- Returns video summary, key points, and topics.

### AI Recommend
- `POST /v1/recommend`
- **Body**: `{ "clientId": "string", "watchHistory": ["string"] }`
- Returns personalized recommendations.

## Deployment with PM2

To run the API in a production environment:

1. **Install PM2 Globally**
   ```bash
   npm install pm2 -g
   ```

2. **Start the Application**
   ```bash
   pm2 start src/app.js --name "visionco-ai-api"
   ```

3. **Persistence**
   ```bash
   pm2 save
   pm2 startup
   ```

## Nginx Reverse Proxy Configuration

To expose the API securely over port 80/443, use Nginx:

```nginx
server {
    listen 80;
    server_name api.visionco.ai;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
