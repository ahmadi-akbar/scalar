import type { SidebarEntry } from '@/features/Sidebar/types'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'

/**
 * Represents a webhook entry in the sidebar.
 */
type WebhookEntry = {
  id: string
  title: string
  httpVerb: string
  show: boolean
}

/**
 * Creates sidebar entries for webhooks, with optional filtering.
 */
export const getWebhooks = (
  content?: OpenAPIV3_1.Document,
  {
    filter,
  }: {
    /** Optional filter to exclude webhooks, return true to include */
    filter?: (webhook: OpenAPIV3_1.PathItemObject) => boolean
  } = {},
): {
  /** Webhooks grouped by tag */
  tagged: Record<string, SidebarEntry>
  /** Webhooks not grouped by tag */
  untagged: WebhookEntry[]
  /** Map of titles by id */
  titlesById: Record<string, string>
} => {
  const untagged: WebhookEntry[] = []
  const titlesById: Record<string, string> = {}

  // Single pass through webhooks to create entries
  for (const [name, webhook] of Object.entries(content?.webhooks ?? {})) {
    for (const [method, operation] of Object.entries(webhook)) {
      // Skip if operation is not an object
      if (typeof operation !== 'object') {
        continue
      }

      // Apply filter if provided
      if (filter && !filter(operation as OpenAPIV3_1.PathItemObject)) {
        continue
      }

      // Skip internal or ignored webhooks
      if (operation['x-internal'] || operation['x-scalar-ignore']) {
        continue
      }

      const id = `webhook-${name}-${method}`
      const title = operation.summary ?? name
      titlesById[id] = title

      untagged.push({
        id,
        title,
        httpVerb: method,
        show: true,
      })
    }
  }

  return {
    tagged: {},
    untagged,
    titlesById,
  }
}
