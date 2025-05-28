import { bench, describe, expect } from 'vitest'
import { toValue } from 'vue'
import { createSidebarAmrit } from './create-sidebar-amrit'
import { createSidebar } from './create-sidebar'

// Fetch the Stripe OpenAPI document once for all benchmarks
const EXAMPLE_DOCUMENT = await fetch(
  'https://raw.githubusercontent.com/stripe/openapi/refs/heads/master/openapi/spec3.json',
).then((r) => r.json())

describe('createSidebar', async () => {
  bench('hans (stripe)', async () => {
    const { items } = createSidebar({
      content: EXAMPLE_DOCUMENT,
    })

    expect(toValue(items)).toBeDefined()
  })

  bench('amrit (stripe)', async () => {
    const items = createSidebarAmrit(EXAMPLE_DOCUMENT)

    expect(toValue(items)).toBeDefined()
  })
})
