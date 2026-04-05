/**
 * TimeoutConfig - Centralized timeout configuration for test automation
 * 
 * Purpose:
 * - Provides consistent timeout values across all page objects
 * - Easy to adjust timing for different environments (fast/slow)
 * - Makes timeout values maintainable in one place
 * 
 * Usage:
 * import { TimeoutConfig } from '../../utils/generated/timeout-config';
 * await this.page.waitForTimeout(TimeoutConfig.DEBOUNCE_DELAY);
 */

export class TimeoutConfig {
  /**
   * Page Load Timeouts
   */
  static readonly PAGE_LOAD_TIMEOUT = 5000; // 5 seconds for page title visibility

  /**
   * Input Field Debounce Delays
   * Short delays after blur() to allow field validation to trigger
   */
  static readonly DEBOUNCE_DELAY = 100; // 100ms after blur/input

  /**
   * Validation Timeouts
   * How long to wait for validation spinners and status changes
   */
  static readonly VALIDATION_TIMEOUT = 3000; // 3 seconds for validation to complete
  static readonly VALIDATION_FALLBACK = 300; // 300ms fallback if spinner doesn't appear

  /**
   * Form Submission Timeouts
   */
  static readonly PAYMENT_PROCESSING_TIMEOUT = 5000; // 5 seconds for payment to process
  static readonly PAYMENT_FALLBACK = 500; // 500ms fallback if message doesn't appear

  /**
   * Element State Timeouts
   * For waiting on specific element class/attribute changes
   */
  static readonly CLASS_CHANGE_TIMEOUT = 3000; // 3 seconds for border color changes
}
