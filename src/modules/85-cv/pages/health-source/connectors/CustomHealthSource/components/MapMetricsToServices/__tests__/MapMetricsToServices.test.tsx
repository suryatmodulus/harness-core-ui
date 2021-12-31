import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MapMetricsToServices from '../MapMetricsToServices'

const mappedMetrics = new Map()

const formikProps = {
  values: {
    groupName: 'Group 1',
    metricIdentifier: 'metric101',
    metricName: 'metric 101'
  }
} as any
mappedMetrics.set('metric 101', { ...formikProps })
const selectedMetric = 'metric 101'

jest.mock('@common/components/NameIdDescriptionTags/NameIdDescriptionTags', () => ({
  ...(jest.requireActual('@common/components/NameIdDescriptionTags/NameIdDescriptionTags') as any),
  NameId: function Mock() {
    return <div className="mockNameId" />
  }
}))
describe('Validate MapMetricsToServices conponent', () => {
  test('should render MapMetricsToServices', () => {
    const { container } = render(
      <TestWrapper>
        <MapMetricsToServices mappedMetrics={mappedMetrics} formikProps={formikProps} selectedMetric={selectedMetric} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
