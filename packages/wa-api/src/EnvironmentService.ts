export class EnvironmentService {
  static getString(key: string, required = true, defaultValue?: string): string {
    const value = process.env[key] ?? defaultValue;
    if (required && (value === undefined || value === "")) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value!;
  }

  static getNumber(key: string, required = true, defaultValue?: number): number {
    const str = process.env[key];
    if (str === undefined || str === "") {
      if (required && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
      return defaultValue as number;
    }
    const num = Number(str);
    if (isNaN(num)) {
      throw new Error(`Environment variable ${key} must be a number, got: ${str}`);
    }
    return num;
  }

  static getBoolean(key: string, required = true, defaultValue?: boolean): boolean {
    const str = process.env[key];
    if (str === undefined || str === "") {
      if (required && defaultValue === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
      return defaultValue as boolean;
    }
    return ["true", "1", "yes", "on"].includes(str.toLowerCase());
  }
}