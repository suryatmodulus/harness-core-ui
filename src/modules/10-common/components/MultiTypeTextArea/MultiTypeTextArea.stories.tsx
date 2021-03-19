import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { TestWrapper } from '@common/utils/testUtils'

import { MultiTypeTextArea, MultiTypeTextAreaProps } from './MultiTypeTextArea'

export default {
  title: 'Forms / MultiTypeTextArea',
  component: MultiTypeTextArea,
  argTypes: {
    expressions: { control: { type: 'array' } },
    name: { control: { type: 'text' } }
  }
} as Meta

export const Basic: Story<MultiTypeTextAreaProps> = args => {
  return (
    <TestWrapper>
      <MultiTypeTextArea enableConfigureOptions name={args.name} expressions={['abc', 'abc.xyz']} />
    </TestWrapper>
  )
}

Basic.args = {
  name: 'fieldName'
}
