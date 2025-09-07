import axios, { AxiosInstance } from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

interface UniFiSessionOptions {
  baseUrl: string; // e.g., https://192.168.1.1
  username: string;
  password: string;
}

export class UniFiSession {
  private axios: AxiosInstance;
  private baseUrl: string;
  private username: string;
  private password: string;

  constructor(options: UniFiSessionOptions) {
    const jar = new CookieJar();
    this.axios = wrapper(axios.create({ jar, withCredentials: true }));
    this.baseUrl = options.baseUrl.replace(/\/$/, ""); // remove trailing slash
    this.username = options.username;
    this.password = options.password;
  }

  /**
   * Log in and establish a session.
   */
  public async login(): Promise<void> {
    const url = `${this.baseUrl}/api/auth/login`;

    try {
      const response = await this.axios.post(
        url,
        {
          username: this.username,
          password: this.password,
          rememberMe: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("✅ Login successful.");
      } else {
        throw new Error(`Unexpected login response: ${response.status}`);
      }
    } catch (err: any) {
      console.error("❌ Failed to login:", err.message);
      throw err;
    }
  }

  /**
   * Make an authenticated GET request.
   */
  public async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await this.axios.get<T>(url);
    return response.data;
  }

  /**
   * Make an authenticated POST request.
   */
  public async post<T>(path: string, data: any): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await this.axios.post<T>(url, data);
    return response.data;
  }
}