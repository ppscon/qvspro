// Auth types
export interface UserCredentials {
  email: string;
  password: string;
}

// User profile types
export interface UserProfile {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  company?: string;
  job_title?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

// Scan record types
export interface ScanRecord {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  scan_parameters: any;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

// Scan finding types
export interface ScanFinding {
  id: string;
  scan_id: string;
  file_path?: string;
  line_number?: number;
  risk_level?: string;
  vulnerability_type?: string;
  description?: string;
  recommendation?: string;
  algorithm?: string;
  created_at: string;
} 