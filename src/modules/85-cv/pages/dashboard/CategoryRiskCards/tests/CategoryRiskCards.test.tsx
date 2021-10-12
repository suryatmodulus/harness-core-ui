import React from 'react'
import { render, waitFor } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { CategoryRiskCards, CategoryRiskCardsWithApi } from '../CategoryRiskCards'

jest.mock('../RiskCardTooltip/RiskCardTooltip', () => (props: any) => <div>{props.children}</div>)

const MockEmptyResponse = {
  metaData: {},
  resource: {
    startTimeEpoch: 1614136800000,
    endTimeEpoch: 1614137100000,
    hasConfigsSetup: false,
    categoryRisks: null
  },
  responseMessages: []
}

const MockNoAnalysisResponse = {
  metaData: {},
  resource: {
    startTimeEpoch: 1614136800000,
    endTimeEpoch: 1614137100000,
    hasConfigsSetup: true,
    categoryRisks: [
      { category: 'Errors', risk: -1 },
      { category: 'Performance', risk: -1 },
      { category: 'Infrastructure', risk: -1 }
    ]
  },
  responseMessages: []
}

const InvalidTimestampMockApiData: cvService.RestResponseCategoryRisksDTO = {
  metaData: {},
  resource: {
    startTimeEpoch: 0,
    endTimeEpoch: 0,
    categoryRisks: [
      { category: 'INFRASTRUCTURE', risk: 0 },
      { category: 'PERFORMANCE', risk: 0 },
      { category: 'ERRORS', risk: -1 }
    ]
  },
  responseMessages: []
}

describe('Category Risk Cards unit tests', () => {
  test('Ensure that when category risk cards gets an invalid timestamp, it is not rendered.', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CategoryRiskCards data={InvalidTimestampMockApiData} />
      </TestWrapper>
    )
    await waitFor(() => getByText('cv.overall'))
    getByText('cv.currentProductionRisk')
    expect(container.querySelector('[class*="timeRange"]')?.children.length).toBe(1)
  })

  test('Ensure that when -1 is sent as a risk value, the card is rendered in no analysis view', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CategoryRiskCards data={InvalidTimestampMockApiData} />
      </TestWrapper>
    )
    await waitFor(() => getByText('cv.overall'))

    const categoryRiskCards = container.querySelectorAll('[class*="categoryRiskCard"]')
    expect(categoryRiskCards.length).toBe(3)
    expect(categoryRiskCards[2].querySelector('[class*="noRiskScore"]')).not.toBeNull()
  })

  test('Ensure that when noConfig flag is set, overall riskScoree is rendered correctly', async () => {
    jest.spyOn(cvService, 'useGetCategoryRiskMap').mockReturnValue({ data: MockEmptyResponse } as any)
    const { container } = render(
      <TestWrapper>
        <CategoryRiskCardsWithApi />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="overallRiskScoreCardNoData"]')).not.toBeNull())
    expect(container.querySelectorAll('[class*="categoryRiskCard"]').length).toBe(3)
    expect(container.querySelectorAll('[class*="noRiskScore"]').length).toBe(3)
  })

  test('Ensure that when there is no analysis cards are rendered correctly', async () => {
    jest.spyOn(cvService, 'useGetCategoryRiskMap').mockReturnValue({ data: MockNoAnalysisResponse } as any)
    const { container, getByText } = render(
      <TestWrapper>
        <CategoryRiskCardsWithApi />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="overallRiskScoreCard"]')).not.toBeNull())
    getByText('cv.noAnalysis')
    expect(container.querySelectorAll('[class*="categoryRiskCard"]').length).toBe(3)
    expect(container.querySelectorAll('[class*="noRiskScore"]').length).toBe(3)
  })
})
