# AGENTS.md — Binding Engineering Constitution

## Project
"VarshaMitra" — a GenAI monsoon preparedness & citizen assistance assistant for India.
Vertical: Individuals, Families & Communities (Citizen Persona).

## Non-negotiable constraints
- Repo must stay < 10 MB. No images, no fonts, no binaries, no lockfile bloat, no heavy deps.
- Single branch (`main`). No extra branches, ever.
- Dependencies allowed: react, react-dom, lucide-react, express, compression, helmet,
  express-rate-limit, @google/genai, vite, @vitejs/plugin-react, typescript.
  Adding ANY other dependency requires you to first state the size cost and justify it.
- Tests use ONLY the Node native test runner (`node --test`). No Jest, no Vitest.

## Architecture rules (enforced on every file you write)
- Strict layering, one-way dependencies:
  domain/ (pure logic, zero I/O) -> services/ (I/O: weather, gemini, cache) -> routes/ (HTTP) -> client/
  domain/ MUST NOT import express, fetch, or any SDK. This makes it 100% unit-testable.
- No file over 180 lines. No function over 40 lines. No component over 120 lines.
- Every exported function has a JSDoc block: purpose, @param, @returns, @throws.
- Named exports only. No default exports except React page components.
- All magic numbers/strings live in `src/config/constants.ts`. Zero hardcoded values elsewhere.
- Typed errors: `AppError`, `UpstreamError`, `ValidationError` in `src/domain/errors.ts`.
  Never throw bare strings. Never `catch {}` silently.
- No `any`. `strict: true` in tsconfig.

## Safety rules (life-critical product)
- The AI NEVER invents weather data, alert levels, or emergency numbers. Those come from
  deterministic code and a static verified dataset. Gemini only *explains and personalises*.
- If Gemini fails, times out, or returns invalid JSON, the app MUST still produce a complete,
  useful plan from the deterministic rule engine. Degradation is silent to the user, logged on server.
- Every AI-generated screen shows: "AI guidance — always follow IMD & local authority orders."

## Definition of Done (I will reject work that misses any of these)
1. Code compiles with zero TS errors.
2. `npm test` passes and covers the new logic.
3. JSDoc present. No file exceeds limits above.
4. Accessible: keyboard reachable, ARIA-labelled, contrast >= 4.5:1.
5. No secret, no key, no PII ever leaves the server or lands in git.
