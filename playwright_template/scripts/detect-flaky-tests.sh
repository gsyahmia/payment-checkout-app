#!/bin/bash

# Test Flakiness Detector
# Runs tests multiple times to detect flaky tests
# Usage: ./detect-flaky-tests.sh [test-file] [iterations]

set -e

TEST_FILE=${1:-"tests/generated_test/e2e/checkout-e2e.spec.ts"}
ITERATIONS=${2:-10}
RESULTS_DIR="flaky-test-results"

echo "🔍 Flaky Test Detector"
echo "======================="
echo "Test file: $TEST_FILE"
echo "Iterations: $ITERATIONS"
echo ""

# Create results directory
mkdir -p $RESULTS_DIR
rm -rf $RESULTS_DIR/*

# Track results
PASSED=0
FAILED=0
FLAKY_TESTS=()

echo "🏃 Running tests $ITERATIONS times..."
echo ""

for i in $(seq 1 $ITERATIONS); do
    echo "Run $i/$ITERATIONS..."
    
    if npx playwright test "$TEST_FILE" --reporter=json --output=$RESULTS_DIR/run-$i > $RESULTS_DIR/run-$i.log 2>&1; then
        echo "  ✅ Passed"
        ((PASSED++))
    else
        echo "  ❌ Failed"
        ((FAILED++))
    fi
done

echo ""
echo "📊 Results Summary"
echo "=================="
echo "Passed: $PASSED/$ITERATIONS"
echo "Failed: $FAILED/$ITERATIONS"
echo ""

# Calculate flakiness percentage
if [ $FAILED -gt 0 ] && [ $FAILED -lt $ITERATIONS ]; then
    FLAKINESS=$((FAILED * 100 / ITERATIONS))
    echo "⚠️  Test is FLAKY (${FLAKINESS}% failure rate)"
    echo ""
    echo "🔧 Recommended actions:"
    echo "  1. Review test logs in $RESULTS_DIR/"
    echo "  2. Add explicit waits or improve selectors"
    echo "  3. Check for race conditions"
    echo "  4. Consider network instability"
    exit 1
elif [ $FAILED -eq $ITERATIONS ]; then
    echo "❌ Test CONSISTENTLY FAILS"
    echo "   This is a genuine test failure, not flakiness"
    exit 1
elif [ $FAILED -eq 0 ]; then
    echo "✅ Test is STABLE (0% failure rate)"
    echo "   No flakiness detected"
    exit 0
fi
