import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes, clickSubmit } from '@common/utils/JestFormHelper'
import { NotificationType } from '@notifications/interfaces/Notifications'
import ConfigureEmailNotifications, {
  TestEmailConfig
} from '../views/ConfigureEmailNotifications/ConfigureEmailNotifications'
import ConfigureSlackNotifications from '../views/ConfigureSlackNotifications/ConfigureSlackNotifications'
import ConfigurePagerDutyNotifications from '../views/ConfigurePagerDutyNotifications/ConfigurePagerDutyNotifications'

const testNotificationMock = jest.fn()
testNotificationMock.mockImplementation((): Promise<{ status: string }> => {
  return Promise.resolve({ status: 'SUCCESS' })
})

jest.mock('services/notifications', () => ({
  useTestNotificationSetting: jest.fn().mockImplementation(() => ({ mutate: testNotificationMock }))
}))

describe('ConfigureNotifications', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Slack', async () => {
    const handleSuccess = jest.fn()

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <ConfigureSlackNotifications hideModal={noop} onSuccess={handleSuccess} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'webhookUrl',
        type: InputTypes.TEXTFIELD,
        value: 'http://valid.url'
      }
    ])

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('test'))
    })

    expect(testNotificationMock).toHaveBeenCalledWith({
      accountId: 'dummy',
      type: 'SLACK',
      recipient: 'http://valid.url',
      notificationId: 'asd'
    })

    clickSubmit(container)

    await waitFor(() =>
      expect(handleSuccess).toHaveBeenCalledWith({
        type: NotificationType.Slack,
        webhookUrl: 'http://valid.url',
        userGroups: []
      })
    )
  })

  test('Email', async () => {
    const handleSuccess = jest.fn()

    const { container } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <ConfigureEmailNotifications hideModal={noop} onSuccess={handleSuccess} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'emailIds',
        type: InputTypes.TEXTAREA,
        value: 'test@harness.io'
      }
    ])

    expect(container).toMatchSnapshot()

    clickSubmit(container)
    await waitFor(() =>
      expect(handleSuccess).toHaveBeenCalledWith({
        type: NotificationType.Email,
        emailIds: ['test@harness.io'],
        userGroups: []
      })
    )
  })

  test('test email works correctly', async () => {
    const handleTest = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <TestEmailConfig handleTest={handleTest} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'to',
        type: InputTypes.TEXTAREA,
        value: 'test@harness.io'
      },
      {
        container,
        fieldId: 'subject',
        type: InputTypes.TEXTAREA,
        value: 'test subject'
      },
      {
        container,
        fieldId: 'body',
        type: InputTypes.TEXTAREA,
        value: 'test body'
      }
    ])

    fireEvent.click(getByText('notifications.buttonSend'))
    await waitFor(() =>
      expect(handleTest).toHaveBeenCalledWith({
        body: 'test body',
        subject: 'test subject',
        to: 'test@harness.io'
      })
    )
  })

  test('PagerDuty', async () => {
    const handleSuccess = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <ConfigurePagerDutyNotifications hideModal={noop} onSuccess={handleSuccess} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'key',
        type: InputTypes.TEXTFIELD,
        value: 'testKey'
      }
    ])

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('test'))
    })

    expect(testNotificationMock).toHaveBeenCalledWith({
      accountId: 'dummy',
      type: 'PAGERDUTY',
      recipient: 'testKey',
      notificationId: 'asd'
    })

    clickSubmit(container)
    await waitFor(() =>
      expect(handleSuccess).toHaveBeenCalledWith({
        type: NotificationType.PagerDuty,
        key: 'testKey',
        userGroups: []
      })
    )
  })
})
