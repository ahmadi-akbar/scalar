import type { Meta, StoryObj } from '@storybook/vue3'
import { useLoadingState } from '../ScalarLoading'
import ScalarButton from './ScalarButton.vue'
import { ScalarIconAcorn } from '@scalar/icons'

/**
 * - Default slot must be text only as it becomes the [aria]-label
 * - If you are looking for an icon only button, use ScalarIconButton instead, its a helpful wrapper around this component
 */
const meta = {
  component: ScalarButton,
  tags: ['autodocs'],
  argTypes: {
    class: { control: 'text' },
    size: { control: 'select', options: ['md'] },
    variant: {
      control: 'select',
      options: ['solid', 'outlined', 'ghost', 'danger'],
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
  },
  render: (args) => ({
    components: { ScalarButton },
    setup() {
      return { args }
    },
    template: `<ScalarButton v-bind="args">Button</ScalarButton>`,
  }),
} satisfies Meta<typeof ScalarButton>

export default meta
type Story = StoryObj<typeof meta>

export const Base: Story = {}

export const FullWidth: Story = { args: { fullWidth: true } }

export const Ghost: Story = { args: { variant: 'ghost' } }

export const Danger: Story = {
  args: { variant: 'danger' },

  render: (args) => ({
    components: { ScalarButton },
    setup() {
      return { args }
    },
    template: `<ScalarButton v-bind="args">Delete</ScalarButton>`,
  }),
}

export const Disabled: Story = { args: { disabled: true } }

export const Loading: Story = {
  render: () => ({
    components: { ScalarButton },
    setup() {
      const loadingState = useLoadingState()
      return { loadingState }
    },
    template: `<ScalarButton @click="loadingState.startLoading()" :loading="loadingState">Click me</ScalarButton>`,
  }),
}

export const LoadingFullWidth: Story = {
  render: () => ({
    components: { ScalarButton },
    setup() {
      const loadingState = useLoadingState()
      return { loadingState }
    },
    template: `<ScalarButton @click="loadingState.startLoading()" :loading="loadingState" fullWidth>Click me</ScalarButton>`,
  }),
}

export const WithIcon: Story = {
  render: (args) => ({
    components: { ScalarButton, ScalarIconAcorn },
    setup() {
      return { args }
    },
    template: `
      <ScalarButton :variant="args.variant">
        <template #icon>
          <ScalarIconAcorn class="size-full" />
        </template>
        Button
      </ScalarButton>
    `,
  }),
}

export const CustomClasses: Story = {
  render: () => ({
    components: { ScalarButton },
    template: `<ScalarButton class="items-start font-normal px-9 py-1">I am a weird button</ScalarButton>`,
  }),
}
