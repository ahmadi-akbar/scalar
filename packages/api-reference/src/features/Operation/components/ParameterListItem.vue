<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/vue'
import { ScalarIcon, ScalarMarkdown } from '@scalar/components'
import type { Request as RequestEntity } from '@scalar/oas-utils/entities/spec'
import { getObjectKeys, isDefined } from '@scalar/oas-utils/helpers'
import type { OpenAPIV3_1 } from '@scalar/openapi-types'
import type { ContentType } from '@scalar/types/legacy'
import { computed, ref } from 'vue'

import { SchemaProperty } from '@/components/Content/Schema'

import ContentTypeSelect from './ContentTypeSelect.vue'
import ParameterHeaders from './ParameterHeaders.vue'

const { parameter, withExamples, schemas, collapsableItems } = withDefaults(
  defineProps<{
    parameter: OpenAPIV3_1.ParameterObject
    showChildren?: boolean
    collapsableItems?: boolean
    withExamples?: boolean
    schemas?: Record<string, OpenAPIV3_1.SchemaObject> | unknown
  }>(),
  {
    showChildren: false,
    collapsableItems: false,
    withExamples: true,
  },
)

const contentTypes = computed(() => getObjectKeys(parameter.content ?? {}))
const selectedContentType = ref<ContentType>(
  contentTypes.value[0] as ContentType,
)
if (parameter.content) {
  if ('application/json' in parameter.content) {
    selectedContentType.value = 'application/json'
  }
}

/**
 * Determines if a parameter item should be collapsible based on its content.
 * A parameter is collapsible when both of the following are true:
 * 1. The collapsableItems prop is enabled
 * 2. The parameter has content, headers, or a schema to display
 */
const shouldCollapse = computed<boolean>(() =>
  Boolean(
    collapsableItems &&
      (parameter.content || parameter.headers || parameter.schema),
  ),
)

/**
 * Determines whether a parameter should be displayed in the UI.
 * Parameters marked as readOnly are hidden since they cannot be modified.
 * This is used to filter out read-only parameters from the request data display.
 */
const shouldShowParameter = computed(() => parameter.readOnly !== true)

const value = computed(() => ({
  // 1. Schema Selection
  ...(parameter.content
    ? parameter.content?.[selectedContentType.value]?.schema
    : parameter.schema),

  // 2. Deprecated Flag
  deprecated: parameter.deprecated,

  // 3. Example Handling
  ...(isDefined(parameter.example) && { example: parameter.example }),

  // 4. Examples Object
  examples: parameter.content
    ? {
        ...parameter.examples,
        ...parameter.content?.[selectedContentType.value]?.examples,
      }
    : parameter.examples ||
      // @ts-expect-error - here from before, just do we don't break anything
      parameter.schema?.examples,
}))
</script>
<template>
  <li
    v-if="shouldShowParameter"
    class="parameter-item group/parameter-item relative">
    <Disclosure v-slot="{ open }">
      <DisclosureButton
        v-if="shouldCollapse"
        class="parameter-item-trigger flex"
        :class="{ 'parameter-item-trigger-open': open }">
        <ScalarIcon
          class="parameter-item-icon size-4.5"
          :icon="open ? 'ChevronDown' : 'ChevronRight'"
          thickness="1.5" />
        <span class="parameter-item-name">
          {{ parameter.name }}
        </span>
        <span class="parameter-item-type">
          <ScalarMarkdown
            v-if="parameter.description"
            class="markdown"
            :value="parameter.description" />
        </span>
      </DisclosureButton>
      <DisclosurePanel
        class="parameter-item-container parameter-item-container-markdown"
        :static="!shouldCollapse">
        <!-- Does this do anything? -->
        <!-- <ParameterHeaders
          v-if="parameter.headers"
          :headers="parameter.headers" /> -->
        <SchemaProperty
          is="div"
          compact
          :description="shouldCollapse ? '' : parameter.description"
          :name="shouldCollapse ? '' : parameter.name"
          :noncollapsible="true"
          :required="parameter.required"
          :schemas="schemas"
          :value="value"
          :withExamples="withExamples" />
      </DisclosurePanel>
    </Disclosure>
    <div
      class="absolute top-2.5 right-0 opacity-0 group-focus-within/parameter-item:opacity-100 group-hover/parameter-item:opacity-100">
      <ContentTypeSelect
        v-if="shouldCollapse && parameter.content"
        class="parameter-item-content-type"
        :defaultValue="selectedContentType"
        :requestBody="parameter"
        @selectContentType="
          ({ contentType }) => (selectedContentType = contentType)
        " />
    </div>
  </li>
</template>

<style scoped>
.parameter-item {
  display: flex;
  flex-direction: column;
  border-top: var(--scalar-border-width) solid var(--scalar-border-color);
}
.parameter-item:last-of-type .parameter-schema {
  padding-bottom: 0;
}
.parameter-item-container {
  padding: 0;
}

.parameter-item-headers {
  border: var(--scalar-border-width) solid var(--scalar-border-color);
}

.parameter-item-name {
  margin-right: 6px;
  font-weight: var(--scalar-semibold);
  font-size: var(--scalar-font-size-3);
  font-family: var(--scalar-font-code);
  color: var(--scalar-color-1);
}
.parameter-item-type {
  font-size: var(--scalar-micro);
  color: var(--scalar-color-2);
  margin-right: 6px;
  line-height: 1.4;
  white-space: nowrap;
  text-overflow: ellipsis;
  width: 100%;
  overflow: hidden;
}
.parameter-item-trigger-open .parameter-item-type {
  white-space: normal;
}
/* Match font size of markdown for property-detail-value since first child within accordian is displayed as if it were in the markdown section */
.parameter-item-trigger
  + .parameter-item-container
  :deep(.property--level-0 > .property-heading .property-detail-value) {
  font-size: var(--scalar-micro);
}
.parameter-item-required-optional {
  color: var(--scalar-color-2);
  font-weight: var(--scalar-semibold);
  margin-right: 6px;
  position: relative;
}

.parameter-item--required {
  text-transform: uppercase;
  font-size: var(--scalar-micro);
  font-weight: var(--scalar-semibold);
  color: var(--scalar-color-orange);
}

.parameter-item-description {
  margin-top: 3px !important;
  font-size: var(--scalar-small);
  color: var(--scalar-color-2);
  line-height: 1.4;
}

.parameter-item-description :deep(p) {
  margin-top: 4px;
  font-size: var(--scalar-small);
  color: var(--scalar-color-2);
  line-height: 1.4;
}

.parameter-schema {
  padding-bottom: 9px;
  margin-top: 3px;
}
.parameter-item-trigger {
  padding: 12px 0;
  cursor: pointer;
  outline: none;
  text-align: left;
  position: relative;
  align-items: baseline;
}

.parameter-item-trigger-open {
  padding-bottom: 0;
}
.parameter-item-trigger:after {
  content: '';
  position: absolute;
  height: 10px;
  width: 100%;
  bottom: 0;
}
.parameter-item-icon {
  color: var(--scalar-color-3);
  left: -19px;
  position: absolute;
  top: 11px;
}
.parameter-item-trigger:hover .parameter-item-icon,
.parameter-item-trigger:focus-visible .parameter-item-icon {
  color: var(--scalar-color-1);
}
.parameter-item-trigger:focus-visible .parameter-item-icon {
  outline: 1px solid var(--scalar-color-accent);
  outline-offset: 2px;
  border-radius: var(--scalar-radius);
}
</style>
