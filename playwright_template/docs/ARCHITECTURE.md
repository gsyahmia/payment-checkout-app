# Architecture Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Developer Workflow                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. Update Swagger Spec          2. Generate Tests                  │
│     └─ swagger.json              └─ npm run generate:api-tests      │
│                                                                      │
│  3. Run Validation               4. Run Tests Locally               │
│     └─ npm run validate:tests    └─ npm test                        │
│                                                                      │
│  5. Push to GitHub               6. CI Pipeline Triggers            │
│     └─ git push origin PR        └─ quality-gate.yml                │
└─────────────────────────────────────────────────────────────────────┘
```

## Test Generation Flow

```
┌──────────────────┐
│  Swagger.json    │  ← Source of Truth
│  (API Spec)      │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────┐
│ Swagger Parser               │
│ • Extract endpoints          │
│ • Extract schemas            │
│ • Extract examples           │
└────────┬─────────────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────────┐
│ Types  │ │ Test Cases   │
│ Gen    │ │ Generation   │
└───┬────┘ └──────┬───────┘
    │             │
    └──────┬──────┘
           ▼
    ┌──────────────┐
    │ Validator    │  ← Anti-Hallucination
    │ • Check      │
    │ • Verify     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Test Files   │
    │ ✅ Valid     │
    └──────────────┘
```

## E2E Test Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Test Layer                          │
│  generated_test/e2e/checkout-e2e.spec.ts              │
│  • Test scenarios                                      │
│  • Data-driven execution                               │
│  • Assertions                                          │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│              Page Object Layer                         │
│  page-objects/generated/checkout-page.ts              │
│  • Locators (stable selectors)                         │
│  • Actions (fill, click)                               │
│  • Validations (assertions)                            │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│                Data Layer                              │
│  data/testData_001.json    data/uiLabels.ts           │
│  • Test data               • UI text constants         │
│  • Expected results        • API messages              │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│              Application Under Test                    │
│  Frontend: localhost:3000   Backend: localhost:8080   │
└────────────────────────────────────────────────────────┘
```

## API Test Architecture

```
┌────────────────────────────────────────────────────────┐
│                    Test Layer                          │
│  generated_test/api/payment-api.spec.ts               │
│  • Positive tests                                      │
│  • Negative tests                                      │
│  • Performance tests                                   │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│               Helper Layer                             │
│  utils/generated/payment-api-helper.ts                │
│  • Request methods                                     │
│  • Response validation                                 │
│  • Schema validation                                   │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│            Type Definition Layer                       │
│  • PaymentRequest                                      │
│  • PaymentResponse                                     │
│  • EmailRequest/Response                               │
│  • CardRequest/Response                                │
│  (All generated from Swagger)                          │
└────────────────┬───────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────────────────┐
│              Backend API                               │
│  localhost:8080                                        │
│  • /api/health                                         │
│  • /api/validate-email                                 │
│  • /api/validate-card                                  │
│  • /api/checkout                                       │
└────────────────────────────────────────────────────────┘
```

## CI/CD Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                           │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            │               │               │
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────┐ ┌──────────────┐
    │ Generate     │ │ Start    │ │ Start        │
    │ Tests        │ │ Backend  │ │ Frontend     │
    └──────┬───────┘ └────┬─────┘ └──────┬───────┘
           │              │               │
           └──────────────┼───────────────┘
                          │
            ┌─────────────┴─────────────┐
            │                           │
            ▼                           ▼
    ┌──────────────┐          ┌──────────────┐
    │ API Tests    │          │ E2E Tests    │
    │ Parallel     │          │ Parallel     │
    └──────┬───────┘          └──────┬───────┘
           │                         │
           └──────────┬──────────────┘
                      ▼
            ┌──────────────────┐
            │ Quality Gate     │
            │ Decision         │
            └──────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
    ┌───────┐           ┌──────────┐
    │ PASS  │           │ FAIL     │
    │ ✅    │           │ ❌       │
    └───┬───┘           └──────────┘
        │                     │
        ▼                     │
    ┌────────────┐            │
    │ Deploy     │            │
    │ Production │            │
    └────────────┘            │
                              │
                    ┌─────────▼─────────┐
                    │ Block PR          │
                    │ Comment Results   │
                    └───────────────────┘
