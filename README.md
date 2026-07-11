# VarshaMitra 🌧️
### GenAI-Powered Monsoon Preparedness & Citizen Assistance System
VarshaMitra ("Rain Companion") is a secure, offline-first, highly responsive web application designed to help individuals, families, and communities prepare for, navigate, and recover from severe monsoon weather events in India.

---

## 🛠️ Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Vanilla CSS (Strict Design Tokens, WCAG AAA dark theme)
- **Backend**: Node.js, Express, Helmet (Strict CSP policies), Compression, Express Rate Limit
- **Generative AI**: Google Gemini 2.5 Flash (`@google/genai`) with structured JSON schema outputs
- **Database / Cache**: Custom in-memory LRU-TTL Cache (~1km coordinate resolution cache-sharing)
- **Testing**: Native Node.js Test Runner (`node --test`), 100% logic coverage, zero external test dependencies
- **PWA**: Installable web application with dynamic offline caching service workers

---

## 🏗️ Clean Architectural Layering
VarshaMitra is designed following strict domain-driven separation rules:
1. **Domain Layer (`src/domain/`)**: Pure, side-effect-free logic (types, custom errors, risk scoring engine, validator, static action library).
2. **Service Layer (`src/services/`)**: Interfaces with external systems (caching, Open-Meteo weather API mapping, Gemini API integration, retries, and deterministic fallbacks).
3. **Route/Server Layer (`src/server/`)**: Express API server, security middlewares, rate-limiters, and boot-time schema validations.
4. **Client UI Layer (`src/client/`)**: Modular React components, CSS variables, HTML5 Text-to-Speech (TTS), and local storage checklist trackers.

---

## 🔒 Security Hardening & Prompt Safety
- **Prompt Injection Defense**: User messages are encapsulated inside strict XML tags (`<user_message>`) and checked against blacklisted instruction-override regex patterns.
- **Boot Validation**: The server fails-fast immediately on startup if key environment secrets like `GEMINI_API_KEY` are missing.
- **Privacy Protection**: Rounds coordinates on the client and server to 2 decimal places (~1km) for privacy. Never logs household profile details.
- **Helmet Content Security Policy**: Connect-src limits requests exclusively to self and `https://api.open-meteo.com`.
- **Payload Limits**: Rejects payloads exceeding 8KB to mitigate Denial of Service (DoS) attacks.

---

## ⚡ Setup & Execution

### Prerequisites
- Node.js 20+

### Installation
```bash
npm install --legacy-peer-deps
```

### Local Development
1. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
2. Populate `GEMINI_API_KEY`.
3. Run the development server:
   ```bash
   npm run dev
   ```

### Run Tests
VarshaMitra contains a comprehensive native unit test suite verifying risk algorithms, validation boundaries, API endpoints, mock clock expiration, and language translation key-parity.
```bash
npm test
```

### Production Build & Compile
Bundles the React client using Vite and compiles the Express server using esbuild:
```bash
npm run build
npm start
```
