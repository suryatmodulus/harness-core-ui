import React from 'react'
import { render } from '@testing-library/react'
import { Connectors } from '@connectors/constants'
import { TestWrapper } from '@common/utils/testUtils'
import SplunkHealthSource from '../SplunkHealthSource'
import { data } from './SplunkHealthSource.mock'
import { mockedSplunkSampleData } from './SplunkHealthSource.mock'

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { sourceType: Connectors.SPLUNK },
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

jest.mock('services/cv', () => ({
  useGetSplunkSavedSearches: jest.fn().mockImplementation(() => ({
    data: []
  })),
  useGetSplunkSampleData: jest.fn().mockImplementation(() => ({
    data: mockedSplunkSampleData,
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('test splunkHealthsource', () => {
  test('check snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <SplunkHealthSource data={data} onSubmit={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
