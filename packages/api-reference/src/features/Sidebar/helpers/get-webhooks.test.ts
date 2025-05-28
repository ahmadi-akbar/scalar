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

    const filter = (webhook: OpenAPIV3_1.PathItemObject) => {
      const operation = webhook as OpenAPIV3_1.OperationObject
      return operation.tags?.includes('user') ?? false
    }

    const result = getWebhooks(EXAMPLE_DOCUMENT, { filter })

    expect(result).toEqual({
      'user.created': {
        post: {
          operationId: 'userCreated',
          summary: 'User created webhook',
          tags: ['user'],
        },
      },
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
    })
  })

  it('handles webhooks being in tags and untagged ones in the default webook group', async () => {
    expect(
      await getWebhooks({
        webhooks: {
          hello: {
            post: {
              tags: ['Foobar'],
            },
          },
          goodbye: {
            get: {},
          },
        },
      }),
    ).toMatchObject({
      tagged: [],
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
        {
          title: 'Webhooks',
          children: [
            {
              title: 'goodbye',
            },
          ],
        },
      ],
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
