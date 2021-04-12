import React from 'react'
import { render, waitFor, queryByText, fireEvent, queryAllByText } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { useStrings } from 'framework/exports'
import { TestWrapper } from '@common/utils/testUtils'

import routes from '@common/RouteDefinitions'
import { pipelinePathProps } from '@common/utils/routeUtils'
import { GetTriggerResponse } from './webhookMockResponses'
import { GetPipelineResponse, GetTriggerListForTargetResponse } from './sharedMockResponses'
import TriggersPage from '../TriggersPage'

const mockDelete = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockUpdateTriggerStatus = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockGetTriggersFunction = jest.fn()
jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => GetPipelineResponse),
  useGetTriggerListForTarget: jest.fn(args => {
    mockGetTriggersFunction(args)
    return GetTriggerListForTargetResponse
  }),
  useGetTrigger: jest.fn(() => GetTriggerResponse),
  useDeleteTrigger: jest.fn().mockImplementation(() => ({ mutate: mockDelete })),
  useUpdateTriggerStatus: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTriggerStatus }))
}))

jest.mock('react-timeago', () => () => 'dummy date')

const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => <TestWrapper>{children}</TestWrapper>
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper
      path={routes.toTriggersPage({ ...pipelinePathProps, module: ':module' })}
      pathParams={{
        projectIdentifier: 'projectIdentifier',
        orgIdentifier: 'orgIdentifier',
        accountId: 'accountId',
        pipelineIdentifier: 'pipelineIdentifier',
        module: 'cd'
      }}
    >
      <TriggersPage />
    </TestWrapper>
  )
}

describe('TriggersPage Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Shows Trigger List', async () => {
      render(<WrapperComponent />)
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      // eslint-disable-next-line no-document-body-snapshot
      expect(document.body).toMatchSnapshot()
    })
  })
  describe('Interactivity', () => {
    test('Delete a trigger', async () => {
      const { container } = render(<WrapperComponent />)
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      const firstActionButton = container.querySelectorAll('[class*="actionButton"]')?.[0]
      if (!firstActionButton) {
        throw Error('No action button')
      }
      fireEvent.click(firstActionButton)

      const deleteButton = queryByText(document.body, result.current.getString('delete'))

      if (!deleteButton) {
        throw Error('No error button')
      }
      fireEvent.click(deleteButton)
      await waitFor(() => expect(result.current.getString('pipeline-triggers.confirmDelete')).not.toBeNull())

      const confirmDeleteButton = document.body.querySelector('[class*="bp3-dialog-footer"] [class*="intent-primary"]')
      if (!confirmDeleteButton) {
        throw Error('No error button')
      }
      fireEvent.click(confirmDeleteButton)

      expect(mockDelete).toBeCalledWith('AllValues', { headers: { 'content-type': 'application/json' } })
    })

    test('Edit a trigger redirects to Trigger Wizard', async () => {
      const { container, getByTestId } = render(<WrapperComponent />)
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      const firstActionButton = container.querySelectorAll('[class*="actionButton"]')?.[0]
      if (!firstActionButton) {
        throw Error('No action button')
      }
      fireEvent.click(firstActionButton)

      const editButton = queryAllByText(document.body, 'edit')[0]

      if (!editButton) {
        throw Error('No edit button')
      }
      fireEvent.click(editButton)
      expect(getByTestId('location')).toMatchInlineSnapshot(`
        <div
          data-testid="location"
        >
          /account/accountId/cd/orgs/orgIdentifier/projects/projectIdentifier/pipelines/pipelineIdentifier/triggers/AllValues
        </div>
      `)
    })

    // eslint-disable-next-line jest/no-disabled-tests
    test.skip('Add a trigger redirects to Trigger Wizard', async () => {
      const { container, getByTestId } = render(
        <TestWrapper>
          <TriggersPage />
        </TestWrapper>
      )
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      const addTriggerButton = queryByText(container, result.current.getString('pipeline-triggers.newTrigger'))
      if (!addTriggerButton) {
        throw Error('No action button')
      }
      fireEvent.click(addTriggerButton)

      expect(getByTestId('location')).toMatchInlineSnapshot()
    })

    test('Search for a trigger shows filtered results', async () => {
      const { container } = render(<WrapperComponent />)
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      const searchInput = container.querySelector('[data-name="search"]')
      if (!searchInput) {
        throw Error('No search input')
      }
      fireEvent.change(searchInput, { target: { value: 'test1' } })

      expect(mockGetTriggersFunction).toBeCalledWith({
        debounce: 300,
        queryParams: {
          projectIdentifier: 'projectIdentifier',
          orgIdentifier: 'orgIdentifier',
          accountIdentifier: 'accountId',
          targetIdentifier: 'pipelineIdentifier',
          searchTerm: 'test1'
        }
      })
    })
  })
})
