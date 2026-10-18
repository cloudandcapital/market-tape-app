import { APIError } from '@anthropic-ai/sdk'

/** Redact before truncating, so even credentials crossing the cutoff are removed. */
export function sanitizeProviderMessage(message: string): string {
  return message
    .replace(/\b(?:authorization|proxy-authorization|x-api-key|api[-_ ]?key|access[-_ ]?token)\b["']?\s*[:=]\s*["']?[^\r\n"',;]+/gi, '[REDACTED]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+\/-]+=*/gi, '[REDACTED]')
    .replace(/\b(?:sk|pk|rk)-(?:ant-)?[A-Za-z0-9_-]+/g, '[REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED]')
    // Provider validation errors can echo a submitted field; retain no such payload.
    .replace(/\b(?:prompt|context|messages|system|input)["']?\s*[:=][^\r\n]*/gi, '[REDACTED INPUT]')
    .replace(/[\r\n\t]+/g, ' ')
    .slice(0, 500)
}

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {}
}

function identifier(value: unknown): string | null {
  return typeof value === 'string' && /^[A-Za-z0-9_.-]{1,120}$/.test(value)
    ? sanitizeProviderMessage(value) : null
}

/** Allowlisted SDK fields only. Never serialize the SDK error, headers, or body. */
export function summarizeProviderError(error: unknown) {
  const name = error instanceof Error ? identifier(error.name) ?? 'Error' : 'UnknownError'
  if (!(error instanceof APIError)) {
    return { name, status: null, type: null, code: null, requestId: null, message: 'Upstream error details unavailable' }
  }
  const body = record(error.error)
  const details = record(body.error)
  return {
    name,
    status: typeof error.status === 'number' ? error.status : null,
    type: identifier(details.type ?? error.type),
    code: identifier(details.code ?? body.code),
    requestId: identifier(error.requestID ?? body.request_id),
    // SDK Error.message can contain the complete JSON response. Use only the
    // provider's nested message field; never fall back to that SDK wrapper.
    message: typeof details.message === 'string'
      ? sanitizeProviderMessage(details.message) : 'Upstream error details unavailable',
  }
}
