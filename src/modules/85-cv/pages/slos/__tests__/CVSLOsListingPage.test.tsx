import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, waitFor, screen } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import CVSLOsListingPage from '../CVSLOsListingPage'
import type { CVSLOsListingPageProps, SLOCardHeaderProps } from '../CVSLOsListingPage.types'
import {
  testWrapperProps,
  pathParams,
  errorMessage,
  dashboardWidgetsResponse,
  dashboardWidgetsContent,
  userJourneyResponse
} from './CVSLOsListingPage.mock'

jest.mock('@cv/pages/slos/SLOCard/SLOCardHeader.tsx', () => ({
  __esModule: true,
  default: function SLOCardHeader({ onDelete }: SLOCardHeaderProps) {
    return (
      <span data-testid="slo-card-header">
        <button onClick={() => onDelete(dashboardWidgetsContent.sloIdentifier, dashboardWidgetsContent.title)}>
          Delete
        </button>
      </span>
    )
  }
}))

jest.mock('@cv/pages/slos/SLOCard/SLOCardContent.tsx', () => ({
  __esModule: true,
  default: function SLOCardContent() {
    return <span data-testid="slo-card-content" />
  }
}))

const ComponentWrapper: React.FC<CVSLOsListingPageProps> = ({ monitoredServiceIdentifier }) => {
  return (
    <TestWrapper {...testWrapperProps}>
      <CVSLOsListingPage monitoredServiceIdentifier={monitoredServiceIdentifier} />
    </TestWrapper>
  )
}

