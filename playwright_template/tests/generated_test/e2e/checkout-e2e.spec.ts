import { test, expect } from '@playwright/test';
import { CheckoutPage } from '../../../page-objects/generated/checkout-page';
import testData from '../../../data/testData_001.json';
import { UILabels } from '../../../data/helpers/uiLabels';

/**
 * E2E Test Suite - Test Case 001: Successfully Payment Process
 * 
 * This test implements the complete end-to-end payment flow as specified in LLM_instructions.txt
 * 
 * Test Strategy:
 * - Data-Driven: Loops through all test data sets from testData_001.json
 * - Page Object Model: Uses CheckoutPage for stable selectors
 * - Step-by-Step Validation: Validates each step of the user journey
 * - Anti-Flakiness: Smart waits, explicit waits, stable selectors
 * 
 * Test Case: 001 - Successfully payment process
 * Steps:
 * 1. Visit http://localhost:3000/ and verify page loads with title "Secure Checkout"
 * 2. Enter valid Email - verify no error message appears
 * 3. Enter valid Card number - verify no error message appears
 * 4. Enter valid Expiry - verify no error message appears
 * 5. Enter valid CVV - verify no error message appears
 * 6. Enter valid Amount - verify no error message appears
 * 7. Click Complete Payment
 * 8. Validate success message "✅ Payment processed successfully!"
 */

test.describe('Test Case 001 - Successfully Payment Process', () => {
  /**
   * Data-Driven Test: Loops through all valid test data sets
   * Each iteration tests the complete payment flow with different data
   */
  test('001 - Successfully payment process (Data-Driven)', async ({ page }) => {
    let checkoutPage: CheckoutPage;

    // Loop through all valid test data sets
    for (let i = 0; i < testData.validTestData.length; i++) {
      const testDataSet = testData.validTestData[i];
      const dataSetNumber = i + 1;

      await test.step(`Data Set ${dataSetNumber}: Complete payment flow`, async () => {
        // Initialize page object
        checkoutPage = new CheckoutPage(page);

        // Step 1: Navigate and verify page loads
        await test.step(`[Data Set ${dataSetNumber}] Visit http://localhost:3000/ - Verify page loads with title "Secure Checkout"`, async () => {
          await checkoutPage.goto();
          await checkoutPage.validatePageLoaded();
        });

        // Step 2: Enter valid Email address - no error message should appear
        await test.step(`[Data Set ${dataSetNumber}] Enter valid Email: ${testDataSet.email}`, async () => {
          await checkoutPage.fillEmail(testDataSet.email);
          await checkoutPage.triggerEmailValidation();
          await checkoutPage.waitForEmailValidation();
          
          // Validate no error message appears
          await checkoutPage.validateNoEmailError();
          
          // Validate email validation success (green border)
          await checkoutPage.validateEmailValidationSuccess();
        });

        // Step 3: Enter valid Card number - no error message should appear
        await test.step(`[Data Set ${dataSetNumber}] Enter valid Card number: ${testDataSet.cardNumber}`, async () => {
          await checkoutPage.fillCardNumber(testDataSet.cardNumber);
          await checkoutPage.triggerCardValidation();
          await checkoutPage.waitForCardValidation();
          
          // Validate no error message appears
          await checkoutPage.validateNoCardError();
          
          // Validate card validation success (green border)
          await checkoutPage.validateCardValidationSuccess();
        });

        // Step 4: Enter valid Expiry - no error message should appear
        await test.step(`[Data Set ${dataSetNumber}] Enter valid Expiry: ${testDataSet.expiry}`, async () => {
          await checkoutPage.fillExpiry(testDataSet.expiry);
          
          // Validate no error message appears
          await checkoutPage.validateNoExpiryError();
        });

        // Step 5: Enter valid CVV - no error message should appear
        await test.step(`[Data Set ${dataSetNumber}] Enter valid CVV: ${testDataSet.cvv}`, async () => {
          await checkoutPage.fillCVV(testDataSet.cvv);
          
          // Validate no error message appears
          await checkoutPage.validateNoCVVError();
        });

        // Step 6: Enter valid Amount - no error message should appear
        await test.step(`[Data Set ${dataSetNumber}] Enter valid Amount: $${testDataSet.amount}`, async () => {
          await checkoutPage.fillAmount(testDataSet.amount);
          
          // Validate no error message appears
          await checkoutPage.validateNoAmountError();
        });

        // Step 7: Click Complete Payment
        await test.step(`[Data Set ${dataSetNumber}] Click Complete Payment`, async () => {
          await checkoutPage.clickCompletePayment();
          
          // Wait for payment processing
          await checkoutPage.waitForPaymentProcessing();
        });

        // Step 8: Validate success message
        await test.step(`[Data Set ${dataSetNumber}] Validate success message`, async () => {
          await checkoutPage.validateSuccessMessage();
        });

        console.log(`✓ Data Set ${dataSetNumber} completed successfully`);
      });
    }

    console.log(`✓ All ${testData.validTestData.length} test data sets passed!`);
  });
});
