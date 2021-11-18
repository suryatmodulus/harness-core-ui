import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { useGetServiceLevelObjectives } from 'services/cv'
import CVSLOsListingPage from '../CVSLOsListingPage'
import { mockedSLOsData } from './CVSLOsListingPage.mock'
import { mockedUserJourneysData } from '../components/CVCreateSLO/components/CreateSLOForm/components/SLOName/__tests__/SLOName.mock'

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVSLOs({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

jest.mock('services/cv', () => ({
  useGetServiceLevelObjectives: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: mockedSLOsData, error: null, refetch: jest.fn() })),
  useDeleteSLOData: jest.fn().mockImplementation(() => ({ loading: false, data: {}, error: null })),
  useGetAllJourneys: jest.fn().mockImplementation(() => ({ loading: false, data: mockedUserJourneysData, error: null }))
}))

describe('Test CVSLOsListingPage component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render CVSLOsListingPage page and display create New SLO Button', async () => {
    const { container, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <CVSLOsListingPage />
      </TestWrapper>
    )
    expect(getByText('cv.slos.newSLO')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Verify if correct number of SLOs cards are rendered', async () => {
    const { getAllByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <CVSLOsListingPage />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getAllByTestId('sloCard')).toHaveLength(3)
    })
  })

  test('Verify if correct number of SLOs cards are rendered for a particular monitored service', async () => {
    ;(useGetServiceLevelObjectives as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: mockedSLOsData,
      error: false
    }))

    const { getAllByTestId } = render(
      <TestWrapper {...testWrapperProps}>
        <CVSLOsListingPage monitoredServiceIdentifier={'monitored-service'} />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getAllByTestId('sloCard')).toHaveLength(3)
    })
  })

  test('Verify if User journey filtering works', async () => {
    ;(useGetServiceLevelObjectives as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: mockedSLOsData,
      error: false,
      refetch: jest.fn()
    }))

    const { getAllByTestId, getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <CVSLOsListingPage />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('journey-3'))
    })

    await waitFor(() => {
      expect(getAllByTestId('sloCard')).toHaveLength(3)
    })
  })
})
