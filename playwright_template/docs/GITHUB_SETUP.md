# GitHub Repository Setup Guide

## 📦 Recommended Approach: **Monorepo (Single Repository)**

This is the best practice for CI/CD and is used by industry leaders like Google, Meta, and Microsoft.

## Step-by-Step Setup

### 1. Create New Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `payment-checkout-app`
3. Description: "Full-stack payment checkout with automated E2E testing"
4. **Public** or **Private** (your choice)
5. ✅ **Do NOT** initialize with README (we already have one)
6. Click **Create repository**

**Your repository URL will be**: `https://github.com/gsyahmia/payment-checkout-app.git`

### 2. Initialize Local Git Repository

```bash
cd C:\Users\syahmia\Videos\PMongo

# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: Payment checkout app with Playwright tests"
```

### 3. Connect to GitHub

```bash
# Add remote
git remote add origin https://github.com/gsyahmia/payment-checkout-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 4. Verify Upload

Check your GitHub repository - you should see:
```
your-repo/
├── application_code/
├── playwright_template/
├── .github/workflows/
├── PROJECT_README.md
└── .gitignore
```

### 5. Enable GitHub Actions

1. Go to your repository on GitHub
2. Click **Actions** tab
3. GitHub will auto-detect your workflow file
4. Click **Enable Actions**

## 🎯 Why Monorepo is Better for CI/CD

### ✅ **Advantages:**

1. **Atomic Changes**
   - One PR updates both code and tests
   - No version mismatch between app and tests
   
2. **Better CI/CD**
   - Single pipeline: Build → Test → Deploy
   - Tests automatically run when code changes
   
3. **Easier Code Review**
   - Reviewers see both implementation and tests
   - Better context for changes
   
4. **Version Sync**
   - Git tags apply to both app and tests
   - Easy to rollback everything together
   
5. **Simplified Workflow**
   ```
   Developer → commits code + tests → GitHub → CI runs → all tests pass → auto-deploy
   ```

### ❌ **Why Not Separate Repos:**

1. **Version Hell**
   - Which test version works with which app version?
   - Need manual coordination
   
2. **Complex CI**
   - Two pipelines to manage
   - Tests must checkout specific app version
   
3. **Broken PRs**
   - App PR can break tests
   - Tests PR can fail on outdated app

## 🔄 CI/CD Pipeline (Monorepo)

Our setup includes a complete CI/CD pipeline in `.github/workflows/workflow.yml`:

### Pipeline Flow:
```
Pull Request → Trigger CI
    ↓
1. Build Application
    ↓
2. Run API Tests ───┐
3. Run E2E Tests ───┤→ Quality Gate
    ↓               │
    └───────────────┘
    ↓
4. All Pass? → Deploy to Production (main branch only)
```

### Features:
- ✅ Runs on every PR and push to main
- ✅ Parallel test execution (API + E2E)
- ✅ Uploads test reports as artifacts
- ✅ Uploads videos on test failure
- ✅ Quality gate blocks bad code
- ✅ Auto-deploy after tests pass (main branch)

## 🎬 Next Steps After Upload

1. **Set up branch protection** (Settings → Branches → Add rule)
   - Require pull request reviews
   - Require status checks to pass (CI tests)
   - Prevent force pushes to main

2. **Add secrets** (Settings → Secrets and variables → Actions)
   - Deployment credentials
   - API keys
   - Environment variables

3. **Configure environments** (Settings → Environments)
   - Staging environment
   - Production environment
   - Deployment approvals

4. **Enable Dependabot** (Settings → Code security)
   - Automated dependency updates
   - Security alerts

## 📝 Project Structure in GitHub

Your repository will look like this:

```
your-repo/
│
├── 📁 application_code/          # Backend + Frontend
│   ├── main.go                   # Go server
│   ├── app/                      # Next.js app
│   ├── package.json
│   └── go.mod
│
├── 📁 playwright_template/        # Test automation
│   ├── tests/
│   ├── page-objects/
│   ├── playwright.config.ts
│   └── package.json
│
├── 📁 .github/
│   └── workflows/
│       └── ci-cd-pipeline.yml    # CI/CD automation
│
├── 📄 PROJECT_README.md           # Main documentation
├── 📄 .gitignore                  # Git ignore rules
└── 📄 LICENSE                     # Optional: Add license
```

## 🚀 Benefits Summary

**Monorepo = Single Source of Truth**

### Why Monorepo Works Best:

✅ **Version Sync**: App and tests always in sync - no version mismatch  
✅ **Simple CI/CD**: One pipeline for build → test → deploy  
✅ **Easy Code Review**: Reviewers see both implementation and tests  
✅ **Atomic Changes**: Update code and tests in one PR  
✅ **Easy Rollback**: One git tag controls everything  
✅ **Industry Standard**: Used by Google, Meta, Microsoft  

## 💡 Recommendation

**Use Monorepo (Single Repository)** containing both `application_code/` and `playwright_template/`. This is the modern, industry-standard approach that makes CI/CD simple and reliable.

---

Ready to push? Run the commands in **Step 2 & 3** above! 🚀
