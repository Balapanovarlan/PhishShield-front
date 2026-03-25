export interface ScanResult {
  status: "Legitimate" | "Phishing" | "Unknown";
  method: string;
  risk_score: number;
  confidence: number;
  details: string;
  explanations?: string[];
  breakdown?: {
    html: number;
    url: number;
    reputation: number;
    protocol: number;
  };
  error?: string;
}

export interface ScanRequest {
  url: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

export type Language = "en" | "ru" | "kz";
