/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import ChangesSourcecard from '../ChangesSourceCard'
import {
  changeSummary,
  changeSummaryWithPositiveChange,
  changeSummaryWithNegativeChange,
  changeSoureCardData,
  changeSoureCardDataWithPositiveGrowth,
  expectedPositiveTextContent,
  expectedNegativeTextContent,
  changeSummaryWithAbove100PositiveChange,
  expectedAbove100PositiveTextContent
} from './ChangeSourceCard.mock'
import { calculateChangePercentage } from '../ChangesSourceCard.utils'

const serviceIdentifier = 'service101'
const environmentIdentifier = 'environment101'
describe('Test ChangeSourcecard', () => {
  test('should render with positive change', async () => {
    jest.spyOn(cvService, 'useChangeEventSummary').mockImplementation(
      () =>
        ({
          data: { resource: { ...changeSummaryWithPositiveChange } },
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesSourcecard
          startTime={0}
          endTime={0}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.iconContainer span[data-icon="main-caret-up"]').length).toEqual(4)
    container.querySelectorAll('.tickerValue[data-test="tickerValue"]').forEach((item, index) => {
      expect(item.textContent).toEqual(expectedPositiveTextContent[index])
    })
    expect(container).toMatchSnapshot()
  })
  test('should render with negative change', async () => {
    jest.spyOn(cvService, 'useChangeEventSummary').mockImplementation(
      () =>
        ({
          data: { resource: { ...changeSummaryWithNegativeChange } },
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesSourcecard
          startTime={0}
          endTime={0}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.iconContainer span[data-icon="main-caret-down"]').length).toEqual(4)
    container.querySelectorAll('.tickerValue[data-test="tickerValue"]').forEach((item, index) => {
      expect(item.textContent).toEqual(expectedNegativeTextContent[index])
    })
    expect(container).toMatchSnapshot()
  })

  test('should render with above 100 positive change', async () => {
    jest.spyOn(cvService, 'useChangeEventSummary').mockImplementation(
      () =>
        ({
          data: { resource: { ...changeSummaryWithAbove100PositiveChange } },
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesSourcecard
          startTime={0}
          endTime={0}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.iconContainer span[data-icon="main-caret-up"]').length).toEqual(4)
    container.querySelectorAll('.tickerValue[data-test="tickerValue"]').forEach((item, index) => {
      expect(item.textContent).toEqual(expectedAbove100PositiveTextContent[index])
    })
    expect(container).toMatchSnapshot()
  })

  test('validate loading', async () => {
    jest.spyOn(cvService, 'useChangeEventSummary').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )
    const { container, getAllByTestId } = render(
      <TestWrapper>
        <ChangesSourcecard
          startTime={0}
          endTime={0}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
        />
      </TestWrapper>
    )
    expect(getAllByTestId('loading-block')).toHaveLength(4)
    expect(container).toMatchSnapshot()
  })

  test('validate error state', async () => {
    jest.spyOn(cvService, 'useChangeEventSummary').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <ChangesSourcecard
          startTime={0}
          endTime={0}
          serviceIdentifier={serviceIdentifier}
          environmentIdentifier={environmentIdentifier}
        />
      </TestWrapper>
    )

    expect(getByText('cv.monitoredServices.failedToFetchSummaryData')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('validate calculateChangePercentage', () => {
    const getString = (val: string): string => val
    expect(calculateChangePercentage(changeSummary, getString)).toEqual(changeSoureCardData)
    expect(calculateChangePercentage(changeSummaryWithPositiveChange, getString)).toEqual(
      changeSoureCardDataWithPositiveGrowth
    )
  })
})