```

## Selector Stability Strategy

```
        Priority Order (Most Stable → Least Stable)
        
    ┌───────────────────────────────────────────────┐
    │ 1. data-testid="email-input"                  │  ← Best
    │    Purpose-built for testing                   │
    ├───────────────────────────────────────────────┤
    │ 2. input[name="email"]                        │  ← Good
    │    Functional attribute, rarely changes        │
    ├───────────────────────────────────────────────┤
    │ 3. getByRole('textbox', {name: 'Email'})     │  ← Good
    │    Semantic and accessible                     │
    ├───────────────────────────────────────────────┤
    │ 4. getByPlaceholder('you@example.com')        │  ← OK
    │    Visible text, may change                    │
    ├───────────────────────────────────────────────┤
    │ 5. .css-class-name                            │  ← Risky
    │    Changes with styling                        │
    ├───────────────────────────────────────────────┤
    │ 6. input:nth-child(2)                         │  ← Fragile
    │    Breaks if order changes                     │
    ├───────────────────────────────────────────────┤
    │ 7. /html/body/div[1]/input[2]                 │  ← Very Fragile
    │    XPath, breaks with any DOM change           │
    └───────────────────────────────────────────────┘
                                                        ↓ Worst
```

## Anti-Hallucination Validation Flow

```
┌──────────────────────────────────────────────────────┐
│ Generated Test                                       │
│ test('POST /api/refund', () => { ... })             │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ Validator: Extract Tested Endpoints                 │
│ Found: POST /api/refund                              │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ Validator: Check Against Swagger                    │
│ swagger.json paths:                                  │
│ • GET  /api/health          ✅                       │
│ • POST /api/validate-email  ✅                       │
│ • POST /api/validate-card   ✅                       │
│ • POST /api/checkout        ✅                       │
│ • POST /api/refund          ❌ NOT FOUND!            │
└───────────────────┬──────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│ ❌ VALIDATION FAILED                                 │
│                                                      │
│ Error: Hallucination Detected!                      │
│ Test references undocumented endpoint:               │
│   POST /api/refund                                   │
│                                                      │
│ This endpoint does not exist in Swagger.            │
│ Either:                                              │
│ 1. Add endpoint to Swagger first                     │
│ 2. Remove hallucinated test                          │
└──────────────────────────────────────────────────────┘
```

## Flakiness Detection Process

```
┌─────────────────────────────────────────────────┐
│ Run Test N Times (e.g., 20 iterations)         │
└──────────────────┬──────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
┌────────┐    ┌────────┐    ┌────────┐
│ Run 1  │    │ Run 2  │    │ Run N  │
│ ✅     │    │ ✅     │    │ ❌     │
└────────┘    └────────┘    └────────┘
    │              │              │
    └──────────────┼──────────────┘
                   ▼
        ┌──────────────────────┐
        │ Analyze Results      │
        │ Passed: 18/20        │
        │ Failed: 2/20         │
        └──────┬───────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
┌──────────┐   ┌──────────────┐
│ 0 fails  │   │ 1-N fails    │
│ ✅ STABLE│   │ ⚠️  FLAKY!   │
└──────────┘   └──────┬───────┘
                      │
                      ▼
        ┌──────────────────────────┐
        │ Report Flakiness         │
        │ • Failure rate: 10%      │
        │ • Review logs            │
        │ • Fix race conditions    │
        │ • Improve waits          │
        └──────────────────────────┘
```

## Data Flow in E2E Test

```
┌──────────────────────┐
│ testData_001.json    │
│ {                    │
│   email: "john@..."  │
│   cardNumber: "4242" │
│   ...                │
│ }                    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Test Spec                            │
│ const testData = testData.valid[0]   │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Page Object                          │
│ fillEmail(testData.email)            │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Locator                              │
│ page.locator('input[name="email"]')  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Action                               │
│ emailInput.fill("john@example.com")  │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Application                          │
│ Email field populated                │
│ Async validation triggered           │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Wait Strategy                        │
│ await waitForEmailValidation()       │
└──────┬───────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────┐
│ Validation                           │
│ expect: No error message             │
│ expect: Green border (valid state)   │
└──────────────────────────────────────┘
```

---

These diagrams illustrate the complete architecture, workflows, and design decisions of the automated quality gate system.
