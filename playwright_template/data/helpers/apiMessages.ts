/**
 * API Messages Enumeration
 * Centralized storage for all API response messages to ensure consistency
 * This prevents magic strings and makes API message changes easier to track
 */

export enum APIMessages {
  // API Response Messages
  PAYMENT_SUCCESS = "Payment processed successfully!",
  EMAIL_VALID = "Email is valid",
  CARD_VALID = "Card number validated",  // Updated to match actual API response
  HEALTH_HEALTHY = "Server is running",

  // API Error Messages
  INVALID_EMAIL = "Invalid email format",
  INVALID_CARD = "Invalid card number",
  INVALID_EXPIRY = "Invalid expiry date",
  INVALID_CVV = "Invalid CVV",
  INVALID_AMOUNT = "Invalid amount"
}

export enum APIEndpoints {
  HEALTH = "/api/health",
  CHECKOUT = "/api/checkout",
  VALIDATE_EMAIL = "/api/validate-email",
  VALIDATE_CARD = "/api/validate-card"
}

export enum APIStatus {
  SUCCESS = "success",
  HEALTHY = "healthy"
}
