import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import SetFlagSwitch from '../SetFlagSwitch'

const renderComponent = (clearField = jest.fn()): RenderResult =>
  render(
    <TestWrapper>
      <Formik formName="test" onSubmit={jest.fn()} initialValues={{}}>
        <SetFlagSwitch subSectionSelector={<span />} clearField={clearField} />
      </Formik>
    </TestWrapper>
  )

const getInput = (): HTMLInputElement =>
  screen.getByPlaceholderText(/cf\.pipeline\.flagConfiguration\.selectOnOrOff/) as HTMLInputElement

describe('SetFlagSwitch', () => {
  test('it should display a select box with On and Off options', async () => {
    renderComponent()

    expect(screen.getByText('cf.pipeline.flagConfiguration.switchTo')).toBeInTheDocument()

    const input = getInput()
    expect(input).toBeInTheDocument()

    expect(screen.queryByText('common.ON')).not.toBeInTheDocument()
    expect(screen.queryByText('common.OFF')).not.toBeInTheDocument()

    userEvent.click(input)

    expect(screen.getByText('common.ON')).toBeInTheDocument()
    expect(screen.getByText('common.OFF')).toBeInTheDocument()
  })

  test('it should properly set the value of the input on selection', async () => {
    renderComponent()

    const input = getInput()
    expect(input).not.toHaveValue()

    userEvent.click(input)
    userEvent.click(screen.getByText('common.ON'))
    expect(input).toHaveValue('common.ON')

    userEvent.click(input)
    userEvent.click(screen.getByText('common.OFF'))
    expect(input).toHaveValue('common.OFF')
  })

  test('it should call the clearField function with spec.state when unmounted', async () => {
    const clearFieldMock = jest.fn()
    const { unmount } = renderComponent(clearFieldMock)

    expect(clearFieldMock).not.toHaveBeenCalled()

    unmount()
    await waitFor(() => {
      expect(clearFieldMock).toHaveBeenCalledWith('spec.state')
    })
  })
})
