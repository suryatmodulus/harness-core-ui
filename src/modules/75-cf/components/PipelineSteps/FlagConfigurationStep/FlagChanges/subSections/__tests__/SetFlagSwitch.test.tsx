import React from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import SetFlagSwitch from '../SetFlagSwitch'

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper>
      <Formik formName="test" onSubmit={jest.fn()} initialValues={{}}>
        <SetFlagSwitch subSectionSelector={<span />} />
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

    expect(screen.queryByText('cf.shared.on')).not.toBeInTheDocument()
    expect(screen.queryByText('cf.shared.off')).not.toBeInTheDocument()

    userEvent.click(input)

    expect(screen.getByText('cf.shared.on')).toBeInTheDocument()
    expect(screen.getByText('cf.shared.off')).toBeInTheDocument()
  })

  test('it should properly set the value of the input on selection', async () => {
    renderComponent()

    const input = getInput()
    expect(input).not.toHaveValue()

    userEvent.click(input)
    userEvent.click(screen.getByText('cf.shared.on'))
    expect(input).toHaveValue('cf.shared.on')

    userEvent.click(input)
    userEvent.click(screen.getByText('cf.shared.off'))
    expect(input).toHaveValue('cf.shared.off')
  })
})
