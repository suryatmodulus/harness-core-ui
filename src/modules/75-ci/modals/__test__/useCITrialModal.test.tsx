import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TrialType } from '@templates-library/components/TrialModalTemplate/trialModalUtils'
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
const TestComponent = ({ trialType = TrialType.SET_UP_PIPELINE }: { trialType?: TrialType }): React.ReactElement => {
  const { openTrialModal, closeTrialModal } = useCITrialModal({
    actionProps: {
      onSuccess: jest.fn(),
      onCloseModal,
      onCreateProject: jest.fn()
    },
    trialType
  })
  return (
    <>
      <button className="open" onClick={openTrialModal} />
      <button className="close" onClick={closeTrialModal} />
    </>
  )
}

describe('open and close CITrial Modal', () => {
  describe('Rendering', () => {
    test('should open and close CITrial and default as Create Pipeline Form', async () => {
      const { container, getByText, getByRole } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('pipeline.createPipeline.setupHeader')).toBeDefined())
      expect(container).toMatchSnapshot()
      fireEvent.click(getByRole('button', { name: 'close modal' }))
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })

    test('should close modal by closeCITrialModal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('Trial in-progress')).toBeDefined())
      fireEvent.click(container.querySelector('.close')!)
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })
  })

  test('should render Select Pipeline Form when TrialType is CREATE_OR_SELECT_PIPELINE', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TestComponent trialType={TrialType.CREATE_OR_SELECT_PIPELINE} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.open')!)
    await waitFor(() => expect(() => getByText('pipeline.selectOrCreatePipeline.selectAPipeline')).toBeDefined())
    fireEvent.click(getByText('pipeline.createANewPipeline')!)
    await waitFor(() => expect(() => getByText('pipeline.createPipeline.setupHeader')).toBeDefined())
  })

  test('create or select project modal', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <TestComponent trialType={TrialType.CREATE_OR_SELECT_PROJECT} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.open')!)
    await waitFor(() => expect(() => getByText('ci.continuous')).toBeDefined())
  })
})
