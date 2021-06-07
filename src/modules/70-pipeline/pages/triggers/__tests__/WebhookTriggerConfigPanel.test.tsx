import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { renderHook } from '@testing-library/react-hooks'
import type { UseGetReturn } from 'restful-react'
import { InputTypes, setFieldValue, fillAtForm } from '@common/utils/JestFormHelper'
import * as pipelineNg from 'services/pipeline-ng'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, pipelineModuleParams, triggerPathProps } from '@common/utils/routeUtils'
import { useStrings } from 'framework/strings'
import { getTriggerConfigDefaultProps, getTriggerConfigInitialValues } from './webhookMockConstants'
import { GetGitTriggerEventDetailsResponse } from './webhookMockResponses'
import WebhookTriggerConfigPanel from '../views/WebhookTriggerConfigPanel'

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

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(props: { initialValues: any; isEdit?: boolean }): JSX.Element {
  const { initialValues, isEdit = false } = props
  return (
    <Formik initialValues={initialValues} onSubmit={() => undefined}>
      {formikProps => (
        <FormikForm>
          <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
            <WebhookTriggerConfigPanel {...getTriggerConfigDefaultProps({ isEdit })} formikProps={formikProps} />
          </TestWrapper>
        </FormikForm>
      )}
    </Formik>
  )
}

describe('WebhookTriggerConfigPanel Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Github Trigger Configuration Panel', async () => {
      const getGitTriggerEventDetails = jest.spyOn(pipelineNg, 'useGetGitTriggerEventDetails')
      getGitTriggerEventDetails.mockReturnValue(GetGitTriggerEventDetailsResponse as UseGetReturn<any, any, any, any>)

      const { container } = render(<WrapperComponent initialValues={getTriggerConfigInitialValues({})} />)
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline.triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )
      expect(container).toMatchSnapshot()
    })
    test('Initial Render - Custom Trigger Configuration Panel', async () => {
      const { container } = render(
        <WrapperComponent initialValues={getTriggerConfigInitialValues({ sourceRepo: 'Custom' })} />
      )
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline.triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )
      expect(container).toMatchSnapshot()
    })
  })
  describe('Interactivity: Non-Custom Source Repo/Payload Type', () => {
    test('Selecting Any Actions checkbox disables Actions Select box', async () => {
      const getGitTriggerEventDetails = jest.spyOn(pipelineNg, 'useGetGitTriggerEventDetails')
      getGitTriggerEventDetails.mockReturnValue(GetGitTriggerEventDetailsResponse as UseGetReturn<any, any, any, any>)

      const { container } = render(
        <WrapperComponent initialValues={getTriggerConfigInitialValues({ sourceRepo: 'Github' })} />
      )
      await waitFor(() =>
        queryByText(
          container,
          result.current.getString('pipeline.triggers.triggerConfigurationPanel.listenOnNewWebhook')
        )
      )
      fillAtForm([
        {
          container: container,
          type: InputTypes.SELECT,
          fieldId: 'event',
          value: 'PullRequest'
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
})
