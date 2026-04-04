# Quick Reference Guide

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# API tests only
npm run test:api

# E2E tests only
npm run test:e2e
```

### Debug Tests
```bash
# Debug mode with inspector
npm run test:debug

# UI mode (interactive)
npm run test:ui
```

### View Reports
```bash
npm run report
```

## Test Generation

### Generate API Tests from Swagger
```bash
npm run generate:api-tests
```

### Validate Tests (Anti-Hallucination)
```bash
npm run validate:tests
```

### Detect Flaky Tests
```bash
# Windows
npm run detect:flaky

# Linux/Mac
./scripts/detect-flaky-tests.sh generated_test/e2e/checkout-e2e.spec.ts 10
```

## Development

### Start Backend + Frontend
```bash
# Terminal 1: Backend
cd application_code
go run main.go

# Terminal 2: Frontend
cd application_code
npm run dev

# Terminal 3: Tests
cd playwright_template
npm test
```

### CI/CD Pipeline
Push to `main` or `develop` branch triggers:
1. Test generation
2. API tests
3. E2E tests
4. Quality gate
5. Deploy (if passed)

## Test Data

### Add New Test Data
Edit: `playwright_template/data/testData_001.json`

### Update UI Labels
Edit: `playwright_template/data/helpers/uiLabels.ts`

## Troubleshooting

### Backend won't start
```bash
# Check if port 8080 is in use
netstat -ano | findstr :8080
```

### Tests failing
```bash
# Check services are running
curl http://localhost:8080/api/health
curl http://localhost:3000/

# View detailed errors
npm run test:headed

# Generate debug trace
npm run test:debug
```

### Flaky tests
```bash
# Detect flakiness
npm run detect:flaky

# Check for:
- Missing waits
- Unstable selectors
- Race conditions
```

## File Structure

```
tests/
├── generated_test/
│   ├── api/              # API tests (from Swagger)
│   └── e2e/              # E2E tests (from frontend)

page-objects/
└── generated/        # Page Object Models

utils/
└── generated/        # API helpers

data/
├── helpers/
│   └── uiLabels.ts       # UI text constants
└── testData_*.json   # Test data
```

## Key Commands

| Command | Description |
|---|---|
| `npm test` | Run all tests |
| `npm run test:api` | Run API tests only |
| `npm run test:e2e` | Run E2E tests only |
| `npm run test:ui` | Interactive test runner |
| `npm run report` | View HTML report |
| `npm run validate:tests` | Check for hallucinations |
| `npm run detect:flaky` | Find flaky tests |
