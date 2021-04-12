import React from 'react'
import { render, fireEvent, getByText, act } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { findDialogContainer } from '@common/utils/testUtils'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { DeployService } from '../DeployServiceStep.stories'
import services from './serviceMock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => ({ children }: { children: JSX.Element }) => (
  <div>{children}</div>
))

jest.mock('services/cd-ng', () => ({
  useGetServiceListForProject: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: services, refetch: jest.fn() }))
}))
describe('Test DeployService Step', () => {
  test('should render service view and save', async () => {
    const { container } = render(
      <DeployService type={StepType.DeployService} initialValues={{}} stepViewType={StepViewType.Edit} />
    )
    fireEvent.click(getByText(container, 'pipelineSteps.serviceTab.newService'))
    const dialog = findDialogContainer()
    expect(dialog).toMatchSnapshot()
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'New Service'
      }
    ])
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "service:
        name: New Service
        identifier: New_Service
      "
    `)
  })
  test('should render edit service view (service ref), then update and then save', async () => {
    const { container } = render(
      <DeployService
        type={StepType.DeployService}
        initialValues={{ serviceRef: 'selected_service' }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText(container, 'editService'))
    const dialog = findDialogContainer()
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'Edit Service'
      }
    ])
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "service:
        name: Edit Service
        identifier: selected_service
        description: test
        tags:
          tag1: \\"\\"
          tag2: asd
      "
    `)
  })
  test('should render edit service view (service), then update and then save', async () => {
    const { container } = render(
      <DeployService
        type={StepType.DeployService}
        initialValues={{
          service: {
            identifier: 'pass_service',
            name: 'Pass Service',
            description: 'test',
            tags: {
              tag1: '',
              tag2: 'asd'
            }
          }
        }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText(container, 'editService'))
    const dialog = findDialogContainer()
    expect(dialog).toMatchSnapshot()
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'Edit Service'
      }
    ])
    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })
    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "service:
        name: Edit Service
        identifier: pass_service
        description: test
        tags:
          tag1: \\"\\"
          tag2: asd
      "
    `)
  })

  test('Should be able save even if there is 63 characters limit warning for name', async () => {
    const { container } = render(
      <DeployService
        type={StepType.DeployService}
        initialValues={{
          service: {
            identifier: 'pass_service',
            name: 'Pass Service',
            description: 'test',
            tags: {
              tag1: '',
              tag2: 'asd'
            }
          }
        }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(getByText(container, 'editService'))
    const dialog = findDialogContainer()
    expect(dialog).toMatchSnapshot()
    fillAtForm([
      {
        container: dialog!,
        fieldId: 'name',
        type: InputTypes.TEXTFIELD,
        value: 'ljdlkcjv vldjvldkj dlvjdlvkj vljdlkvjd vlmdlfvm vlmdlkvj dlvdkl'
      }
    ])

    expect(getByText(dialog!, 'Limit of 63 characters is reached for name')).not.toBeNull()

    await act(async () => {
      fireEvent.click(getByText(dialog!, 'save'))
    })

    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "service:
        name: ljdlkcjv vldjvldkj dlvjdlvkj vljdlkvjd vlmdlfvm vlmdlkvj dlvdkl
        identifier: pass_service
        description: test
        tags:
          tag1: \\"\\"
          tag2: asd
      "
    `)
  })

  test('should render edit service view (service ref), then select other', async () => {
    const { container } = render(
      <DeployService
        type={StepType.DeployService}
        initialValues={{ serviceRef: 'selected_service' }}
        stepViewType={StepViewType.Edit}
      />
    )
    fireEvent.click(
      document.body
        .querySelector(`[name="serviceRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="caret-down"]')!
    )
    fireEvent.click(getByText(document.body, 'Other Service'))

    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "serviceRef: other_service
      "
    `)
  })
  test('should render edit service view (service), then select new', async () => {
    const { container } = render(
      <DeployService
        type={StepType.DeployService}
        initialValues={{
          service: {
            identifier: 'pass_service',
            name: 'Pass Service',
            description: 'test',
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
        document.body.querySelector(`[name="serviceRef"] + [class*="bp3-input-action"]`)?.childNodes?.[0]!
      )
    })
    fireEvent.click(
      document.body
        .querySelector(`[name="serviceRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="caret-down"]')!
    )
    fireEvent.click(getByText(document.body, 'Other Service'))

    expect(container.querySelector('pre')?.innerHTML).toMatchInlineSnapshot(`
      "serviceRef: other_service
      "
    `)
  })

  test('should render inputSet View', async () => {
    const { container } = render(
      <DeployService
        type={StepType.DeployService}
        initialValues={{}}
        stepViewType={StepViewType.InputSet}
        path=""
        template={{
          serviceRef: RUNTIME_INPUT_VALUE
        }}
        allValues={{
          serviceRef: RUNTIME_INPUT_VALUE
        }}
      />
    )
    fireEvent.click(
      document.body
        .querySelector(`[name="serviceRef"] + [class*="bp3-input-action"]`)
        ?.querySelector('[data-icon="caret-down"]')!
    )
    fireEvent.click(getByText(document.body, 'Selected Service'))
    await act(async () => {
      fireEvent.click(getByText(container, 'Submit'))
    })
    expect(container.querySelector('.bp3-card > pre')?.innerHTML).toMatchInlineSnapshot(`
      "serviceRef: selected_service
      "
    `)
  })
})
