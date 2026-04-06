# Payment Checkout App - AI-Driven Test Automation

Production-ready payment checkout application with AI-generated Playwright tests and automated quality gates

## 🚀 Features

- **AI-Generated Tests** - LLM-driven test generation from Swagger/API specs
- **Automated Quality Gate** - CI pipeline blocks bad code from production
- **API Testing** - Auto-generated from OpenAPI/Swagger specs
- **E2E Testing** - Stable UI tests with smart selector strategy
- **TypeScript** - Full type safety with Page Object Model
- **GitHub Actions** - 4-stage pipeline: API → E2E → Quality Gate → Deploy

---

## 🤖 AI-Driven Test Generation

### 1. **LLM Prompt Design Strategy**

The CI pipeline uses structured prompts to generate tests:

```
Context: Payment checkout app (Go backend + Next.js frontend)
Input: Swagger/OpenAPI spec + UI requirements
Output: Type-safe Playwright tests with validations
```

**Key Prompt Elements:**
- API contract (Swagger JSON)
- Expected behaviors (success/error scenarios)
- Test data requirements (valid/invalid inputs)
- Selector stability rules (data-testid > semantic > class)

### 2. **Swagger → Playwright Translation**

**Process:**
1. **Parse Swagger** → Extract endpoints, request/response schemas
2. **Generate API Helpers** → Type-safe request methods with validation
3. **Create Test Cases** → Cover success, validation errors, edge cases
4. **Add Assertions** → Status codes, response structure, business logic

**Example:**
```
Swagger: POST /api/validate-email {email: string}
Generated: validateEmail(email) → expect 200/400, validate message
```

### 3. **Test Generation Workflow**

```
┌─────────────────┐
│ Swagger Spec    │
│ UI Requirements │
└────────┬────────┘
         ↓
┌─────────────────┐
│ LLM Prompt      │ ← Instructions + Examples
└────────┬────────┘
         ↓
┌─────────────────┐
│ Generated Tests │
│ - API helpers   │
│ - Page objects  │
│ - Test specs    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Human Review    │ ← Verify logic + edge cases
└────────┬────────┘
         ↓
┌─────────────────┐
│ Commit to Repo  │
└─────────────────┘
```

**Why commit generated tests?**
- Version control for test changes
- No regeneration in CI (faster builds)
- Human review catches hallucinations
- Stability over time

---

## 🚦 CI Quality Gate

### 4. **How CI Blocks Bad Code**

**Pipeline Flow:**
```
PR/Push → API Tests (parallel) → Quality Gate → Deploy
              ↓         ↓              ↓           ↓
          E2E Tests  Pass/Fail    Evaluate    Main only
                                    ↓
                              All Pass? ✅
                              Any Fail? ❌ BLOCK
```

**Quality Gate Logic:**
1. Download test artifacts (JUnit XML)
2. Check for failures: `grep 'failures="[1-9]'`
3. Exit 1 if any failures → Blocks merge/deploy
4. Comment on PR with results table

**Deploy Condition:**
```yaml
if: main branch + push + quality-gate.result == 'success'
```

---

## � Scaling to Many Endpoints

### 5. **Multi-Endpoint Strategy**

**Organization:**
```
tests/
├── api/
│   ├── health.spec.ts           # 1 endpoint
│   ├── validate-email.spec.ts   # 1 endpoint
│   ├── validate-card.spec.ts    # 1 endpoint
│   └── checkout.spec.ts         # 1 endpoint
└── e2e/
    └── checkout-flow.spec.ts    # Full user journey
```

**Scaling Approach:**
- **1 test file per endpoint** (maintainability)
- **Shared helpers** (DRY principle)
- **Parallel execution** (speed)
- **Test tags** (run subsets: `@smoke`, `@regression`)

**For 100+ endpoints:**
- Group by domain (payments, users, orders)
- Use data-driven tests (loop through scenarios)
- Generate from Swagger tags/operations
- Cache responses for dependent tests

---

## ✅ Preventing AI Hallucinations

### 6. **Validation Strategy**

**Detection Methods:**

1. **Schema Validation**
   ```typescript
   // LLM must match Swagger types
   expect(response.data).toMatchSchema(swaggerSchema);
   ```

2. **Human Review Checklist**
   - [ ] Endpoints match Swagger exactly
   - [ ] Assertions test business logic (not just 200 OK)
   - [ ] Edge cases covered (empty, null, invalid)
   - [ ] Error messages validated

3. **Contract Testing**
   ```typescript
   // Fail if API changes without updating tests
   expect(response).toHaveProperty('expectedField');
   ```

4. **Comparison Testing**
   - Run tests against known-good baseline
   - Flag differences for review

**Red Flags:**
- ❌ Hardcoded values without source
- ❌ Missing error scenarios
- ❌ Generic assertions (`expect(true).toBe(true)`)
- ❌ No validation of response structure

---

## 🔧 Handling Flaky Tests

### 7. **Flaky Test Management**

**Prevention:**
```typescript
// ❌ BAD: Fixed timeouts
await page.waitForTimeout(3000);

// ✅ GOOD: Wait for actual state
await page.waitForSelector('[data-testid="result"]', {state: 'visible'});
```

**Detection:**
- Run tests 3x in CI (`retries: 2`)
- Track pass/fail patterns
- Alert on >10% flake rate

**Resolution:**
1. **Identify source**: Network, timing, test data
2. **Fix root cause**: Use smart waits, isolate tests
3. **Quarantine if needed**: Tag `@flaky`, skip in main pipeline
4. **Monitor**: Re-enable after 3 stable runs

