import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Target } from 'services/cf'
import TargetGroupCriteriaTargetListing, {
  TargetGroupCriteriaTargetListingProps
} from '../TargetGroupCriteriaTargetListing'

const renderComponent = (props: Partial<TargetGroupCriteriaTargetListingProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <TargetGroupCriteriaTargetListing {...props} />
    </TestWrapper>
  )

describe('TargetGroupCriteriaTargetListing', () => {
  test('it should display the no target message when no targets are passed', async () => {
    renderComponent()

    expect(screen.getByText('cf.segmentDetail.noTargetDefined')).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })

  test('it should display a list of targets', async () => {
    const targets = [
      { name: 'Target 1', identifier: 't1' },
      { name: 'Target 2', identifier: 't2' },
      { name: 'Target 3', identifier: 't3' }
    ] as Target[]

    renderComponent({ targets })

    expect(screen.queryByText('cf.segmentDetail.noTargetDefined')).not.toBeInTheDocument()
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(targets.length)
  })
})
