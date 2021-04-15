import React from 'react'
import { render, fireEvent, waitFor, queryByAttribute } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import { useGetHarnessApprovalInstanceAuthorization, useAddHarnessApprovalActivity } from 'services/pipeline-ng'
import { HarnessApproval, HarnessApprovalProps } from '../HarnessApproval/HarnessApproval'
import approvalData from './HarnessApprovalData.json'

jest.mock('@common/components/Duration/Duration', () => ({
  Duration() {
    return <div>MOCK DURATION</div>
  }
}))

jest.mock('moment', () => {
  const original = jest.requireActual('moment')
  original().__proto__.format = () => 'XX:YY'
  return original
})

jest.mock('@common/components/YAMLBuilder/YamlBuilder', () => () => null)
jest.mock('services/pipeline-ng', () => ({
  useGetHarnessApprovalInstanceAuthorization: jest.fn(() => ({ data: {}, loading: false })),
  useAddHarnessApprovalActivity: jest.fn(() => ({ mutate: jest.fn() }))
}))

describe('<HarnessApproval /> tests', () => {
  const dateToString = jest.spyOn(Date.prototype, 'toLocaleString')

  beforeAll(() => {
    dateToString.mockImplementation(() => 'DUMMY DATE')
  })

  afterAll(() => {
    dateToString.mockRestore()
  })
  describe('Waiting Status', () => {
    const commonProps: HarnessApprovalProps = {
      isWaiting: true,
      approvalInstanceId: 'TEST_ID',
      approvalData: approvalData as any,
      updateState: jest.fn()
    }

    beforeEach(() => {
      ;(commonProps.updateState as jest.Mock).mockClear()
    })

    test('shows form if user is authorized', async () => {
      ;(useGetHarnessApprovalInstanceAuthorization as jest.Mock).mockImplementation(() => ({
        data: { data: { authorized: true } }
      }))
      const { container, findByText } = render(
        <TestWrapper>
          <HarnessApproval {...commonProps} />
        </TestWrapper>
      )

      await findByText('common.approve', { selector: '.bp3-button-text > span' })

      expect(container).toMatchSnapshot()
    })

    test('does not shows form if user is authorized', async () => {
      ;(useGetHarnessApprovalInstanceAuthorization as jest.Mock).mockImplementation(() => ({
        data: { data: { authorized: false } }
      }))
      const { container, getByText } = render(
        <TestWrapper>
          <HarnessApproval {...commonProps} />
        </TestWrapper>
      )

      expect(() => getByText('common.approve', { selector: '.bp3-button-text > span' })).toThrowError()

      expect(container).toMatchSnapshot()
    })

    test('Approving works', async () => {
      const mutate = jest.fn()
      ;(useGetHarnessApprovalInstanceAuthorization as jest.Mock).mockImplementation(() => ({
        data: { data: { authorized: true } }
      }))
      ;(useAddHarnessApprovalActivity as jest.Mock).mockImplementation(() => ({ mutate }))
      const { findByText, container } = render(
        <TestWrapper>
          <HarnessApproval {...commonProps} />
        </TestWrapper>
      )

      const queryByName = (id: string): HTMLElement | null => queryByAttribute('name', container, id)

      const approve = await findByText('common.approve', { selector: '.bp3-button-text > span' })

      fireEvent.change(queryByName('approverInputs[0].value')!, { target: { value: 'value1' } })
      fireEvent.change(queryByName('approverInputs[1].value')!, { target: { value: 'value2' } })
      fireEvent.change(queryByName('comments')!, { target: { value: 'my comments' } })

      fireEvent.click(approve)

      await waitFor(() =>
        expect(mutate).toHaveBeenCalledWith({
          action: 'APPROVE',
          approverInputs: [
            { name: 'var1', value: 'value1' },
            { name: 'var2', value: 'value2' }
          ],
          comments: 'my comments'
        })
      )

      await waitFor(() => expect(commonProps.updateState).toHaveBeenCalled())
    })

    test('Rejecting works', async () => {
      const mutate = jest.fn()
      ;(useGetHarnessApprovalInstanceAuthorization as jest.Mock).mockImplementation(() => ({
        data: { data: { authorized: true } }
      }))
      ;(useAddHarnessApprovalActivity as jest.Mock).mockImplementation(() => ({ mutate }))
      const { findByText, container } = render(
        <TestWrapper>
          <HarnessApproval {...commonProps} />
        </TestWrapper>
      )

      const queryByName = (id: string): HTMLElement | null => queryByAttribute('name', container, id)

      const reject = await findByText('common.reject', { selector: '.bp3-button-text > span' })

      fireEvent.change(queryByName('approverInputs[0].value')!, { target: { value: 'value1' } })
      fireEvent.change(queryByName('approverInputs[1].value')!, { target: { value: 'value2' } })
      fireEvent.change(queryByName('comments')!, { target: { value: 'my comments' } })

      fireEvent.click(reject)

      await waitFor(() =>
        expect(mutate).toHaveBeenCalledWith({
          action: 'REJECT',
          approverInputs: [
            { name: 'var1', value: 'value1' },
            { name: 'var2', value: 'value2' }
          ],
          comments: 'my comments'
        })
      )
      await waitFor(() => expect(commonProps.updateState).toHaveBeenCalled())
    })
  })

  describe('Non-Waiting Status', () => {
    const commonProps: HarnessApprovalProps = {
      isWaiting: false,
      approvalInstanceId: 'TEST_ID',
      approvalData: approvalData as any,
      updateState: jest.fn()
    }
    test('form is not shown', async () => {
      const { container, getByText } = render(
        <TestWrapper>
          <HarnessApproval {...commonProps} />
        </TestWrapper>
      )

      expect(() => getByText('common.approve', { selector: '.bp3-button-text > span' })).toThrowError()

      expect(container).toMatchSnapshot()
    })
  })
})
