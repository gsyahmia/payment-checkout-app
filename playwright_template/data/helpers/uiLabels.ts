/**
 * UI Labels Enumeration
 * Centralized storage for all hardcoded UI text to ensure consistency and maintainability
 * This prevents magic strings and makes UI changes easier to track
 */

export enum UILabels {
  // Page Titles
  PAGE_TITLE = "Secure Checkout",
  PAGE_SUBTITLE = "Complete your payment securely",

  // Form Labels
  EMAIL_LABEL = "Email Address",
  CARD_NUMBER_LABEL = "Card Number",
  EXPIRY_LABEL = "Expiry",
  CVV_LABEL = "CVV",
  AMOUNT_LABEL = "Amount (USD)",

  // Placeholders
  EMAIL_PLACEHOLDER = "you@example.com",
  CARD_PLACEHOLDER = "1234 5678 9012 3456",
  EXPIRY_PLACEHOLDER = "MM/YY",
  CVV_PLACEHOLDER = "123",
  AMOUNT_PLACEHOLDER = "0.00",

  // Button Labels
  BUTTON_COMPLETE_PAYMENT = "Complete Payment",
  BUTTON_PROCESSING = "Processing Payment...",
  BUTTON_CHECK_BACKEND = "🔌 Check Backend Status",

  // Success Messages
  SUCCESS_PAYMENT = "✅ Payment processed successfully!",
  SUCCESS_CARD_VALID = "✅ Valid card number (Luhn check passed)",

  // Error Messages
  ERROR_INVALID_EMAIL = "❌ Invalid email format",
  ERROR_INVALID_CARD = "❌ Invalid card number (Luhn check failed)",
  ERROR_BACKEND_DOWN = "❌ Failed to connect to backend server",

  // Warning Messages
  WARNING_EMAIL_SERVICE = "⚠️ Email validation service temporarily unavailable. You can still proceed.",
  WARNING_CARD_VALIDATION = "⚠️ Could not validate card number",

  // Status Messages
  STATUS_VALIDATING = "Validating...",
  STATUS_SSL_SECURED = "Secured with 256-bit SSL encryption",

  // Backend Health
  BACKEND_HEALTHY = "Server is running",
  BACKEND_NOT_RESPONDING = "🔴 Backend is not responding"
}
