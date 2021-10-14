import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import OverviewGlanceCards from '../OverviewGlanceCards'

describe('OverviewGlanceCards', () => {
  test('OverviewGlanceCards rendering', async () => {
    const { container } = render(
      <TestWrapper>
        {/* Todo: @sunnykesh : Add tests for different timeranges after API integration,
         right now GlanceCards using mock data in components itself. */}
        <OverviewGlanceCards range={[]} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
