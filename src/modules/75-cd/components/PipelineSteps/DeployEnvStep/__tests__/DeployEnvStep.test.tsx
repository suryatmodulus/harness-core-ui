import React from 'react'
import { render, fireEvent, getByText, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { findDialogContainer } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { DeployEnvironment } from '../DeployEnvStep.stories'
import environments from './mock.json'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

jest.mock('services/cd-ng', () => ({
  useGetEnvironmentListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: environments, refetch: jest.fn() }))
}))
describe('Test DeployEnvironment Step', () => {
  test('should render environment view and save', async () => {
    const { container } = render(
      <DeployEnvironment type={StepType.DeployEnvironment} initialValues={{}} stepViewType={StepViewType.Edit} />
    )
    fireEvent.click(getByText(container, 'pipelineSteps.environmentTab.newEnvironment'))
    const dialog = findDialogContainer()
    expect(dialog).toMatchSnapshot()
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'New Project'
      }
    ])
    fireEvent.click(getByText(dialog!, 'production'))
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environment:
        name: New Project
        identifier: New_Project
        type: Production
      "
    `)
  })
  test('should render edit Environment view (environment ref), then update and then save', async () => {
    const { container } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{ environmentRef: 'selected_env' }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText(container, 'editEnvironment'))
    const dialog = findDialogContainer()
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'New Environment'
      }
    ])
    fireEvent.click(getByText(dialog!, 'nonProduction'))
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environment:
        name: New Environment
        identifier: selected_env
        description: null
        tags:
          cloud: GCP
          team: cdp
        type: PreProduction
      "
    `)
  })
  test('should render edit Environment view (environment), then update and then save', async () => {
    const { container } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{
          environment: {
            identifier: 'pass_env',
            name: 'Pass Env',
            description: 'test',
            type: 'PreProduction',
            tags: {
              tag1: '',
              tag2: 'asd'
            }
          }
        }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText(container, 'editEnvironment'))
    const dialog = findDialogContainer()
    expect(dialog).toMatchSnapshot()
    fireEvent.click(getByText(dialog!, 'production'))
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'Edit Environment'
      }
    ])
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environment:
        name: Edit Environment
        identifier: pass_env
        description: test
        tags:
          tag1: \\"\\"
          tag2: asd
        type: Production
      "
    `)
  })

  test('should render edit Environment view (environment ref), then select other', async () => {
    const { container } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{ environmentRef: 'selected_env' }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(
      document.body
        .querySelector(`[name="environmentRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="caret-down"]')!
    )
    fireEvent.click(getByText(document.body, 'Other Env'))

    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: other_env
      "
    `)
  })
  test('should render edit Environment view (environment), then select new', async () => {
    const { container } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{
          environment: {
            identifier: 'pass_environment',
            name: 'Pass Environment',
            description: 'test',
            type: 'Production',
            tags: {
              tag1: '',
              tag2: 'asd'
            }
          }
        }}
        stepViewType={StepViewType.Edit}
      />
    )
    // Clear first
    await act(() => {
      fireEvent.click(
        document.body.querySelector(`[name="environmentRef"] + [class*="bp3-input-action"]`)?.childNodes?.[0]!
      )
    })

    fireEvent.click(
      document.body
        .querySelector(`[name="environmentRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="caret-down"]')!
    )
    fireEvent.click(getByText(document.body, 'Other Env'))

    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: other_env
      "
    `)
  })

  test('should render inputSet View', async () => {
    const { container } = render(
      <DeployEnvironment
        type={StepType.DeployEnvironment}
        initialValues={{}}
        stepViewType={StepViewType.InputSet}
        path=""
        template={{
          environmentRef: RUNTIME_INPUT_VALUE
        }}
        allValues={{
          environmentRef: RUNTIME_INPUT_VALUE
        }}
      />
    )
    fireEvent.click(
      document.body
        .querySelector(`[name="environmentRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="caret-down"]')!
    )
    fireEvent.click(getByText(document.body, 'Selected Env'))

    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(container.querySelector('.bp3-card > pre')?.innerHTML).toMatchInlineSnapshot(`
      "environmentRef: selected_env
      "
    `)
  })
})
