import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TrialType, useCDTrialModal } from '../CDTrial/useCDTrialModal'

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          data: {
            content: [
              {
                identifier: 'item 1'
              },
              {
                identifier: 'item 2'
              }
            ]
          }
        }
      })
    }
  })
}))

const onCloseModal = jest.fn()
const TestComponent = ({ trialType = TrialType.SET_UP_PIPELINE }: { trialType?: TrialType }): React.ReactElement => {
  const { openCDTrialModal, closeCDTrialModal } = useCDTrialModal({
    actionProps: {
      onSuccess: jest.fn(),
      onCloseModal,
      onCreateProject: jest.fn()
    },
    trialType
  })
  return (
    <>
      <button className="open" onClick={openCDTrialModal} />
      <button className="close" onClick={closeCDTrialModal} />
    </>
  )
}

describe('CDTrial Modal', () => {
  describe('Rendering', () => {
    test('should open and close CDTrial', async () => {
      const { container, getByText, getByRole } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('cd.cdTrialHomePage.startTrial.description')).toBeDefined())
      fireEvent.click(getByRole('button', { name: 'close modal' }))
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })

    test('should close modal by closeCDTrialModal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('cd.cdTrialHomePage.startTrial.description')).toBeDefined())
      fireEvent.click(container.querySelector('.close')!)
      await waitFor(() => expect(onCloseModal).toBeCalled())
    })
  })

  describe('validation', () => {
    test('should validate inputs', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      fireEvent.click(getByText('start'))
      await waitFor(() => expect(container).toMatchSnapshot())
      expect(getByText('createPipeline.pipelineNameRequired')).toBeDefined()
    })
  })

  describe('trial type', () => {
    test('create or select project modal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent trialType={TrialType.CREATE_OR_SELECT_PROJECT} />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('cd.continuous')).toBeDefined())
    })

    test('create or select pipeline modal', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <TestComponent trialType={TrialType.CREATE_OR_SELECT_PIPELINE} />
        </TestWrapper>
      )
      fireEvent.click(container.querySelector('.open')!)
      await waitFor(() => expect(() => getByText('pipeline.selectOrCreateForm.description')).toBeDefined())
    })
  })
})
