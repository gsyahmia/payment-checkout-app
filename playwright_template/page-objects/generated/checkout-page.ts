import { Page, Locator, expect } from '@playwright/test';
import { UILabels } from '../../data/helpers/uiLabels';

/**
 * CheckoutPage - Page Object Model for Secure Checkout Page
 * 
 * Design Principles:
 * 1. Stable Selectors: Uses data-testid and semantic selectors, avoiding fragile XPath
 * 2. Separation of Concerns: Locators, actions, and validations are separated
 * 3. Readability: Clear method names that describe user actions
 * 4. Maintainability: Centralized selector management
 */
export class CheckoutPage {
  readonly page: Page;

  // Locators - Stable and Unique Selectors
  private readonly pageTitle: Locator;
  private readonly pageSubtitle: Locator;
  
  // Form Field Locators - Using semantic selectors (name, placeholder)
  private readonly emailInput: Locator;
  private readonly cardNumberInput: Locator;
  private readonly expiryInput: Locator;
  private readonly cvvInput: Locator;
  private readonly amountInput: Locator;
  
  // Button Locators
  private readonly completePaymentButton: Locator;
  private readonly checkBackendButton: Locator;
  
  // Validation Message Locators
  private readonly emailValidationIcon: Locator;
  private readonly emailErrorMessage: Locator;
  private readonly cardValidationIcon: Locator;
  private readonly cardErrorMessage: Locator;
  private readonly expiryErrorMessage: Locator;
  private readonly cvvErrorMessage: Locator;
  private readonly amountErrorMessage: Locator;
  private readonly successMessage: Locator;
  
  // Status Indicators
  private readonly emailValidatingSpinner: Locator;
  private readonly cardValidatingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page Header Elements - Using text content for stability
    this.pageTitle = page.getByRole('heading', { name: UILabels.PAGE_TITLE });
    this.pageSubtitle = page.getByText(UILabels.PAGE_SUBTITLE);

    // Form Inputs - Using name attribute (most stable selector)
    this.emailInput = page.locator('input[name="email"]');
    this.cardNumberInput = page.locator('input[name="cardNumber"]');
    this.expiryInput = page.locator('input[name="expiry"]');
    this.cvvInput = page.locator('input[name="cvv"]');
    this.amountInput = page.locator('input[name="amount"]');

    // Buttons - Using role and text for semantic stability
    this.completePaymentButton = page.getByRole('button', { name: /Complete Payment|Pay \$|Processing Payment/i });
    this.checkBackendButton = page.getByRole('button', { name: /Check Backend Status/i });

    // Validation Icons - Using SVG path within parent containers
    this.emailValidationIcon = this.emailInput.locator('..').locator('svg[fill="currentColor"]');
    this.cardValidationIcon = this.cardNumberInput.locator('..').locator('svg[fill="currentColor"]');

    // Error Messages - Using text content near form fields
    // Note: We specifically look for actual errors, not warnings (⚠️ messages are acceptable soft-fails)
    this.emailErrorMessage = page.locator('p').filter({ hasText: /^(Invalid email format|Please enter a valid email)/i });
    this.cardErrorMessage = page.locator('p').filter({ hasText: /^(Invalid card number|Please enter a valid card)/i });
    this.expiryErrorMessage = page.locator('p').filter({ hasText: /^(Invalid expiry|Please enter)/i });
    this.cvvErrorMessage = page.locator('p').filter({ hasText: /^(Invalid CVV|Please enter a)/i });
    this.amountErrorMessage = page.locator('p').filter({ hasText: /^(Invalid amount|Amount must be)/i });

    // Success/Error Message Banner - Using class patterns
    this.successMessage = page.locator('div').filter({ hasText: /✅|❌/ }).first();

