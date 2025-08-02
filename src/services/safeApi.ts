// Safe API client that gracefully handles backend unavailability

// Log environment for debugging
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

// Force production URL in all environments to ensure consistency
const getApiBaseUrl = (): string => {
  // Always use production URL, regardless of environment
  const prodUrl = 'https://laptop-crm-backend.onrender.com';
  const url = prodUrl.endsWith('/') ? prodUrl.slice(0, -1) : prodUrl;
  console.log('Using API URL:', url);
  return url;
};

const API_BASE_URL = getApiBaseUrl();

// Add a small delay to prevent rapid reconnection attempts
const CONNECTION_RETRY_DELAY = 2000; // 2 seconds

class SafeApiClient {
  private isBackendAvailable: boolean = false;
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // Check every 30 seconds
  private isChecking: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor() {
    // Initial check
    this.checkBackendAvailability().catch(error => {
      console.warn('Initial backend check failed:', error);
    });
  }

  private async checkBackendAvailability(): Promise<boolean> {
    const now = Date.now();

    // If already checking or not enough time has passed since last check
    if (this.isChecking || (now - this.lastCheck < this.checkInterval && this.retryCount === 0)) {
      return this.isBackendAvailable;
    }

    this.isChecking = true;
    this.lastCheck = now;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      console.log(`🔍 Checking backend availability at: ${API_BASE_URL}/api/health`);
      
      const response = await fetch(`${API_BASE_URL}/api/health`, {
        signal: controller.signal,
        method: "GET",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend health check successful:', data);
        this.isBackendAvailable = true;
        this.retryCount = 0; // Reset retry counter on success
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Health check failed with status:', response.status, errorText);
        this.isBackendAvailable = false;
        return false;
      }
    } catch (error) {
      console.error('❌ Error during health check:', error);
      this.isBackendAvailable = false;
      this.retryCount++;
      
      // Only log warnings for the first few retries to avoid console spam
      if (this.retryCount <= this.maxRetries) {
        console.warn(
          `⚠️ Backend server unavailable (attempt ${this.retryCount}/${this.maxRetries}):`,
          error instanceof Error ? error.message : 'Unknown error'
        );
        
        // Schedule a retry after a delay
        if (this.retryCount < this.maxRetries) {
          setTimeout(() => this.checkBackendAvailability(), CONNECTION_RETRY_DELAY);
        }
      }
      return false;
    } finally {
      this.isChecking = false;
    }
  }

  public async safeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{
    success: boolean;
    data?: T;
    error?: string;
    offline?: boolean;
  }> {
    // Check backend availability first
    await this.checkBackendAvailability();

    if (!this.isBackendAvailable) {
      return {
        success: false,
        error: "Backend server is not available",
        offline: true,
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      // Get token from localStorage if available
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? `Found (${token.substring(0, 10)}...)` : 'Not found');
      
      // Create a new headers object to avoid type issues with the spread operator
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Manually add other headers to avoid type issues
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (value !== undefined) {
            headers[key] = String(value);
          }
        });
      }
      
      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('Request headers with auth:', {
          ...headers,
          // Don't log the full token for security
          Authorization: `Bearer ${token.substring(0, 10)}...`
        });
      } else {
        console.warn('No authentication token found in localStorage');
      }
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      this.isBackendAvailable = false; // Mark as unavailable on error

      return {
        success: false,
        error: error.message || "Request failed",
        offline: error.name === "AbortError" || error.message.includes("fetch"),
      };
    }
  }

  // Customer methods
  public async getCustomers(params?: any) {
    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    return this.safeRequest(`/customers${queryString}`);
  }

  public async createCustomer(customerData: any) {
    return this.safeRequest("/customers", {
      method: "POST",
      body: JSON.stringify(customerData),
    });
  }

  public async healthCheck() {
    return this.safeRequest("/health");
  }

  // Public getter for backend status
  public get isOnline(): boolean {
    return this.isBackendAvailable;
  }

  // Force a backend check
  public async forceCheck(): Promise<boolean> {
    this.lastCheck = 0; // Reset check time
    await this.checkBackendAvailability();
    return this.isBackendAvailable;
  }
}

export const safeApiClient = new SafeApiClient();
export default safeApiClient;