**Flaky Test Script:**
```bash
npm run detect:flaky  # Runs tests 10x, reports flake rate
```

---

## 🎯 E2E Selector Stability

### 8. **LLM Selector Generation**

**Selector Priority (LLM follows this order):**

1. **Data-testid** (most stable)
   ```typescript
   page.locator('[data-testid="email-input"]')
   ```

2. **Semantic selectors** (accessible + stable)
   ```typescript
   page.getByRole('button', {name: 'Complete Payment'})
   page.getByLabel('Email Address')
   ```

3. **Name attribute** (form fields)
   ```typescript
   page.locator('input[name="cardNumber"]')
   ```

4. **Avoid:** Classes, XPath, text content (brittle)

**LLM Prompt Instruction:**
```
"Generate selectors using:
1. data-testid if available
2. getByRole/getByLabel for semantics
3. name attribute for inputs
Never use: CSS classes, complex XPath, text matching"
```

**Validation:**
- LLM must explain selector choice
- Human review flags fragile selectors
- CI fails if selectors change unexpectedly

---

## 🛡️ Preventing Flaky Frontend Tests

### 9. **Frontend Stability Techniques**

**1. Smart Waits (No Arbitrary Timeouts)**
```typescript
// Wait for network idle
await page.goto('/', {waitUntil: 'domcontentloaded'});

// Wait for spinner to disappear
await page.locator('[data-loading]').waitFor({state: 'hidden'});

// Wait for API response
await page.waitForResponse(resp => resp.url().includes('/api/'));
```

**2. Centralized Timeout Config**
```typescript
class TimeoutConfig {
  static DEBOUNCE = 100ms;
  static VALIDATION = 3000ms;
  static PAGE_LOAD = 5000ms;
}
```

**3. Stable State Detection**
```typescript
// ❌ BAD: Wait fixed time after blur
await emailInput.blur();
await page.waitForTimeout(1500);

// ✅ GOOD: Wait for validation complete
await emailInput.blur();
await page.locator('.validation-spinner').waitFor({state: 'hidden'});
```

**4. Retry Logic for Network**
```typescript
await test.step('Submit payment', async () => {
  await expect(async () => {
    await page.click('[data-testid="submit"]');
    await expect(successMessage).toBeVisible();
  }).toPass({timeout: 10000, intervals: [1000, 2000]});
});
```

**5. Isolation (Test Data)**
```typescript
// Generate unique data per test
const email = `test-${Date.now()}@example.com`;
```

---

## 🏃‍♂️ Running Tests

```bash
# Run all tests
npm test

# Run API tests only
npm run test:api

# Run E2E tests only
npm run test:e2e

# Run E2E with visible browser
npm run test:e2e:headed

# Debug mode
npm run test:debug

# View HTML report
npm run report
```

---

## 📁 Project Structure

```
payment-checkout-app/
├── .github/
│   └── workflows/
│       └── workflow.yml              # 4-stage CI/CD pipeline
├── application_code/
│   ├── main.go                       # Go backend API
│   ├── app/page.tsx                  # Next.js frontend
│   └── docs/swagger.json             # OpenAPI spec
├── playwright_template/
│   ├── tests/
│   │   └── generated_test/
│   │       ├── api/                  # AI-generated API tests
│   │       │   └── payment-api.spec.ts
│   │       └── e2e/                  # AI-generated E2E tests
│   │           └── checkout-e2e.spec.ts
│   ├── page-objects/generated/       # Stable selectors
│   │   └── checkout-page.ts
│   ├── utils/generated/
│   │   ├── payment-api-helper.ts     # Type-safe API client
│   │   └── timeout-config.ts         # Centralized timeouts
│   ├── data/
│   │   ├── testData_001.json         # Test scenarios
│   │   └── helpers/
│   │       ├── uiLabels.ts           # UI text enums
│   │       └── apiMessages.ts        # API message enums
│   ├── config/environment.ts         # Environment config
│   ├── playwright.config.ts          # Test config
│   └── .env                          # Local environment vars
├── LLM_instructions.txt              # Prompt for test generation
└── README.md                         # This file
```

---

## � Key Design Decisions

### Why AI-Generated Tests Are Committed
- **Version control** - Track test changes over time
- **No CI regeneration** - Faster, more predictable builds
- **Human review** - Catch hallucinations before merge
- **Stability** - Tests don't change unless code changes

### Why Page Object Model
- **Selector stability** - Change once, fix everywhere
- **Readability** - `checkout.fillEmail()` vs `page.fill('...')`
- **Reusability** - Share methods across tests

### Why Separate API + E2E Jobs
- **Parallel execution** - Faster feedback (API: 1s, E2E: 15s)
- **Clear failure isolation** - Know if backend or frontend broke
- **Independent retry** - Retry only failed job type

---

## �️ Installation & Setup

```bash
# 1. Clone repository
git clone https://github.com/gsyahmia/payment-checkout-app.git
cd payment-checkout-app

# 2. Install backend dependencies
cd application_code
go mod download
npm ci

# 3. Install test dependencies
cd ../playwright_template
npm ci
npx playwright install --with-deps chromium

# 4. Setup environment
cp .env.example .env

# 5. Start services (in separate terminals)
# Terminal 1: Go backend
cd application_code
go run main.go

# Terminal 2: Next.js frontend
cd application_code
npm run dev

# Terminal 3: Run tests
cd playwright_template
npm test
```