    // Loading Spinners
    this.emailValidatingSpinner = page.getByText('Validating...').first();
    this.cardValidatingSpinner = page.getByText('Validating...').last();
  }

  // Navigation Actions
  async goto() {
    // Changed from 'networkidle' to 'domcontentloaded' for faster page load
    // 'domcontentloaded' is sufficient for most tests and 3-5x faster than 'networkidle'
    await this.page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    // Wait for the page title to be visible (indicates page is ready)
    await this.pageTitle.waitFor({ state: 'visible', timeout: 5000 });
  }

  // Form Interaction Actions
  async fillEmail(email: string) {
    await this.emailInput.clear();
    await this.emailInput.fill(email);
  }

  async fillCardNumber(cardNumber: string) {
    await this.cardNumberInput.clear();
    await this.cardNumberInput.fill(cardNumber);
  }

  async fillExpiry(expiry: string) {
    await this.expiryInput.clear();
    await this.expiryInput.fill(expiry);
  }

  async fillCVV(cvv: string) {
    await this.cvvInput.clear();
    await this.cvvInput.fill(cvv);
  }

  async fillAmount(amount: string) {
    await this.amountInput.clear();
    await this.amountInput.fill(amount);
  }

  async triggerEmailValidation() {
    await this.emailInput.blur();
    // Reduced timeout - only wait for debounce, not full validation
    await this.page.waitForTimeout(100);
  }

  async triggerCardValidation() {
    await this.cardNumberInput.blur();
    // Reduced timeout - only wait for debounce, not full validation
    await this.page.waitForTimeout(100);
  }

  async clickCompletePayment() {
    await this.completePaymentButton.click();
  }

  async clickCheckBackend() {
    await this.checkBackendButton.click();
  }

  // Complex Actions - Combining multiple steps
  async fillCompleteForm(testData: {
    email: string;
    cardNumber: string;
    expiry: string;
    cvv: string;
    amount: string;
  }) {
    await this.fillEmail(testData.email);
    await this.triggerEmailValidation();
    await this.fillCardNumber(testData.cardNumber);
    await this.triggerCardValidation();
    await this.fillExpiry(testData.expiry);
    await this.fillCVV(testData.cvv);
    await this.fillAmount(testData.amount);
  }

  // Validation/Assertion Methods
  async validatePageLoaded() {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.pageTitle).toHaveText(UILabels.PAGE_TITLE);
    await expect(this.pageSubtitle).toBeVisible();
    await expect(this.pageSubtitle).toHaveText(UILabels.PAGE_SUBTITLE);
  }

  async validateNoEmailError() {
    // Check that no error message is displayed below email field
    const errorVisible = await this.emailErrorMessage.isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
  }

  async validateNoCardError() {
    // Check for success message instead of error
    const cardMessage = await this.cardErrorMessage.textContent().catch(() => '');
    if (cardMessage) {
      expect(cardMessage).toContain('✅');
    }
  }

  async validateNoExpiryError() {
    const errorVisible = await this.expiryErrorMessage.isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
  }

  async validateNoCVVError() {
    const errorVisible = await this.cvvErrorMessage.isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
  }

  async validateNoAmountError() {
    const errorVisible = await this.amountErrorMessage.isVisible().catch(() => false);
    expect(errorVisible).toBe(false);
  }

  async validateAllFieldsNoErrors() {
    await this.validateNoEmailError();
    await this.validateNoCardError();
    await this.validateNoExpiryError();
    await this.validateNoCVVError();
    await this.validateNoAmountError();
  }

  async validateSuccessMessage() {
    await expect(this.successMessage).toBeVisible();
    const messageText = await this.successMessage.textContent();
    expect(messageText).toContain(UILabels.SUCCESS_PAYMENT);
  }

  async validateEmailValidationSuccess() {
    // Wait for the green border class to appear instead of arbitrary timeout
    await expect(this.emailInput).toHaveClass(/border-green-400/, { timeout: 3000 });
  }

  async validateCardValidationSuccess() {
    // Wait for the green border class to appear instead of arbitrary timeout
    await expect(this.cardNumberInput).toHaveClass(/border-green-400/, { timeout: 3000 });
  }

  // Wait Helpers - Optimized to wait for actual validation completion instead of arbitrary timeouts
  async waitForEmailValidation() {
    // Wait for the validation spinner to disappear (indicates validation is complete)
    // This is much faster than waiting a fixed 1500ms
    try {
      await this.emailValidatingSpinner.waitFor({ state: 'hidden', timeout: 3000 });
    } catch {
      // If spinner doesn't appear/disappear, just wait a short time
      await this.page.waitForTimeout(300);
    }
  }

  async waitForCardValidation() {
    // Wait for the validation spinner to disappear (indicates validation is complete)
    try {
      await this.cardValidatingSpinner.waitFor({ state: 'hidden', timeout: 3000 });
    } catch {
      // If spinner doesn't appear/disappear, just wait a short time
      await this.page.waitForTimeout(300);
    }
  }

  async waitForPaymentProcessing() {
    // Wait for success/error message to appear instead of arbitrary timeout
    try {
      await this.successMessage.waitFor({ state: 'visible', timeout: 5000 });
    } catch {
      // Fallback to shorter timeout if message doesn't appear
      await this.page.waitForTimeout(500);
    }
  }
}
