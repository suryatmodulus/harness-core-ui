import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { renderHook } from '@testing-library/react-hooks'
import type { UseGetReturn } from 'restful-react'
import { InputTypes, setFieldValue, fillAtForm } from '@common/utils/JestFormHelper'
import * as pipelineNg from 'services/pipeline-ng'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, pipelineModuleParams, triggerPathProps } from '@common/utils/routeUtils'
import { useStrings } from 'framework/exports'
import { getTriggerConfigDefaultProps, getTriggerConfigInitialValues } from './webhookMockConstants'
import {
  GetSourceRepoToEventResponse,
  GetActionsListResponse,
  GenerateWebhookTokenResponse
} from './webhookMockResponses'
import WebhookTriggerConfigPanel from '../views/WebhookTriggerConfigPanel'
const useGetActionsList = jest.fn()
jest.mock('services/pipeline-ng', () => ({
  useGetSourceRepoToEvent: jest.fn(() => GetSourceRepoToEventResponse),
  useGetActionsList: jest.fn(args => {
    useGetActionsList(args)
    return GetActionsListResponse
  }),
  useGenerateWebhookToken: jest.fn(() => GenerateWebhookTokenResponse)
}))
const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline',
  triggerIdentifier: 'triggerIdentifier',
  module: 'cd'
}

const TEST_PATH = routes.toTriggersWizardPage({ ...accountPathProps, ...triggerPathProps, ...pipelineModuleParams })

jest.mock('clipboard-copy', () => jest.fn())

const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => <TestWrapper>{children}</TestWrapper>
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(props: { initialValues: any; isEdit?: boolean; enableSecureToken?: boolean }): JSX.Element {
  const { initialValues, isEdit = false, enableSecureToken = false } = props
  return (
    <Formik initialValues={initialValues} onSubmit={() => undefined}>
      {formikProps => (
        <FormikForm>
          <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
            <WebhookTriggerConfigPanel
              {...getTriggerConfigDefaultProps({ isEdit })}
              formikProps={formikProps}
              enableSecureToken={enableSecureToken}
            />
          </TestWrapper>
        </FormikForm>
      )}
    </Formik>
  )
}

describe('WebhookTriggerConfigPanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Github Trigger Configuration Panel', async () => {
      const getSourceRepoToEvent = jest.spyOn(pipelineNg, 'useGetSourceRepoToEvent')
      getSourceRepoToEvent.mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      const getActionsList = jest.spyOn(pipelineNg, 'useGetActionsList')

      getActionsList.mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)

      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline-triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )
      expect(container).toMatchSnapshot()
    })
    test('Initial Render - Custom Trigger Configuration Panel (enableSecureToken: false) ', async () => {
      const getSourceRepoToEvent = jest.spyOn(pipelineNg, 'useGetSourceRepoToEvent')
      getSourceRepoToEvent.mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      const generateWebhookToken = jest.spyOn(pipelineNg, 'useGenerateWebhookToken')
      generateWebhookToken.mockImplementation((): any => {
        return {
          refetch: jest.fn(),
          error: null,
          loading: false,
          data: (GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>
        }
      })

      const { container } = render(
        <WrapperComponent initialValues={getTriggerConfigInitialValues({ sourceRepo: 'CUSTOM' })} />
      )
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline-triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )
      expect(container).toMatchSnapshot()
    })

    test('Initial Render - Custom Trigger Configuration Panel (enableSecureToken:true, isEdit: false)', async () => {
      const getSourceRepoToEvent = jest.spyOn(pipelineNg, 'useGetSourceRepoToEvent')
      getSourceRepoToEvent.mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      const generateWebhookToken = jest.spyOn(pipelineNg, 'useGenerateWebhookToken')
      generateWebhookToken.mockImplementation((): any => {
        return {
          refetch: jest.fn(),
          error: null,
          loading: false,
          data: (GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>
        }
      })

      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({ sourceRepo: 'CUSTOM' })}
          enableSecureToken={true}
        />
      )
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline-triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )
      expect(container).toMatchSnapshot()
    })

    test('Initial Render - Custom Trigger Configuration Panel (enableSecureToken:true, isEdit: true)', async () => {
      const getSourceRepoToEvent = jest.spyOn(pipelineNg, 'useGetSourceRepoToEvent')
      getSourceRepoToEvent.mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      const generateWebhookToken = jest.spyOn(pipelineNg, 'useGenerateWebhookToken')
      generateWebhookToken.mockImplementation((): any => {
        return {
          refetch: jest.fn(),
          error: null,
          loading: false,
          data: (GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>
        }
      })

      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({ sourceRepo: 'CUSTOM', secureToken: 'secureToken' })}
          enableSecureToken={true}
          isEdit={true}
        />
      )
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline-triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )
      expect(container).toMatchSnapshot()
    })
  })
  describe('Interactivity: Non-Custom Source Repo/Payload Type', () => {
    test('Selecting Any Actions checkbox disables Actions Select box', async () => {
      const getSourceRepoToEvent = jest.spyOn(pipelineNg, 'useGetSourceRepoToEvent')
      getSourceRepoToEvent.mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      const generateWebhookToken = jest.spyOn(pipelineNg, 'useGenerateWebhookToken')
      generateWebhookToken.mockReturnValue(
        (GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>
      )

      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline-triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )
      fillAtForm([
        {
          container: container,
          type: InputTypes.SELECT,
          fieldId: 'sourceRepo',
          value: 'GITHUB'
        },
        {
          container: container,
          type: InputTypes.SELECT,
          fieldId: 'event',
          value: 'Pull Request'
        }
      ])
      await waitFor(() => expect(container.querySelector('[name="actions"]')).not.toBeNull())

      expect(container.querySelector('[name="actions"]')).toHaveProperty('disabled', false)
      setFieldValue({ type: InputTypes.CHECKBOX, container: container, fieldId: 'anyAction' })
      await waitFor(() => expect(container.querySelector('[name="actions"]')).toHaveProperty('disabled', true))

      setFieldValue({ type: InputTypes.CHECKBOX, container: container, fieldId: 'anyAction' })
      await waitFor(() => expect(container.querySelector('[name="actions"]')).toHaveProperty('disabled', false))
    })
  })
  describe('Interactivity: Custom Source Repo/Payload Type', () => {
    test('Regenerate token shows toast', async () => {
      const getSourceRepoToEvent = jest.spyOn(pipelineNg, 'useGetSourceRepoToEvent')

      getSourceRepoToEvent.mockReturnValue(GetSourceRepoToEventResponse as UseGetReturn<any, any, any, any>)
      const getActionsList = jest.spyOn(pipelineNg, 'useGetActionsList')

      getActionsList.mockReturnValue(GetActionsListResponse as UseGetReturn<any, any, any, any>)
      jest.spyOn(pipelineNg, 'useGenerateWebhookToken').mockReturnValue({
        refetch: jest.fn().mockReturnValue(
          Promise.resolve({
            status: 'SUCCESS'
          })
        ),
        error: null,
        loading: false,
        data: (GenerateWebhookTokenResponse as unknown) as UseGetReturn<any, any, any, any>
      } as any)

      const { container } = render(
        <WrapperComponent
          initialValues={getTriggerConfigInitialValues({ sourceRepo: 'CUSTOM', secureToken: 'secureToken' })}
          isEdit={true}
          enableSecureToken={true}
        />
      )
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline-triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )

      const regenerateIcon = document.body.querySelector('[data-name="regenerate-token"]')
      if (!regenerateIcon) {
        throw Error('cannot find regenerateIcon')
      }
      fireEvent.click(regenerateIcon)
      await waitFor(() => Promise.resolve({ status: 'SUCCESS' }))

      expect(
        queryByText(
          document.body,
          result.current.getString('pipeline-triggers.triggerConfigurationPanel.regeneratedToken')
        )
      ).not.toBeNull()
    })
  })
})
