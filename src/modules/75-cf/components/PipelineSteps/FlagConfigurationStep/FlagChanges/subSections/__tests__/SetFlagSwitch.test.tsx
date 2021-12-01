import React from 'react'
import { get } from 'lodash-es'
import { render, RenderResult, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import SetFlagSwitch, { SetFlagSwitchProps } from '../SetFlagSwitch'
import { prefixInstructionField } from './utils.mocks'

let formValues = {}

const renderComponent = (props: Partial<SetFlagSwitchProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <Formik formName="test" onSubmit={jest.fn()} initialValues={{}}>
        {({ values }) => {
          formValues = values

          return (
            <SetFlagSwitch
              subSectionSelector={<span />}
              setField={jest.fn()}
              prefix={prefixInstructionField}
              {...props}
            />
          )
        }}
      </Formik>
    </TestWrapper>
  )

describe('SetFlagSwitch', () => {
  test('it should display a select box with On and Off options', async () => {
    renderComponent()

    expect(screen.getByText('cf.pipeline.flagConfiguration.switchTo')).toBeInTheDocument()

    const input = document.querySelector('[name$="spec.state"]') as HTMLInputElement
    expect(input).toBeInTheDocument()

    expect(screen.queryByText('common.ON')).not.toBeInTheDocument()
    expect(screen.queryByText('common.OFF')).not.toBeInTheDocument()

    userEvent.click(input)

    expect(screen.getByText('common.ON')).toBeInTheDocument()
    expect(screen.getByText('common.OFF')).toBeInTheDocument()
  })

  test('it should properly set the value of the input on selection', async () => {
    renderComponent()

    const input = document.querySelector('[name$="spec.state"]') as HTMLInputElement
    expect(input).not.toHaveValue()

    userEvent.click(input)
    userEvent.click(screen.getByText('common.ON'))

    expect(get(formValues, prefixInstructionField('spec.state'))).toBe('on')

    userEvent.click(input)
    userEvent.click(screen.getByText('common.OFF'))

    expect(get(formValues, prefixInstructionField('spec.state'))).toBe('off')
  })
})
