export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at?: string;
  document_count?: number;
  storage_bytes?: number;
  is_active?: boolean;
}

export interface UserDetail extends User {
  shared_count?: number;
  recent_activity?: ActivityEvent[];
  processing_summary?: {
    completed: number;
    failed: number;
    processing: number;
  };
}

export interface Document {
  id: string;
  owner_id: string;
  folder_id: string | null;
  original_filename: string;
  file_size: number;
  file_hash: string;
  detected_mime_type: string;
  detected_file_type: string;
  category: string | null;
  title: string | null;
  author: string | null;
  metadata: Record<string, any>;
  is_locked: boolean;
  visibility?: 'private' | 'password' | 'public';
  public_title?: string | null;
  has_public_password?: boolean;
  processing_status: 'uploaded' | 'queued' | 'processing' | 'completed' | 'failed';
  processing_error: string | null;
  processing_completed_at?: string | null;
  created_at: string;
  updated_at: string;
  owner_username?: string;
  share_count?: number;
  storage_path?: string;
  is_starred?: boolean;
  starred_at?: string | null;
}

export interface Folder {
  id: string;
  owner_id: string;
  parent_folder_id: string | null;
  name: string;
  visibility?: 'private' | 'password' | 'public';
  created_at: string;
  updated_at: string;
}

export type Visibility = 'private' | 'password' | 'public';

export interface CommunityRequest {
  id: string;
  requester_id: string;
  requester_username?: string;
  requester_name?: string;
  title: string;
  description: string | null;
  document_type: string | null;
  status: 'open' | 'filled' | 'cancelled';
  offer_count?: number;
  offers?: CommunityOffer[];
  created_at: string;
}

export interface CommunityOffer {
  id: string;
  request_id: string;
  request_title?: string;
  offerer_id: string;
  offerer_username?: string;
  document_id: string;
  document_filename?: string;
  message: string | null;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  created_at: string;
}

export interface CommunityTransfer {
  id: string;
  offer_id: string;
  original_document_id: string | null;
  transferred_document_id: string | null;
  requester_id: string;
  offerer_id: string;
  status: 'pending' | 'received' | 'declined';
  created_at: string;
}

export interface Report {
  id: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_document_id: string | null;
  reason: 'inappropriate' | 'copyright' | 'spam' | 'malware' | 'other';
  details: string | null;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  resolution: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface Share {
  share_id: string;
  document_id?: string;
  permission: 'view' | 'download';
  shared_by_username: string;
  shared_with_username: string;
  created_at: string;
  revoked_at?: string | null;
  document?: {
    id: string;
    original_filename: string;
    detected_file_type: string;
    file_size: number;
    is_locked: boolean;
  } | null;
}

export interface ProcessingJob {
  id: string;
  document_id: string;
  user_id: string;
  job_type: string;
  status: string;
  detected_type: string | null;
  category: string | null;
  metadata: Record<string, any>;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  document?: {
    id: string;
    original_filename: string;
    detected_file_type: string;
    file_size: number;
  } | null;
  owner_username?: string;
  stage?: 'uploaded' | 'detecting' | 'extracting' | 'classifying' | 'storing' | 'completed' | 'failed';
  duration_ms?: number | null;
}

export interface AdminStats {
  total_users: number;
  total_documents: number;
  total_storage_bytes: number;
  total_processing_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  recent_uploads: number;
  active_users_24h?: number;
}

export interface StorageStats {
  total_bytes: number;
  used_bytes: number;
  file_count: number;
  average_file_size: number;
  by_type: Array<{ type: string; bytes: number; count: number }>;
  by_user: Array<{ user_id: string; username: string; bytes: number; count: number }>;
  largest_files: Array<{
    id: string;
    original_filename: string;
    file_size: number;
    detected_file_type: string;
    owner_username?: string;
    created_at: string;
  }>;
}

export interface SecurityEvent {
  id: string;
  event_type:
    | 'login_failed'
    | 'login_success'
    | 'upload_rejected'
    | 'unsupported_file'
    | 'authorization_failed'
    | 'password_protected_access'
    | 'share_created'
    | 'share_revoked'
    | 'admin_action';
  user_id?: string | null;
  username?: string | null;
  ip_address?: string | null;
  detail: string;
  created_at: string;
  severity: 'info' | 'warning' | 'critical';
}

export interface ActivityEvent {
  id: string;
  actor_id: string;
  actor_username: string;
  action: string;
  object_type: 'document' | 'folder' | 'user' | 'share' | 'system';
  object_id?: string | null;
  object_label?: string | null;
  detail?: string | null;
  created_at: string;
}

export interface SystemHealth {
  api: 'operational' | 'degraded' | 'unavailable' | 'unknown' | 'not_monitored';
  database: 'operational' | 'degraded' | 'unavailable' | 'unknown' | 'not_monitored';
  storage: 'operational' | 'degraded' | 'unavailable' | 'unknown' | 'not_monitored';
  processing: 'operational' | 'degraded' | 'unavailable' | 'unknown' | 'not_monitored';
  authentication: 'operational' | 'degraded' | 'unavailable' | 'unknown' | 'not_monitored';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    total: number;
    page: number;
    per_page: number;
    total_pages?: number;
    items?: T[];
    users?: T[];
    documents?: T[];
    jobs?: T[];
    shares?: T[];
    events?: T[];
    activity?: T[];
  };
}
