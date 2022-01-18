/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { render, screen, getByText } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
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

  test('delete should show the conformation dialog', async () => {
    const onDelete = jest.fn()

    const { container } = render(<ComponentWrapper onDelete={onDelete} />)

    userEvent.click(container.querySelector('[data-icon="Options"]')!)

    const popover = findPopoverContainer()

    expect(getByText(popover!, 'delete')).toBeInTheDocument()

    userEvent.click(getByText(popover!, 'delete'))

    const dialogContainer = findDialogContainer()

    expect(getByText(dialogContainer!, 'delete')).toBeInTheDocument()

    userEvent.click(getByText(dialogContainer!, 'delete'))

    expect(onDelete).toBeCalledWith(dashboardWidgetsContent.sloIdentifier, dashboardWidgetsContent.title)
  })

  test('monitored service should go to Service Health tab', () => {
    render(<ComponentWrapper />)

    expect(screen.getByText(dashboardWidgetsContent.serviceName as string)).toBeInTheDocument()

    userEvent.click(screen.getByText(dashboardWidgetsContent.serviceName as string))

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
