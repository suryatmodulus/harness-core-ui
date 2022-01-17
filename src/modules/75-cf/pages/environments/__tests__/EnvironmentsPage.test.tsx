/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, getAllByText, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import EnvironmentsPage from '../EnvironmentsPage'
import mockEnvironments from './mockEnvironments'

describe('EnvironmentsPage', () => {
  test('EnvironmentsPage should render loading correctly', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({ loading: true, refetch: jest.fn() })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/environments"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsPage />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
  })

  test('EnvironmentDetails should render error correctly', async () => {
    const message = 'ERROR OCCURS'

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({ error: { message }, refetch: jest.fn() })
    })
    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/environments"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsPage />
      </TestWrapper>
    )
    expect(getByText(document.body, message)).toBeDefined()
  })

  test('EnvironmentDetails should render data correctly', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/environments"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsPage />
      </TestWrapper>
    )

    expect(getAllByText(document.body, mockEnvironments.data.content[0].name)).toBeDefined()
    expect(getAllByText(document.body, mockEnvironments.data.content[1].name)).toBeDefined()
  })

  test('Should go to edit page by clicking a row', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/environments"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsPage />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[role="row"]:not(:first-of-type)') as HTMLElement)

    expect(getByText(container, '/account/dummy/cf/orgs/dummy/projects/dummy/environments/QB')).toBeDefined()
  })

  test('Should go to edit page by clicking edit', async () => {
    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/environments"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsPage />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="edit"]') as HTMLElement)

    expect(getByText(container, '/account/dummy/cf/orgs/dummy/projects/dummy/environments/foobar')).toBeDefined()
  })

  test('Should allow deleting', async () => {
    const mutate = jest.fn(() => {
      return Promise.resolve({ data: {} })
    })

    mockImport('services/cd-ng', {
      useDeleteEnvironmentV2: () => ({
        mutate
      })
    })

    mockImport('services/cd-ng', {
      useGetEnvironmentListForProject: () => ({
        data: mockEnvironments,
        loading: false,
        error: undefined,
        refetch: jest.fn()
      })
    })

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/environments"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <EnvironmentsPage />
      </TestWrapper>
    )

    fireEvent.click(container.querySelector('[role="row"]:not(:first-of-type) [data-icon="Options"]') as HTMLElement)
    fireEvent.click(document.querySelector('[icon="trash"]') as HTMLElement)

    expect(getByText(document.body, 'confirm')).toBeDefined()
    fireEvent.click(getByText(document.body, 'confirm') as HTMLButtonElement)
    await waitFor(() => expect(mutate).toBeCalledTimes(1))
  })
})
