import React, { ReactElement } from 'react'
import { render, RenderResult, screen } from '@testing-library/react'
import SubSection, { SubSectionProps } from '../SubSection'

const renderComponent = (props: Partial<SubSectionProps & { children: ReactElement }> = {}): RenderResult =>
  render(<SubSection subSectionSelector={<span />} {...props} />)

describe('SubSection', () => {
  test('it should display the passed removeSubSectionButton', async () => {
    const testId = 'TEST-EL-ID'
    renderComponent({ removeSubSectionButton: <span data-testid={testId} /> })

    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  test('it should display the passed subSectionSelector', async () => {
    const testId = 'TEST-EL-ID'
    renderComponent({ subSectionSelector: <span data-testid={testId} /> })

    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  test('it should display the passed children', async () => {
    const testId = 'TEST-EL-ID'
    renderComponent({ children: <span data-testid={testId} /> })

    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })
})
