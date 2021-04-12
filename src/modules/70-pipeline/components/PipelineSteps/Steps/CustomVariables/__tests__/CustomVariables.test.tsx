import React from 'react'
import {
  render,
  queryByAttribute,
  fireEvent,
  act,
  waitFor,
  findByText as findByTextGlobal
} from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { CustomVariables } from '../CustomVariables'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

describe('Custom Variables', () => {
  beforeAll(() => {
    factory.registerStep(new CustomVariables())
  })

  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ variables: [], canAddVariable: true }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('can add a string variable', async () => {
    const { container, findByText } = render(
      <TestStepWidget
        initialValues={{ variables: [], canAddVariable: true }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.Edit}
      />
    )

    const add = await findByText('common.addVariable')

    act(() => {
      fireEvent.click(add)
    })

    await waitFor(() => findByTextGlobal(document.body, 'common.addVariable', { selector: 'h4.bp3-heading' }))

    const name = queryByAttribute('name', document.body.querySelector('.bp3-dialog-body') as HTMLElement, 'name')

    act(() => {
      fireEvent.change(name!, { target: { value: 'myVar' } })
    })

    const save = await findByTextGlobal(document.body, 'save')

    act(() => {
      fireEvent.click(save)
    })

    await waitFor(() => findByText('customVariables.variableAndType', { selector: 'span' }))

    const value = queryByAttribute('name', container, 'variables[0].value')

    act(() => {
      fireEvent.change(value!, { target: { value: 'myVarValue' } })
    })

    expect(container).toMatchSnapshot()
  })

  test('should render variables', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          variables: [
            { name: 'myVar1', type: 'String', value: 'myVar1Value' },
            { name: 'myVar1', type: 'Number', value: 1234 },
            { name: 'myVar1', type: 'Secret', value: RUNTIME_INPUT_VALUE }
          ],
          canAddVariable: true
        }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.StageVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('can delete variable', async () => {
    const { container, findByTestId } = render(
      <TestStepWidget
        initialValues={{
          variables: [
            { name: 'myVar1', type: 'String', value: 'myVar1Value' },
            { name: 'myVar1', type: 'Number', value: 1234 },
            { name: 'myVar1', type: 'Secret', value: '<+input>' }
          ],
          canAddVariable: true
        }}
        type={StepType.CustomVariable}
        stepViewType={StepViewType.StageVariable}
      />
    )

    expect(container.querySelectorAll('.tableRow:not(.headerRow)').length).toBe(3)
    expect(container).toMatchSnapshot('Before Delete')

    const del = await findByTestId('delete-variable-2')

    act(() => {
      fireEvent.click(del)
    })

    expect(container.querySelectorAll('.tableRow:not(.headerRow)').length).toBe(2)
    expect(container).toMatchSnapshot('After Delete')
  })
})
