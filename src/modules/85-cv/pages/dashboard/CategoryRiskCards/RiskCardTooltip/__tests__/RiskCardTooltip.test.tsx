import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useGetRiskSummaryPopover } from 'services/cv'
import RiskCardTooltip, { getMaxEnvScores, TooltipRow, isRiskLow } from '../RiskCardTooltip'

const responseMock = {
  resource: {
    envSummaries: [
      {
        riskScore: 77,
        envName: 'Production',
        envIdentifier: 'Production',
        serviceSummaries: [
          {
            serviceName: 'Manager',
            serviceIdentifier: 'Manager',
            risk: 77,
            analysisRisks: [
              {
                name: '/todolist/inside - Errors per Minute',
                risk: 80
              }
            ]
          }
        ]
      },
      {
        riskScore: 20,
        envName: 'Production2',
        envIdentifier: 'Production2',
        serviceSummaries: [
          {
            serviceName: 'Manager',
            serviceIdentifier: 'Manager',
            risk: 21,
            analysisRisks: [
              {
                name: '/todolist/inside - Errors per Minute',
                risk: 26
              },
              {
                name: '/todolist/inside - Errors per Minute',
                risk: 22
              },
              {
                name: '/todolist/inside - Errors per Minute',
                risk: 25
              }
            ]
          }
        ]
      }
    ]
  }
}

jest.mock('services/cv', () => ({
  ...(jest.requireActual('services/cv') as any),
  useGetRiskSummaryPopover: jest.fn().mockReturnValue({ data: null, loading: false, refetch: jest.fn() })
}))

describe('RiskCardTooltip', () => {
  test('matches snapshot when empty', () => {
    const { container } = render(
      <TestWrapper>
        <RiskCardTooltip>
          <div />
        </RiskCardTooltip>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('matches snapshot when there is data', async () => {
    let refetchCalled = false
    const useGetRiskSummaryPopoverMocked = useGetRiskSummaryPopover as jest.Mock
    const refetch = jest.fn().mockImplementation(() => (refetchCalled = true))
    useGetRiskSummaryPopoverMocked.mockImplementation(() => ({
      data: refetchCalled ? responseMock : null,
      loading: false,
      refetch
    }))
    render(
      <TestWrapper>
        <RiskCardTooltip tooltipProps={{ isOpen: true }}>
          <div />
        </RiskCardTooltip>
      </TestWrapper>
    )
    await waitFor(() => Promise.resolve())
    expect(refetch).toHaveBeenCalled()
  })

  test('getMaxEnvScores works as expected', () => {
    const values = getMaxEnvScores(responseMock)
    expect(values.Production).toEqual(80)
    expect(values.Production2).toEqual(26)
  })

  test('isRiskLow works as expected', () => {
    expect(isRiskLow(15)).toEqual(true)
    expect(isRiskLow(30)).toEqual(false)
  })

  test('TooltipRow matches snapshot', () => {
    const { container } = render(<TooltipRow name="Errors" risk={22} />)
    expect(container).toMatchSnapshot()
  })
})
