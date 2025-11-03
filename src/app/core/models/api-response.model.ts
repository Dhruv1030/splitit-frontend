export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  timestamp?: string;
  status?: number;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  status: number;
  path?: string;
  fieldErrors?: { [key: string]: string };
}
