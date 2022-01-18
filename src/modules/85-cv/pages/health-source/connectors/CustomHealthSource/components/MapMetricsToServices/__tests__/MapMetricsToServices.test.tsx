/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
