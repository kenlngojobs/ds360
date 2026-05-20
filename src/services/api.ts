// ─── DS360 API Service Layer ───────────────────────────────────────────────
// Centralized fetch wrappers for ds360.imaginizedlabs.com/api/*
// All network calls go through here for consistency (auth headers, error handling, etc.)

const BASE_URL = "https://ds360.imaginizedlabs.com/api";

interface ApiError {
  message: string;
  status?: number;
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "User-Agent": "DS360-Frontend/1.0",
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const body = await response.json().catch(() => null);
      if (body?.message) message = body.message;
    } catch {
      // ignore parse errors
    }
    const error = new Error(message) as Error & ApiError;
    error.status = response.status;
    throw error;
  }

  // Handle empty responses
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

// ─── Templates ──────────────────────────────────────────────────────────────

export interface TemplateDocument {
  id: string;
  name: string;
  active: boolean;
  description: string;
  approvalRequired: boolean;
  readOnly: string;
  internalUseOnly: string;
  templateTypeId: string;
}

export interface SavedTemplateData {
  templateName: string;
  config: {
    description: string;
    requiresApproval: boolean;
    readOnlyEdit: boolean;
    internalOnly: boolean;
    reportTemplateType: string;
  };
  elements: unknown[];
}

export const templatesApi = {
  /** GET /api/templates — fetch all templates from DB */
  getAll: () => apiFetch<TemplateDocument[]>("/templates"),

  /** POST /api/templates — create a new template */
  create: (data: TemplateDocument) =>
    apiFetch<TemplateDocument>("/templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /api/templates/:id — update an existing template */
  update: (id: string, data: TemplateDocument) =>
    apiFetch<TemplateDocument>(`/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** DELETE /api/templates/:id — remove a template */
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/templates/${id}`, {
      method: "DELETE",
    }),
};

// ─── Images ─────────────────────────────────────────────────────────────────

export interface ImageDocument {
  id: string;
  name: string;
  active: boolean;
  previewType?: "image" | "svg";
  previewSrc?: string;
  previewAspect?: string;
}

export const imagesApi = {
  /** GET /api/images — fetch all images from DB */
  getAll: () => apiFetch<ImageDocument[]>("/images"),

  /** POST /api/images — create a new image record */
  create: (data: ImageDocument) =>
    apiFetch<ImageDocument>("/images", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /api/images/:id — update an existing image */
  update: (id: string, data: ImageDocument) =>
    apiFetch<ImageDocument>(`/images/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** DELETE /api/images/:id — remove an image */
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/images/${id}`, {
      method: "DELETE",
    }),
};

// ─── Report Fields ───────────────────────────────────────────────────────────

export interface ReportField {
  id: string;
  name: string;
  fieldType: string;
  description: string;
}

export const reportFieldsApi = {
  /** GET /api/report-fields — fetch all report fields */
  getAll: () => apiFetch<ReportField[]>("/report-fields"),

  /** POST /api/report-fields — create a new field */
  create: (data: Omit<ReportField, "id">) =>
    apiFetch<ReportField>("/report-fields", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /api/report-fields/:id — update an existing field */
  update: (id: string, data: Omit<ReportField, "id">) =>
    apiFetch<ReportField>(`/report-fields/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** DELETE /api/report-fields/:id — remove a field */
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/report-fields/${id}`, {
      method: "DELETE",
    }),
};

// ─── Report Template Types ──────────────────────────────────────────────────

export interface ReportTemplateType {
  id: string;
  name: string;
  description: string;
}

export const reportTemplateTypesApi = {
  /** GET /api/template-types — fetch all template types */
  getAll: () => apiFetch<ReportTemplateType[]>("/template-types"),

  /** POST /api/template-types — create a new type */
  create: (data: Omit<ReportTemplateType, "id">) =>
    apiFetch<ReportTemplateType>("/template-types", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** PUT /api/template-types/:id — update an existing type */
  update: (id: string, data: Omit<ReportTemplateType, "id">) =>
    apiFetch<ReportTemplateType>(`/template-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** DELETE /api/template-types/:id — remove a type */
  delete: (id: string) =>
    apiFetch<{ success: boolean }>(`/template-types/${id}`, {
      method: "DELETE",
    }),
};