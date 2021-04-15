import React from 'react'
import {
  act,
  fireEvent,
  getAllByText as getAllByTextGlobal,
  render,
  RenderResult,
  waitFor
} from '@testing-library/react'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { clickSubmit } from '@common/utils/JestFormHelper'
import NotificationTable, { NotificationTableProps } from '../NotificationTable'

const args: NotificationTableProps = {
  data: [
    {
      index: 0,
      notificationRules: {
        name: 'name1',
        enabled: true,
        pipelineEvents: [{ type: 'AllEvents' }, { type: 'PipelineFailed' }],
        notificationMethod: {
          type: 'Slack',
          spec: { userGroups: ['pl-cd-ng'], webhookUrls: 'webhookURL' }
        }
      }
    },
    {
      index: 1,
      notificationRules: {
        name: 'name2',
        enabled: true,
        pipelineEvents: [{ type: 'AllEvents' }],
        notificationMethod: { type: 'Email', spec: { userGroups: ['pl-cd-ng'], recipients: ['abc@harness.io'] } }
      }
    },
    {
      index: 2,
      notificationRules: {
        name: 'name3',
        enabled: true,
        pipelineEvents: [{ type: 'AllEvents' }],
        notificationMethod: { type: 'PagerDuty', spec: { userGroups: ['pl-cd-ng'], integrationKeys: '12345' } }
      }
    }
  ],
  gotoPage: jest.fn(),
  onUpdate: jest.fn(),
  totalPages: 1,
  totalItems: 3,
  pageItemCount: 3,
  pageSize: 5,
  pageIndex: 0,
  onFilterType: _type => undefined,
  filterType: ''
}
describe('Notification Table test', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/projects"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <NotificationTable {...args} />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
    getAllByText = renderObj.getAllByText
  })
  test('render', () => {
    expect(container).toMatchSnapshot()
  }),
    test('Edit Notfication', async () => {
      const menu = container.querySelector(`[data-icon="Options"]`)
      fireEvent.click(menu!)
      const editMenu = getAllByText('edit')
      expect(editMenu).toBeDefined()
      act(() => {
        fireEvent.click(editMenu[0])
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      await act(async () => {
        //Step 1
        if (form) clickSubmit(form)
        await waitFor(() => getAllByTextGlobal(document.body, 'pipeline-notifications.selectPipelineEvents')[0])
      })
      form = findDialogContainer()
      await act(async () => {
        //Step 2
        if (form) clickSubmit(form)
        await waitFor(() => getAllByTextGlobal(document.body, 'pipeline-notifications.notificationMethod')[1])
      })
      form = findDialogContainer()
      await act(async () => {
        //Step 3
        if (form) clickSubmit(form)
      })
    }),
    test('Delete Notfication', async () => {
      const menu = container.querySelector(`[data-icon="Options"]`)
      fireEvent.click(menu!)
      const deleteMenu = getByText('delete')
      expect(deleteMenu).toBeDefined()
      await act(async () => {
        fireEvent.click(deleteMenu!)
      })
    }),
    test('New Notfication', async () => {
      const addNotification = getByText('notifications.name')
      await act(async () => {
        fireEvent.click(addNotification!)
      })
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    })
})
