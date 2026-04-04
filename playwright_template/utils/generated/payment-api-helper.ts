import { APIRequestContext, expect } from '@playwright/test';
import { APIMessages, APIEndpoints, APIStatus } from '../../data/helpers/uiLabels';

/**
 * PaymentAPIHelper - API Testing Utilities for Payment API
 * 
 * Design Principles:
 * 1. Separation of Concerns: Request, Response, and Validation are separated
 * 2. Type Safety: Strong typing for all request/response objects
 * 3. Reusability: Common patterns extracted into methods
 * 4. Swagger-Driven: All types and validations based on Swagger specification
 */

// Type Definitions based on Swagger Schema
export interface HealthResponse {
  status: string;
  message: string;
}

export interface EmailRequest {
  email: string;
}

export interface EmailResponse {
  valid: boolean;
  message: string;
}

export interface CardRequest {
  cardNumber: string;
}

export interface CardResponse {
  valid: boolean;
  message: string;
}

export interface PaymentRequest {
  cardNumber: string;
  expiry: string;
  cvv: string;
  amount: number;
}

export interface PaymentResponse {
  status: string;
  message: string;
}

export interface ErrorResponse {
  error: string;
}

export class PaymentAPIHelper {
  private readonly request: APIRequestContext;
  private readonly baseURL: string;

  constructor(request: APIRequestContext, baseURL: string = 'http://localhost:8080') {
    this.request = request;
    this.baseURL = baseURL;
  }

  // API Request Methods
  async healthCheck(): Promise<{ response: any; data: HealthResponse }> {
    const response = await this.request.get(`${this.baseURL}${APIEndpoints.HEALTH}`);
    const data = await response.json();
    return { response, data };
  }

  async validateEmail(email: string): Promise<{ response: any; data: EmailResponse | ErrorResponse }> {
    const response = await this.request.post(`${this.baseURL}${APIEndpoints.VALIDATE_EMAIL}`, {
      data: { email }
    });
    const data = await response.json();
    return { response, data };
  }

  async validateCard(cardNumber: string): Promise<{ response: any; data: CardResponse | ErrorResponse }> {
    const response = await this.request.post(`${this.baseURL}${APIEndpoints.VALIDATE_CARD}`, {
      data: { cardNumber }
    });
    const data = await response.json();
    return { response, data };
  }

  async processCheckout(paymentData: PaymentRequest): Promise<{ response: any; data: PaymentResponse | ErrorResponse }> {
    const response = await this.request.post(`${this.baseURL}${APIEndpoints.CHECKOUT}`, {
      data: paymentData
    });
    const data = await response.json();
    return { response, data };
  }

  // API Response Validation Methods - Based on Swagger Definitions
  validateHealthResponse(data: HealthResponse) {
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('message');
    expect(data.status).toBe(APIStatus.HEALTHY);
    expect(data.message).toBe(APIMessages.HEALTH_HEALTHY);
  }

  validateEmailResponse(data: EmailResponse, expectedValid: boolean) {
    expect(data).toHaveProperty('valid');
    expect(data).toHaveProperty('message');
    expect(data.valid).toBe(expectedValid);
    
    if (expectedValid) {
      expect(data.message).toBe(APIMessages.EMAIL_VALID);
    } else {
      expect(data.message).toContain('Invalid');
    }
  }

  validateCardResponse(data: CardResponse, expectedValid: boolean) {
    expect(data).toHaveProperty('valid');
    expect(data).toHaveProperty('message');
    expect(data.valid).toBe(expectedValid);
    
    if (expectedValid) {
      expect(data.message).toBe(APIMessages.CARD_VALID);
    } else {
      expect(data.message).toContain('Invalid');
    }
  }

  validatePaymentResponse(data: PaymentResponse) {
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('message');
    expect(data.status).toBe(APIStatus.SUCCESS);
    expect(data.message).toBe(APIMessages.PAYMENT_SUCCESS);
  }

  validateErrorResponse(data: ErrorResponse, expectedError?: string) {
    expect(data).toHaveProperty('error');
    if (expectedError) {
      expect(data.error).toContain(expectedError);
    }
  }

  // HTTP Status Validation
  validateStatusCode(response: any, expectedStatus: number) {
    expect(response.status()).toBe(expectedStatus);
  }

  // Response Time Validation (Performance Testing)
  async validateResponseTime(
    requestFn: () => Promise<any>,
    maxResponseTime: number = 2000
  ): Promise<number> {
    const startTime = Date.now();
    await requestFn();
    const responseTime = Date.now() - startTime;
    
    expect(responseTime).toBeLessThan(maxResponseTime);
    return responseTime;
  }

  // Schema Validation - Ensures response matches Swagger definition
  validateResponseSchema(data: any, expectedSchema: any) {
    for (const key of Object.keys(expectedSchema)) {
      expect(data).toHaveProperty(key);
      expect(typeof data[key]).toBe(typeof expectedSchema[key]);
    }
  }
}

/**
 * API Test Data Generator
 * Generates test data based on Swagger examples
 */
export class APITestDataGenerator {
  static getValidEmailData(): EmailRequest {
    return { email: 'user@example.com' };
  }

  static getInvalidEmailData(): EmailRequest {
    return { email: 'invalid-email' };
  }

  static getValidCardData(): CardRequest {
    return { cardNumber: '4242424242424242' };
  }

  static getInvalidCardData(): CardRequest {
    return { cardNumber: '1234567890123456' };
  }

  static getValidPaymentData(): PaymentRequest {
    return {
      cardNumber: '4242 4242 4242 4242',
      expiry: '12/26',
      cvv: '123',
      amount: 50.00
    };
  }

  static getInvalidPaymentData(): PaymentRequest {
    return {
      cardNumber: '1111 1111 1111 1111',
      expiry: '13/99',
      cvv: '99',
      amount: -10.00
    };
  }
}
