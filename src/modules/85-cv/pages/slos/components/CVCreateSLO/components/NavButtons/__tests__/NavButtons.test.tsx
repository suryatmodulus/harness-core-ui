import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { NavButtons } from '../NavButtons'
import type { NavButtonsProps } from '../NavButtons.types'
import { CreateSLOEnum } from '../../CreateSLOForm/CreateSLO.constants'

function WrapperComponent(props: NavButtonsProps): JSX.Element {
  return (
    <TestWrapper>
      <NavButtons {...props}></NavButtons>
    </TestWrapper>
  )
}

describe('Test NavButtons component', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  const initialProps = {
    selectedTabId: CreateSLOEnum['NAME'],
    setSelectedTabId: jest.fn(),
    getString: jest.fn(),
    formikProps: {
      setValues: jest.fn(),
      values: {}
    } as any
  }

  test('should render NavButtons component', async () => {
    const { container } = render(<WrapperComponent {...initialProps} />)
    expect(container).toMatchSnapshot()
  })
})
