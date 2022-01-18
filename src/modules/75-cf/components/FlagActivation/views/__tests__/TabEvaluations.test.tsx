/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { screen, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Feature } from 'services/cf'
import { TabEvaluations } from '../TabEvaluations'

jest.mock('services/cf', () => ({
  useGetFeatureEvaluations: () => {
    return {
      data: [
        { count: 3, date: 1629849600000, variationIdentifier: 'false', variationName: 'False' },
        { count: 3, date: 1629936000000, variationIdentifier: 'false', variationName: 'False' },
        { count: 10, date: 1630022400000, variationIdentifier: 'false', variationName: 'False' }
      ]
    }
  }
}))

describe('TabEvaluations Tests', () => {
  const renderComponent = (): HTMLElement => {
    const start = new Date('2021-08-20T00:00:00.000Z')
    const end = new Date('2021-08-27T00:00:00.000Z')

    const mockFlagData: Feature = {
      archived: false,
      createdAt: 1629119949873,
      defaultOffVariation: 'false',
      defaultOnVariation: 'true',
      evaluation: '',
      identifier: 'fleg',
      kind: 'boolean',
      modifiedAt: 1629370565062,
      name: 'fleg',
      owner: ['chris.blakely@harness.io'],
      permanent: false,
      prerequisites: [],
      project: 'conor_ff_metrics',
      variations: [
        { identifier: 'true', name: 'True', value: 'true' },
        { identifier: 'false', name: 'False', value: 'false' }
      ]
    }

    const { container } = render(
      <TestWrapper>
        <TabEvaluations startDate={start} endDate={end} flagData={mockFlagData} />
      </TestWrapper>
    )

    return container
  }

  test('it renders chart with correct x axis', () => {
    renderComponent()

    expect(screen.getByText('Aug 20')).toBeInTheDocument()
    expect(screen.getByText('Aug 21')).toBeInTheDocument()
    expect(screen.getByText('Aug 22')).toBeInTheDocument()
    expect(screen.getByText('Aug 23')).toBeInTheDocument()
    expect(screen.getByText('Aug 24')).toBeInTheDocument()
    expect(screen.getByText('Aug 25')).toBeInTheDocument()
    expect(screen.getByText('Aug 26')).toBeInTheDocument()
    expect(screen.getByText('Aug 27')).toBeInTheDocument()
  })

  test('it displays correct number of Flag Evaluations', () => {
    renderComponent()

    expect(screen.getByText('16')).toBeInTheDocument()
  })
})