describe('CVSLOsListingPage', () => {
  let useGetAllJourneys: jest.SpyInstance
  let useGetSLODashboardWidgets: jest.SpyInstance
  let useDeleteSLOData: jest.SpyInstance
  let refetchUserJourneys: jest.Mock
  let refetchDashboardWidgets: jest.Mock

  beforeEach(() => {
    refetchUserJourneys = jest.fn()
    refetchDashboardWidgets = jest.fn()
    useGetAllJourneys = jest.spyOn(cvServices, 'useGetAllJourneys').mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)

    useGetSLODashboardWidgets = jest.spyOn(cvServices, 'useGetSLODashboardWidgets').mockReturnValue({
      data: {},
      loading: false,
      error: null,
      refetch: refetchDashboardWidgets
    } as any)

    useDeleteSLOData = jest
      .spyOn(cvServices, 'useDeleteSLOData')
      .mockReturnValue({ mutate: jest.fn(), loading: false, error: null } as any)
  })

  test('Without monitoredServiceIdentifier it should render with the page header and +New SLO button', () => {
    render(<ComponentWrapper />)

    expect(screen.getByText('cv.slos.title')).toBeInTheDocument()
    expect(screen.getByText('cv.slos.newSLO')).toBeInTheDocument()
  })

  test('With monitoredServiceIdentifier it should not render with the page header and +New SLO button', () => {
    render(<ComponentWrapper monitoredServiceIdentifier="monitored_service_identifier" />)

    expect(screen.queryByText('cv.slos.title')).not.toBeInTheDocument()
    expect(screen.queryByText('cv.slos.newSLO')).not.toBeInTheDocument()
  })

  test('add new SLO should go to create page', async () => {
    render(<ComponentWrapper />)

    userEvent.click(screen.getByText('cv.slos.newSLO'))

    expect(screen.getByText(routes.toCVCreateSLOs({ ...pathParams, module: 'cv' }))).toBeInTheDocument()
  })

  test('it should show the loader while fetching the user journeys', () => {
    useGetAllJourneys.mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() })

    render(<ComponentWrapper />)

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
    expect(screen.queryByText('First Journey')).not.toBeInTheDocument()
  })

  test('it should show the loader while fetching the dashboard widgets', () => {
    useGetSLODashboardWidgets.mockReturnValue({ data: {}, loading: true, error: null, refetch: jest.fn() })

    render(<ComponentWrapper />)

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
    expect(screen.queryByTestId('slo-card-container')).not.toBeInTheDocument()
  })

  test('it should show the loader while deleting a widget', () => {
    useGetAllJourneys.mockReturnValue({ data: userJourneyResponse, loading: false, error: null, refetch: jest.fn() })
    useDeleteSLOData.mockReturnValue({ mutate: jest.fn(), loading: true, error: null })
    useGetSLODashboardWidgets.mockReturnValue({
      data: dashboardWidgetsResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    render(<ComponentWrapper />)

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument()
    expect(screen.getAllByTestId('slo-card-container')).toHaveLength(1)
    expect(screen.getByText('First Journey')).toBeInTheDocument()
  })

  test('page retry should trigger both dashboard widget and user journey APIs when both returned error response', () => {
    useGetAllJourneys.mockReturnValue({
      data: {},
      loading: false,
      error: { message: errorMessage },
      refetch: refetchUserJourneys
    })
    useGetSLODashboardWidgets.mockReturnValue({
      data: {},
      loading: false,
      error: { message: errorMessage },
      refetch: refetchDashboardWidgets
    })

    render(<ComponentWrapper />)

    const onRetryButton = screen.getByRole('button', { name: 'Retry' })

    expect(onRetryButton).toBeInTheDocument()
    expect(refetchUserJourneys).not.toHaveBeenCalled()
    expect(refetchDashboardWidgets).not.toHaveBeenCalled()

    userEvent.click(onRetryButton)

    expect(refetchUserJourneys).toHaveBeenCalled()
    expect(refetchDashboardWidgets).toHaveBeenCalled()
  })

  test('page retry should only trigger the user journey API when dashboard widget API returned success response', () => {
    useGetAllJourneys.mockReturnValue({
      data: {},
      loading: false,
      error: { message: errorMessage },
      refetch: refetchUserJourneys
    })

    render(<ComponentWrapper />)

    const onRetryButton = screen.getByRole('button', { name: 'Retry' })

    expect(onRetryButton).toBeInTheDocument()
    expect(refetchUserJourneys).not.toHaveBeenCalled()

    userEvent.click(onRetryButton)

    expect(refetchUserJourneys).toHaveBeenCalled()
    expect(refetchDashboardWidgets).not.toHaveBeenCalled()
  })

  test('page retry should only trigger the dashboard widget API when userJourney API returned success response', () => {
    useGetSLODashboardWidgets.mockReturnValue({
      data: {},
      loading: false,
      error: { message: errorMessage },
      refetch: refetchDashboardWidgets
    })

    render(<ComponentWrapper />)

    const onRetryButton = screen.getByRole('button', { name: 'Retry' })

    expect(onRetryButton).toBeInTheDocument()
    expect(refetchDashboardWidgets).not.toHaveBeenCalled()

    userEvent.click(onRetryButton)

    expect(refetchUserJourneys).not.toHaveBeenCalled()
    expect(refetchDashboardWidgets).toHaveBeenCalled()
  })

  test('it should render page body no data state only if dashboard widgets and selected user journey are empty', () => {
    render(<ComponentWrapper />)

    expect(screen.getByText('cv.slos.noData')).toBeInTheDocument()
    expect(screen.queryByText('First Journey')).not.toBeInTheDocument()
    expect(screen.queryByTestId('slo-card-container')).not.toBeInTheDocument()
  })

  test('it should only render dashboard widgets when user journeys are empty', () => {
    useGetSLODashboardWidgets.mockReturnValue({
      data: dashboardWidgetsResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    render(<ComponentWrapper />)

    expect(screen.queryByText('First Journey')).not.toBeInTheDocument()
    expect(screen.getByTestId('slo-card-container')).toBeInTheDocument()
  })

  test('User journey filter select and deselect', async () => {
    useGetAllJourneys.mockReturnValue({ data: userJourneyResponse, loading: false, error: null, refetch: jest.fn() })
    useGetSLODashboardWidgets.mockReturnValue({
      data: dashboardWidgetsResponse,
      loading: false,
      error: null,
      refetch: jest.fn()
    })

    const { container } = render(<ComponentWrapper />)

    expect(container).toMatchSnapshot()

    expect(screen.getByText('First Journey')).toBeInTheDocument()
    expect(screen.getAllByTestId('slo-card-container')).toHaveLength(1)
    expect(screen.getAllByTestId('slo-card-header')).toHaveLength(1)
    expect(screen.getAllByTestId('slo-card-content')).toHaveLength(1)

    expect(screen.getByText('First Journey').parentElement).not.toHaveClass('Card--selected')
    expect(screen.getByText('Second Journey').parentElement).not.toHaveClass('Card--selected')

    userEvent.click(screen.getByText('First Journey'))

    expect(screen.getByText('First Journey').parentElement).toHaveClass('Card--selected')

    userEvent.click(screen.getByText('Second Journey'))

    expect(screen.getByText('Second Journey').parentElement).toHaveClass('Card--selected')
    expect(screen.getByText('First Journey').parentElement).not.toHaveClass('Card--selected')

    userEvent.click(screen.getByText('Second Journey'))

    expect(screen.getByText('First Journey').parentElement).not.toHaveClass('Card--selected')
    expect(screen.getByText('Second Journey').parentElement).not.toHaveClass('Card--selected')
  })

  test('deleting a widget', async () => {
    const deleteMutate = jest.fn()
    const refetch = jest.fn()

    useGetAllJourneys.mockReturnValue({ data: userJourneyResponse, loading: false, error: null, refetch: jest.fn() })
    useDeleteSLOData.mockReturnValue({ mutate: deleteMutate, loading: false, error: null })
    useGetSLODashboardWidgets.mockReturnValue({
      data: dashboardWidgetsResponse,
      loading: false,
      error: null,
      refetch: refetch
    })

    render(<ComponentWrapper />)

    expect(screen.getByTestId('slo-card-container')).toBeInTheDocument()

    userEvent.click(screen.getByText('Delete'))

    expect(deleteMutate).toHaveBeenCalledWith(dashboardWidgetsContent.sloIdentifier)

    await waitFor(() => expect(refetch).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText('cv.slos.sloDeleted')).toBeInTheDocument())
  })
})
