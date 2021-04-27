import React from 'react'
import { fireEvent, getAllByRole, getByPlaceholderText, getByText, render } from '@testing-library/react'
import { act } from 'react-dom/test-utils'

import { Formik, FormikForm } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import {
  getMultiSelectFormOptions,
  PipelineExecutionFormType
} from '@pipeline/utils/PipelineExecutionFilterRequestUtils'

import PipelineFilterForm from '../PipelineFilterForm'
import services from '../../../pipelines/__tests__/mocks/services.json'
import environments from '../../../pipelines/__tests__/mocks/environments.json'

const params = {
  accountId: 'testAcc',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'test',
  pipelineIdentifier: 'pipeline1',
  module: 'cd'
}

const TEST_PATH = routes.toPipelines({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper path={TEST_PATH} pathParams={params} defaultAppStoreValues={defaultAppStoreValues}>
      <Formik initialValues={{}} onSubmit={() => undefined}>
        <FormikForm>
          <PipelineFilterForm<PipelineExecutionFormType>
            isCDEnabled={true}
            isCIEnabled={true}
            initialValues={{
              services: getMultiSelectFormOptions(services.data.content),
              environments: getMultiSelectFormOptions(environments.data.content)
            }}
            type="PipelineExecution"
          />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('<PipelineFilterForm /> test', () => {
  test('snapshot testing', () => {
    const { container } = render(<WrapperComponent />)
    expect(container).toMatchSnapshot()
  })

  test('change values of all the field in filter form', async () => {
    const { container } = render(<WrapperComponent />)
    const tagInputValues = container.getElementsByClassName('bp3-tag-input-values')
    expect(tagInputValues).toHaveLength(3)

    // Filter Name
    const nameInput = getByPlaceholderText(container, 'enterNamePlaceholder')
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'test name' } })
    })

    // Status Selection
    const statusInput = container.querySelector('[name="status"]') as HTMLElement
    await act(async () => {
      fireEvent.change(statusInput, { target: { value: 't' } })
    })
    const listItems = getAllByRole(container, 'listitem')
    expect(listItems).toHaveLength(3)
    await act(async () => {
      fireEvent.click(listItems[0])
    })
    const selectedTag = getByText(tagInputValues[0] as HTMLElement, 'Aborted')
    expect(selectedTag).toBeDefined()
  })
})
