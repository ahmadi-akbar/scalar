import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import { describe, expect, it } from 'vitest'
import { getWebhooks } from './get-webhooks'

describe('getWebhooks', () => {
  it('returns empty objects when no content is provided', () => {
    const result = getWebhooks()
    expect(result).toEqual({ tagged: {}, untagged: [], titlesById: {} })
  })

  it('returns empty objects when content has no webhooks', () => {
    const EXAMPLE_DOCUMENT = {} as OpenAPIV3_1.Document
    const result = getWebhooks(EXAMPLE_DOCUMENT)
    expect(result).toEqual({ tagged: {}, untagged: [], titlesById: {} })
  })

  it('returns webhooks from OpenAPI 3.x document', () => {
    const EXAMPLE_DOCUMENT = {
      webhooks: {
        'user.created': {
          post: {
            operationId: 'userCreated',
            summary: 'User created webhook',
          },
        },
        'user.updated': {
          put: {
            operationId: 'userUpdated',
            summary: 'User updated webhook',
          },
        },
      },
    } as OpenAPIV3_1.Document

    const result = getWebhooks(EXAMPLE_DOCUMENT)

    expect(result).toEqual({
      tagged: {},
      untagged: [
        {
          id: 'webhook-user.created-post',
          title: 'User created webhook',
          httpVerb: 'post',
          show: true,
        },
        {
          id: 'webhook-user.updated-put',
          title: 'User updated webhook',
          httpVerb: 'put',
          show: true,
        },
      ],
      titlesById: {
        'webhook-user.created-post': 'User created webhook',
        'webhook-user.updated-put': 'User updated webhook',
      },
    })
  })

  it('filters webhooks based on provided filter function', () => {
    const EXAMPLE_DOCUMENT = {
      webhooks: {
        'user.created': {
          post: {
            operationId: 'userCreated',
            summary: 'User created webhook',
            tags: ['user'],
          },
          delete: {
            operationId: 'userDeleted',
            summary: 'User deleted webhook',
            tags: ['admin'],
          },
        },
        'user.updated': {
          put: {
            operationId: 'userUpdated',
            summary: 'User updated webhook',
            tags: ['admin'],
          },
        },
      },
    } as OpenAPIV3_1.Document

    const filter = (webhook: OpenAPIV3_1.OperationObject) => webhook.tags?.includes('user')
    const result = getWebhooks(EXAMPLE_DOCUMENT, { filter })

    expect(result).toEqual({
      tagged: {
        user: {
          id: 'webhook-user.created-post',
          title: 'User created webhook',
          httpVerb: 'post',
          show: true,
        },
      },
      titlesById: {
        'webhook-user.created-post': 'User created webhook',
      },
      untagged: [],
    })
  })

  it('handles webhooks with multiple HTTP methods', () => {
    const EXAMPLE_DOCUMENT = {
      webhooks: {
        'user.events': {
          post: {
            operationId: 'userCreated',
            summary: 'User created webhook',
          },
          put: {
            operationId: 'userUpdated',
            summary: 'User updated webhook',
          },
          delete: {
            operationId: 'userDeleted',
            summary: 'User deleted webhook',
          },
        },
      },
    } as OpenAPIV3_1.Document

    const result = getWebhooks(EXAMPLE_DOCUMENT)
    expect(result).toEqual({
      tagged: {},
      untagged: [
        {
          id: 'webhook-user.events-post',
          title: 'User created webhook',
          httpVerb: 'post',
          show: true,
        },
        {
          id: 'webhook-user.events-put',
          title: 'User updated webhook',
          httpVerb: 'put',
          show: true,
        },
        {
          id: 'webhook-user.events-delete',
          title: 'User deleted webhook',
          httpVerb: 'delete',
          show: true,
        },
      ],
      titlesById: {
        'webhook-user.events-post': 'User created webhook',
        'webhook-user.events-put': 'User updated webhook',
        'webhook-user.events-delete': 'User deleted webhook',
      },
    })
  })

  it('handles tagged and untagged webhooks', async () => {
    const EXAMPLE_DOCUMENT = {
      webhooks: {
        'user.events': {
          post: {
            tags: ['user'],
          },
          put: {},
          delete: {
            tags: ['admin'],
          },
        },
        'admin.events': {
          post: {
            tags: ['admin'],
          },
        },
      },
    } as OpenAPIV3_1.Document

    const result = getWebhooks(EXAMPLE_DOCUMENT)
    expect(result).toEqual({
      tagged: {},
      untagged: [
        {
          id: 'webhook-user.events-post',
          title: 'User created webhook',
          httpVerb: 'post',
          show: true,
        },
        {
          id: 'webhook-user.events-put',
          title: 'User updated webhook',
          httpVerb: 'put',
          show: true,
        },
        {
          id: 'webhook-user.events-delete',
          title: 'User deleted webhook',
          httpVerb: 'delete',
          show: true,
        },
      ],
      titlesById: {
        'webhook-user.events-post': 'User created webhook',
        'webhook-user.events-put': 'User updated webhook',
        'webhook-user.events-delete': 'User deleted webhook',
      },
    })
  })

  it('handles when webhooks are only in tags, there should be no webhook group', async () => {
    expect(
      await getItemsForDocument({
        openapi: '3.1.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        paths: {
          '/hello': {
            get: {
              summary: 'Hello World',
              tags: ['Foobar'],
            },
          },
        },
        webhooks: {
          hello: {
            post: {
              tags: ['Foobar'],
            },
          },
        },
      }),
    ).toMatchObject({
      entries: [
        {
          title: 'Foobar',
          children: [
            {
              title: 'Hello World',
            },
            {
              title: 'hello',
            },
          ],
        },
      ],
    })
  })

  it('handles only webhooks in tags', async () => {
    expect(
      await getItemsForDocument({
        openapi: '3.1.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        webhooks: {
          hello: {
            post: {
              tags: ['Foobar'],
            },
          },
        },
      }),
    ).toMatchObject({
      entries: [
        {
          title: 'Foobar',
          children: [
            {
              title: 'hello',
            },
          ],
        },
      ],
    })
  })

  it('handles only webhooks outside tags', async () => {
    expect(
      await getItemsForDocument({
        openapi: '3.1.0',
        info: {
          title: 'Hello World',
          version: '1.0.0',
        },
        webhooks: {
          hello: {
            post: {},
          },
        },
      }),
    ).toMatchObject({
      entries: [
        {
          title: 'Webhooks',
          children: [
            {
              title: 'hello',
            },
          ],
        },
      ],
    })
  })
})
