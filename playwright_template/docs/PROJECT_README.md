# Payment Checkout Application with E2E Testing

A full-stack payment checkout application with comprehensive automated testing using Playwright.

**Repository**: https://github.com/gsyahmia/payment-checkout-app.git

## 🏗️ Project Structure

```
PMongo/
├── application_code/          # Application source code
│   ├── main.go               # Go backend server (port 8080)
│   ├── app/                  # Next.js frontend (port 3000)
│   └── docs/                 # API documentation (Swagger)
│
├── playwright_template/       # Test automation
│   ├── tests/                # Test files
│   ├── page-objects/         # Page Object Model
│   ├── data/                 # Test data
│   └── utils/                # Test utilities
│
└── .github/
    └── workflows/            # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Go 1.21+
- npm or yarn

### 1. Install Dependencies

**Backend + Frontend:**
```bash
cd application_code
npm install
```

**Tests:**
```bash
cd playwright_template
npm install
npx playwright install
```

### 2. Start the Application

**Terminal 1 - Backend:**
```bash
cd application_code
go run main.go
```
Wait for: `Server starting on :8080`

**Terminal 2 - Frontend:**
```bash
cd application_code
npm run dev
```
Wait for: `Local: http://localhost:3000`

### 3. Run Tests

**API Tests:**
```bash
cd playwright_template
npm run test:api
```

**UI/E2E Tests:**
```bash
npm run test:e2e
```

**All Tests:**
```bash
npm test
```

## 📊 Test Coverage

- **1 API Test**: Payment flow validation (4 steps)
- **1 E2E Test**: Complete checkout flow (2 data sets, 8 steps each)
- **Data-Driven**: Tests loop through multiple data sets from JSON
- **Performance**: ~15 seconds total execution time

## 🧪 Testing Features

- ✅ **Page Object Model**: Maintainable test structure
- ✅ **Data-Driven**: JSON-based test data
- ✅ **Smart Waits**: No arbitrary timeouts
- ✅ **Swagger Validation**: API tests validate against OpenAPI spec
- ✅ **Anti-Flakiness**: Stable selectors, proper wait strategies
- ✅ **Separate Reports**: API and UI tests have separate HTML reports

## 🔄 CI/CD

This project is designed for continuous integration:

1. **On Pull Request**: Run all tests
2. **On Main Branch**: Run tests + deploy if passing
3. **Nightly**: Run extended test suite

See `.github/workflows/workflow.yml` for pipeline configuration.

## 📖 Documentation

- **API Documentation**: Open `http://localhost:8080/swagger.json` (backend must be running)
- **Test Documentation**: See `playwright_template/docs/`
- **Quick Start Guide**: See `application_code/QUICKSTART.md`

## 🛠️ Available Commands

### Application
```bash
cd application_code
go run main.go          # Start backend
npm run dev             # Start frontend
```

### Tests
```bash
cd playwright_template
npm run test:api             # Run API tests
npm run test:e2e             # Run UI tests (headless)
npm run test:e2e:headed      # Run UI tests (browser visible)
npm run test:e2e:debug       # Run UI tests in debug mode
npm run report               # Open test report
```

## 🏗️ CI/CD Best Practices Implemented

1. ✅ **Monorepo**: App and tests in one repository
2. ✅ **Version Sync**: Test and app versions aligned
3. ✅ **Atomic Commits**: Tests updated with code changes
4. ✅ **Quality Gates**: Tests must pass before merge
5. ✅ **Separate Reports**: Clear test result separation

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Tech Stack**: Go + Next.js + Playwright + TypeScript
