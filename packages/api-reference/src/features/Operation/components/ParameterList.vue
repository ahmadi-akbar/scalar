<script setup lang="ts">
import type { Request as RequestEntity } from '@scalar/oas-utils/entities/spec'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'

import ParameterListItem from './ParameterListItem.vue'

/**
 * Type guard to check if an object is a ParameterObject
 */
function isParameterObject(
  obj: OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ResponseObject
): obj ibject {
  return 'name' in obj && 'in' in obj
}

withDefaults(
  defineProps<{
    parameters?: (OpenAPIV3_1.ParameterObject | OpenAPIV3_1.ResponseObject)[]
    showChildren?: boolean
    collapsableItems?: boolean
    statusCode?: string
    withExamples?: boolean
    schemas?: Record<string, OpenAPIV3_1.SchemaObject> | unknown
  }>(),
  {
    showChildren: false,
    collapsableItems: false,
    withExamples: true,
  },
)
</script>
<template>
  <div
    v-if=">
    <dimeter-list-title">
      <slot name="title" />
    </div>
    <ul class="parameter-list-items">
      <ParameterListItem
        v-for="item in parameters"
        :key="isParameterObject(item) ? item.name : statusCode"
        :collapsableItems="collapsableItems"
        :parameter="item"
        :schemas="schemas"
        :showChildren="showChildren"
        :withExamples="withExamples" />
    </ul>
  </div>
</template>

<style scoped>
.parameter-list {
  margin-top: 24px;
}
.parameter-list-title {
  font-size: var(--scalar-font-size-2);
  font-weight: var(--scalar-semibold);
  color: var(--scalar-color-1);
  line-height: 1.45;
  margin-top: 12px;
  margin-bottom: 12px;
}

.parameter-list-items {
  list-style: none;
  padding: 0;
  margin: 0;
  font-size: var(--scalar-small);
  margin-bottom: 12px;
}
</style>
