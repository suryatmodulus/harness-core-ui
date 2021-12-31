import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import NewRelicMappedMetric from '../NewRelicMappedMetric'
import { connectorIdentifier, formikValues, mappedMetricsMap } from './NewRelicMappedMetric.mock'

jest.mock('@cv/components/QueryViewer/QueryViewer', () => ({
  ...(jest.requireActual('@cv/components/QueryViewer/QueryViewer') as any),
  QueryViewer: function Mock(props: any) {
    return <button className="mockFetchRecords" onClick={() => props.fetchRecords()} />
  }
}))

jest.mock('@cv/components/MultiItemsSideNav/MultiItemsSideNav', () => ({
  ...(jest.requireActual('@cv/components/MultiItemsSideNav/MultiItemsSideNav') as any),
  MultiItemsSideNav: function Mock() {
    return <div className="sideNavContainer" />
  }
}))

jest.mock('@common/components/NameIdDescriptionTags/NameIdDescriptionTags', () => ({
  ...(jest.requireActual('@common/components/NameIdDescriptionTags/NameIdDescriptionTags') as any),
  NameId: function Mock() {
    return <div className="mockNameId" />
  }
}))

describe('NewRelicMappedMetric component', () => {
  const refetchMock = jest.fn()

  beforeAll(() => {
    jest
      .spyOn(cvServices, 'useGetMetricPacks')
      .mockReturnValue({ loading: false, error: null, data: {}, refetch: refetchMock } as any)
    jest
      .spyOn(cvServices, 'useGetLabelNames')
      .mockReturnValue({ loading: false, error: null, data: {}, refetch: refetchMock } as any)

    jest.spyOn(cvServices, 'useFetchParsedSampleData').mockReturnValue({ mutate: jest.fn() } as any)
  })

  test('should render query viewer', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(cvServices, 'useGetSampleDataForNRQL').mockReturnValue({ refetch: refetchFn } as any)

    const { container, getByText } = render(
      <TestWrapper>
        <NewRelicMappedMetric
          setMappedMetrics={jest.fn()}
          selectedMetric={'newRelic new'}
          formikValues={formikValues as any}
          formikSetField={jest.fn()}
          connectorIdentifier={connectorIdentifier}
          mappedMetrics={mappedMetricsMap}
          createdMetrics={['newRelic', 'newRelic new']}
          isValidInput={true}
          setCreatedMetrics={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('cv.healthSource.connectors.NewRelic.queryMapping')).not.toBeNull())

    fireEvent.click(getByText('cv.healthSource.connectors.NewRelic.queryMapping'))
    await waitFor(() => expect(container.querySelector('[class*="mockFetchRecords"]')).not.toBeNull())
    fireEvent.click(container.querySelector('[class*="mockFetchRecords"]')!)
    await waitFor(() => expect(refetchFn).toHaveBeenCalled())
  })
})
