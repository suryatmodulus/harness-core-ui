import React from 'react'
import { render, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'

import ExecutionLayout from '../ExecutionLayout'
import { useExecutionLayoutContext, ExecutionLayoutState } from '../ExecutionLayoutContext'

describe('<ExecutionLayout /> tests', () => {
  test('Does not render third child by default', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <ExecutionLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ExecutionLayout>
      </TestWrapper>
    )

    expect(getByTestId('child-1').innerHTML).toBe('Child 1')
    expect(getByTestId('child-2').innerHTML).toBe('Child 2')
    expect(() => getByTestId('child-3')).toThrow()
    expect(container).toMatchSnapshot()
  })

  test('Showing third child works', () => {
    function Child2(): React.ReactElement {
      const { setStepDetailsVisibility } = useExecutionLayoutContext()

      return (
        <button data-testid="layout" onClick={() => setStepDetailsVisibility(true)}>
          Show Child 3
        </button>
      )
    }
    const { container, getByTestId } = render(
      <TestWrapper>
        <ExecutionLayout>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">
            <Child2 />
          </div>
          <div data-testid="child-3">Child 3</div>
        </ExecutionLayout>
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByTestId('layout'))
    })

    expect(getByTestId('child-1').innerHTML).toBe('Child 1')
    expect(getByTestId('child-3').innerHTML).toBe('Child 3')
    expect(container).toMatchSnapshot()
  })

  test('"RIGHT" Layout works', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <ExecutionLayout defaultLayout={ExecutionLayoutState.RIGHT} defaultStepVisibility>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ExecutionLayout>
      </TestWrapper>
    )

    expect(getByTestId('child-1').innerHTML).toBe('Child 1')
    expect(getByTestId('child-2').innerHTML).toBe('Child 2')
    expect(getByTestId('child-3').innerHTML).toBe('Child 3')
    expect(container.querySelector('.splitPane2')?.classList.contains('vertical')).toBe(true)
    expect(container).toMatchSnapshot()
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('"BOTTOM" Layout works', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <ExecutionLayout defaultLayout={ExecutionLayoutState.BOTTOM} defaultStepVisibility>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ExecutionLayout>
      </TestWrapper>
    )

    expect(getByTestId('child-1').innerHTML).toBe('Child 1')
    expect(getByTestId('child-2').innerHTML).toBe('Child 2')
    expect(getByTestId('child-3').innerHTML).toBe('Child 3')
    expect(container.querySelector('.splitPane2')?.classList.contains('horizontal')).toBe(true)
    expect(container).toMatchSnapshot()
  })

  test('"FLOATING" Layout works', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <ExecutionLayout defaultLayout={ExecutionLayoutState.FLOATING} defaultStepVisibility>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ExecutionLayout>
      </TestWrapper>
    )

    expect(getByTestId('child-1').innerHTML).toBe('Child 1')
    expect(getByTestId('child-2').innerHTML).toBe('Child 2')
    expect(getByTestId('child-3').innerHTML).toBe('Child 3')
    expect(getByTestId('child-3').parentElement?.classList.contains('floating-wrapper')).toBe(true)
    expect(container).toMatchSnapshot()
  })

  test('"FLOATING" Layout - toggle window works', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <ExecutionLayout defaultLayout={ExecutionLayoutState.FLOATING} defaultStepVisibility>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ExecutionLayout>
      </TestWrapper>
    )

    expect(getByTestId('child-3').innerHTML).toBe('Child 3')
    expect(container).toMatchSnapshot('Child 3 is shown')

    const btn = container.querySelector('.stepDetails button')!

    act(() => {
      fireEvent.click(btn)
    })

    expect(() => getByTestId('child-3')).toThrow()
    expect(container).toMatchSnapshot('Child 3 is not shown')
  })

  test('ExecutionLayout.Toggle works', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <ExecutionLayout defaultLayout={ExecutionLayoutState.RIGHT} defaultStepVisibility>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">
            <ExecutionLayout.Toggle />
          </div>
          <div data-testid="child-3">Child 3</div>
        </ExecutionLayout>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const [right, /*bottom,*/ floating] = container.querySelectorAll<HTMLInputElement>('input[name="layout"]')

    expect(right.checked).toBe(true)
    expect(container.querySelector('.splitPane2')?.classList.contains('vertical')).toBe(true)

    // act(() => {
    //   fireEvent.click(bottom)
    // })
    // expect(container.querySelector('.splitPane2')?.classList.contains('horizontal')).toBe(true)

    act(() => {
      fireEvent.click(floating)
    })
    expect(getByTestId('child-3').parentElement?.classList.contains('floating-wrapper')).toBe(true)
  })

  test('Minimize works', () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <ExecutionLayout defaultLayout={ExecutionLayoutState.RIGHT} defaultStepVisibility>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">
            <ExecutionLayout.Toggle />
          </div>
          <div data-testid="child-3">Child 3</div>
        </ExecutionLayout>
      </TestWrapper>
    )

    const min = container.querySelector('input[value="MINIMIZE"]')!

    act(() => {
      fireEvent.click(min)
    })

    expect(() => getByTestId('child-3')).toThrow()

    const restore1 = getByTestId('restore')

    act(() => {
      fireEvent.click(restore1)
    })

    expect(getByTestId('child-3')).toBeTruthy()
    // expect(container.querySelector('.splitPane2')?.classList.contains('vertical')).toBe(true)
  })
})
