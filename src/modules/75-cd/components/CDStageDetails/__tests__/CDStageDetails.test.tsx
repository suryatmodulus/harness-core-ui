import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { CDStageDetails } from '../CDStageDetails'
import props from './props.json'

describe('<CDStageDetails /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <CDStageDetails {...(props as any)} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
