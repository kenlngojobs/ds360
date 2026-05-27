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

  console.log(`[API] ${options.method ?? 'GET'} ${url}`);
  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (networkError) {
    // fetch throws TypeError for network failures (DNS, CORS, connection refused, etc.)
    const msg = networkError instanceof Error ? networkError.message : String(networkError);
    const error = new Error(`Network error: Unable to reach API server. ${msg}`) as Error & ApiError;
    error.status = 0;
    throw error;
  }
  console.log(`[API] ${options.method ?? 'GET'} ${endpoint} → HTTP ${response.status}`);

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
  console.log(`[API] ${options.method ?? 'GET'} ${endpoint} raw body:`, text.substring(0, 500));
  if (!text) return {} as T;

  // Detect HTML responses (auth redirect or server error page)
  const trimmed = text.trimStart();
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<HTML')) {
    const authError = new Error('Authentication required — server returned a login page instead of data. The API server may be down or requires authentication.') as Error & ApiError;
    authError.status = 401;
    throw authError;
  }

  // Also check content-type header for HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('text/html') && !contentType.includes('application/json')) {
    const authError = new Error('Authentication required — server returned HTML instead of JSON. The API server may be down or requires authentication.') as Error & ApiError;
    authError.status = 401;
    throw authError;
  }

  const parsed = JSON.parse(text);
  // Some APIs wrap responses in {result, data} — unwrap if present
  const result = parsed.data ?? parsed;
  console.log(`[API] ${endpoint} parsed:`, result);
  return result as T;
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
  /** Server-persisted builder data — mapped from snake_case server fields */
  configJson?: string;
  elementsJson?: string;
  typographyJson?: string;
}

/** Convert server snake_case response to frontend camelCase; null → undefined */
function normalizeTemplate(doc: Record<string, unknown>): TemplateDocument {
  const pick = (keys: string[]): string | undefined => {
    for (const k of keys) {
      const v = doc[k];
      if (v !== undefined && v !== null) return String(v);
    }
    return undefined;
  };
  return {
    id: String(doc.id ?? ''),
    name: String(doc.name ?? ''),
    active: Boolean(doc.active ?? false),
    description: String(doc.description ?? ''),
    approvalRequired: Boolean(doc.approvalRequired ?? doc.approval_required ?? false),
    readOnly: String(doc.readOnly ?? doc.read_only ?? ''),
    internalUseOnly: String(doc.internalUseOnly ?? doc.internal_use_only ?? ''),
    templateTypeId: String(doc.templateTypeId ?? doc.template_type_id ?? doc.templateTypeId ?? ''),
    configJson: pick(['configJson', 'config_json']),
    elementsJson: pick(['elementsJson', 'elements_json']),
    typographyJson: pick(['typographyJson', 'typography_json']),
  };
}

/** Convert frontend camelCase to server snake_case for POST/PUT */
function denormalizeTemplate(doc: TemplateDocument): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    id: doc.id,
    name: doc.name,
    active: doc.active,
    description: doc.description,
    approval_required: doc.approvalRequired,
    read_only: doc.readOnly,
    internal_use_only: doc.internalUseOnly,
    template_type_id: doc.templateTypeId,
  };
  if (doc.configJson !== undefined) payload.config_json = doc.configJson;
  if (doc.elementsJson !== undefined) payload.elements_json = doc.elementsJson;
  if (doc.typographyJson !== undefined) payload.typography_json = doc.typographyJson;
  return payload;
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
  /** GET /api/templates — fetch all templates from DB (metadata only) */
  getAll: async () => {
    const raw = await apiFetch<Record<string, unknown>[]>("/templates");
    return raw.map(normalizeTemplate);
  },

  /** GET /api/templates/:id — fetch a single template with full builder data */
  getOne: async (id: string) => {
    const raw = await apiFetch<Record<string, unknown>>(`/templates/${id}`);
    return normalizeTemplate(raw);
  },

  /** POST /api/templates — create or upsert a template (with builder data) */
  create: async (data: TemplateDocument) => {
    const payload = denormalizeTemplate(data);
    const raw = await apiFetch<Record<string, unknown>>("/templates", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return normalizeTemplate(raw);
  },

  /** PUT /api/templates/:id — update an existing template (with builder data) */
  update: async (id: string, data: TemplateDocument) => {
    const payload = denormalizeTemplate(data);
    const raw = await apiFetch<Record<string, unknown>>(`/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    return normalizeTemplate(raw);
  },

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