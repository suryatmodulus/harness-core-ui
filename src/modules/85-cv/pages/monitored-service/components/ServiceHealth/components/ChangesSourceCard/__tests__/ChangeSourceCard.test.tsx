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
  expectedNegativeTextContent
} from './ChangeSourceCard.mock'
import { calculateChangePercentage } from '../ChangesSourceCard.utils'

describe('Test ChangeSourcecard', () => {
  test('should render with positive change', async () => {
    jest.spyOn(cvService, 'useGetChangeSummary').mockImplementation(
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
        <ChangesSourcecard startTime={0} endTime={0} />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.iconContainer span[data-icon="main-caret-up"]').length).toEqual(4)
    container.querySelectorAll('.iconContainer span').forEach(item => {
      expect(item.className).toContain('StyledProps--color-green600')
    })
    container.querySelectorAll('.tickerValue[data-test="tickerValue"]').forEach((item, index) => {
      expect(item.textContent).toEqual(expectedPositiveTextContent[index])
    })
    expect(container).toMatchSnapshot()
  })
  test('should render with negative change', async () => {
    jest.spyOn(cvService, 'useGetChangeSummary').mockImplementation(
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
        <ChangesSourcecard startTime={0} endTime={0} />
      </TestWrapper>
    )

    expect(container.querySelectorAll('.iconContainer span[data-icon="main-caret-down"]').length).toEqual(4)
    container.querySelectorAll('.iconContainer span').forEach(item => {
      expect(item.className).toContain('StyledProps--color-red500')
    })
    container.querySelectorAll('.tickerValue[data-test="tickerValue"]').forEach((item, index) => {
      expect(item.textContent).toEqual(expectedNegativeTextContent[index])
    })
    expect(container).toMatchSnapshot()
  })

  test('validate loading', async () => {
    jest.spyOn(cvService, 'useGetChangeSummary').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: null,
          loading: true
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesSourcecard startTime={0} endTime={0} />
      </TestWrapper>
    )
    expect(container.querySelector('span[data-icon="spinner"]')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('validate error state', async () => {
    jest.spyOn(cvService, 'useGetChangeSummary').mockImplementation(
      () =>
        ({
          data: null,
          refetch: jest.fn(),
          error: { message: '' },
          loading: false
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <ChangesSourcecard startTime={0} endTime={0} />
      </TestWrapper>
    )

    expect(container.querySelector('span[icon="error"]')).toBeTruthy()
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
