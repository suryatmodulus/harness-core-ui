import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useCITrialModal } from '../CITrial/useCITrialModal'

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          data: {}
        }
      })
    }
  })
}))

const onCloseModal = jest.fn()
const TestComponent = ({ isSelect }: { isSelect: boolean }): React.ReactElement => {
  const { openCITrialModal, closeCITrialModal } = useCITrialModal({
    onSubmit: jest.fn(),
    onCloseModal,
    isSelect
  })
  return (
    <>
      <button className="open" onClick={openCITrialModal} />
      <button className="close" onClick={closeCITrialModal} />
    </>
  )
}

describe('open and close CITrial Modal', () => {
  describe('Rendering', () => {
    test('should open and close CITrial and default as Create Pipeline Form', async () => {
      const { container, getByText, getByRole } = render(
        <TestWrapper>
          <TestComponent isSelect={false} />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('Setup Pipeline')).toBeDefined())
      expect(container).toMatchSnapshot()
      fireEvent.click(getByRole('button', { name: 'close modal' }))
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })

    test('should close modal by closeCITrialModal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent isSelect={false} />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('Trial in-progress')).toBeDefined())
      fireEvent.click(container.querySelector('.close')!)
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })
  })

  test('should render Select Pipeline Form when isSelect is true', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TestComponent isSelect={true} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.open')!)
    await waitFor(() => expect(() => getByText('Trial in-progress')).toBeDefined())
    fireEvent.click(container.querySelector('.close')!)
    await waitFor(() => expect(onCloseModal).toBeCalled())
  })
})
