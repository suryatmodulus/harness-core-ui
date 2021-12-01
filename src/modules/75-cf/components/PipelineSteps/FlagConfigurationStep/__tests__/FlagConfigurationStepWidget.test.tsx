import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as ffServices from 'services/cf'
import * as cdngServices from 'services/cd-ng'
import FlagConfigurationStepWidget, { FlagConfigurationStepWidgetProps } from '../FlagConfigurationStepWidget'
import { mockVariations } from '../FlagChanges/subSections/__tests__/utils.mocks'

const mockFeature = {
  name: 'f1',
  identifier: 'f1',
  variations: mockVariations
} as ffServices.Feature

const mockEnvironment = {
  name: 'e1',
  identifier: 'e1'
} as cdngServices.EnvironmentResponseDTO

const mockInitialValues = {
  identifier: 'step',
  name: 'step',
  type: 'type',
  spec: {
    feature: 'feature',
    environment: 'env'
  }
}

jest.mock('@pipeline/components/AbstractSteps/Step', () => ({
  setFormikRef: jest.fn()
}))

const renderComponent = (props: Partial<FlagConfigurationStepWidgetProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <FlagConfigurationStepWidget
        initialValues={mockInitialValues}
        onUpdate={jest.fn()}
        ref={React.createRef()}
        isNewStep
        {...props}
      />
    </TestWrapper>
  )

describe('FlagConfigurationStepWidget', () => {
  beforeEach(() => {
    jest
      .spyOn(ffServices, 'useGetAllFeatures')
      .mockReturnValue({ data: { features: [mockFeature] }, loading: false, error: null, refetch: jest.fn() } as any)

    jest.spyOn(cdngServices, 'useGetEnvironmentList').mockReturnValue({
      data: { data: { content: [{ environment: mockEnvironment }] } },
      loading: false,
      error: null,
      refetch: jest.fn()
    } as any)
  })

  test('it should should display the loading indicator when an api is loading', async () => {
    jest
      .spyOn(ffServices, 'useGetAllFeatures')
      .mockReturnValue({ data: null, loading: true, error: null, refetch: jest.fn() } as any)

    renderComponent()

    expect(screen.getByTestId('flag-configuration-step-widget-loading')).toBeInTheDocument()
  })

  test('it should display the error when an api fails', async () => {
    jest
      .spyOn(ffServices, 'useGetAllFeatures')
      .mockReturnValue({ data: null, loading: false, error: { message: 'ERROR' }, refetch: jest.fn() } as any)

    renderComponent()

    expect(screen.getByTestId('flag-configuration-step-widget-error')).toBeInTheDocument()
  })

  test('it should render the form', async () => {
    const { container } = renderComponent()
    expect(container).toMatchSnapshot()
  })
})
