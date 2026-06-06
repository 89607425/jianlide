/** 全局TypeScript类型定义 */

// ===== 通用响应 =====
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ===== 用户相关 =====
export interface UserInfo {
  id: number;
  phone: string;
  nickname: string;
  member_type: number;
  token?: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

// ===== 简历相关 =====
export interface ResumeUploadResponse {
  id: number;
  file_name: string;
  status: number;
  parsed_data: Record<string, unknown> | null;
}

export interface ResumeDetail {
  id: number;
  file_name: string;
  status: number;
  raw_text: string | null;
  parsed_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ResumeListItem {
  id: number;
  file_name: string;
  status: number;
  created_at: string;
}

export interface ResumeListResponse {
  items: ResumeListItem[];
  total: number;
}

// ===== 诊断相关 =====
export interface IssueItem {
  severity: 'critical' | 'warning' | 'info';
  field: string;
  description: string;
  dimension?: string;
  dimension_name?: string;
  locked?: boolean;
}

export interface DimensionDetail {
  score: number;
  max_score: number;
  issues: IssueItem[];
  suggestions: string[];
  keywords_found?: string[];
  keywords_missing?: string[];
  match_keywords?: string[];
  star_rate?: number;
  quant_rate?: number;
}

export interface MatchKeyword {
  keyword: string;
  found: boolean;
  relevance: number;
  note: string;
}

export interface MatchAnalysis {
  overall_rate: number;
  keyword_heatmap: MatchKeyword[];
  skill_gaps: string[];
  recommendations: string[];
}

export interface DiagnosisDetail {
  ats: DimensionDetail;
  content: DimensionDetail;
  project: DimensionDetail;
  match: DimensionDetail;
}

export interface FreePreview {
  total_score: number;
  top_issues: IssueItem[];
  locked_issue: IssueItem | null;
}

export interface ChecklistItem {
  priority: number;
  severity: string;
  dimension: string;
  description: string;
  field: string;
}

export interface DiagnosisResult {
  id: number;
  resume_id: number;
  total_score: number;
  ats_score: number;
  content_score: number;
  project_score: number;
  match_score: number;
  is_unlocked: boolean;
  grade: string;
  overall_assessment?: string;
  match_analysis?: MatchAnalysis;
  free_preview: FreePreview | null;
  priority_checklist: ChecklistItem[] | null;
  detail: DiagnosisDetail | null;
  created_at: string | null;
}

export interface DiagnosisCreateRequest {
  resume_id: number;
  target_job?: string;
}

export interface DiagnosisListItem {
  id: number;
  resume_id: number;
  file_name: string;
  total_score: number;
  ats_score: number;
  content_score: number;
  project_score: number;
  match_score: number;
  is_unlocked: boolean;
  grade: string;
  has_polish: boolean;
  polish_id: number | null;
  created_at: string | null;
}

export interface DiagnosisListResponse {
  items: DiagnosisListItem[];
  total: number;
}

// ===== 润色相关 =====
export interface DiffItem {
  original: string;
  polished: string;
  reason: string;
}

export interface PolishResult {
  id: number;
  resume_id: number;
  polished_text: string;
  diff_data: DiffItem[];
  created_at: string | null;
}

export interface PolishCreateRequest {
  resume_id: number;
}

// ===== 订单相关 =====
export interface OrderInfo {
  order_no: string;
  product_type: number;
  amount: number;
  status: number;
  pay_channel: number;
  created_at: string | null;
  paid_at: string | null;
}

export interface OrderCreateRequest {
  product_type: 1 | 2;
  resume_id: number;
}

export interface MockPayRequest {
  order_no: string;
}

export interface MockPayResponse {
  order_no: string;
  status: number;
  paid_at: string | null;
}
