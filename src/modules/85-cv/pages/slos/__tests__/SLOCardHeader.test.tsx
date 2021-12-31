import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, waitFor, getByText } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import SLOCardHeader from '../SLOCard/SLOCardHeader'
import type { SLOCardHeaderProps } from '../CVSLOsListingPage.types'
import { testWrapperProps, pathParams, dashboardWidgetsContent } from './CVSLOsListingPage.mock'

const ComponentWrapper: React.FC<Optional<SLOCardHeaderProps>> = ({
  serviceLevelObjective = dashboardWidgetsContent,
  onDelete = jest.fn(),
  ...rest
}) => {
  return (
    <TestWrapper {...testWrapperProps}>
      <SLOCardHeader serviceLevelObjective={serviceLevelObjective} onDelete={onDelete} {...rest} />
    </TestWrapper>
  )
}

describe('SLOCardHeader', () => {
  test('Render sample card', () => {
    const { container } = render(<ComponentWrapper />)

    expect(screen.getByText(dashboardWidgetsContent.title)).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Without monitoredServiceIdentifier, Options button should be rendered', () => {
    const { container } = render(<ComponentWrapper />)

    expect(container.querySelector('[data-icon="Options"]')).toBeInTheDocument()
  })

  test('edit should go to edit page', async () => {
    const { container } = render(<ComponentWrapper />)

    userEvent.click(container.querySelector('[data-icon="Options"]')!)

    expect(document.querySelector('[icon="edit"]')).toBeInTheDocument()

    userEvent.click(document.querySelector('[icon="edit"]')!)

    expect(
      screen.getByText(
        routes.toCVEditSLOs({ ...pathParams, identifier: dashboardWidgetsContent.sloIdentifier, module: 'cv' })
      )
    ).toBeInTheDocument()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('delete should show the conformation dialog', async () => {
    const onDelete = jest.fn()

    const { container } = render(<ComponentWrapper onDelete={onDelete} />)

    userEvent.click(container.querySelector('[data-icon="Options"]')!)

    expect(document.querySelector('[icon="trash"]')).toBeInTheDocument()

    userEvent.click(document.querySelector('[icon="trash"]')!)

    const popover = findPopoverContainer()

    await waitFor(() => expect(popover).toBeInTheDocument())

    expect(getByText(popover!, dashboardWidgetsContent.title)).toBeInTheDocument()

    userEvent.click(getByText(popover!, 'delete'))

    expect(onDelete).toBeCalledWith(dashboardWidgetsContent.sloIdentifier, dashboardWidgetsContent.title)
  })

  test('monitored service should go to Service Health tab', () => {
    render(<ComponentWrapper />)

    expect(screen.getByText(dashboardWidgetsContent.monitoredServiceName)).toBeInTheDocument()

    userEvent.click(screen.getByText(dashboardWidgetsContent.monitoredServiceName))

    expect(
      screen.getByText(
        routes.toCVAddMonitoringServicesEdit({
          ...pathParams,
          identifier: dashboardWidgetsContent.monitoredServiceIdentifier,
          module: 'cv'
        })
      )
    ).toBeInTheDocument()
  })
})
