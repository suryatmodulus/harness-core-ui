import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import * as cv from 'services/cv'
import K8sChangeEventCard from '../K8sChangeEventCard'
import { mockK8sChangeResponse } from './K8sChangeEventCard.mock'

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)

describe('Unit tests for K8sChangeEventCard', () => {
  test('Ensure data is properly rendered', async () => {
    jest.spyOn(cv, 'useGetMonitoredServiceOverAllHealthScoreWithServiceAndEnv').mockReturnValue({
      data: {},
      refetch: jest.fn() as unknown
    } as UseGetReturn<any, any, any, any>)

    const { container, getByText } = render(
      <TestWrapper>
        <K8sChangeEventCard data={mockK8sChangeResponse} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('Kubernetes ConfigMap event.')).not.toBeNull())

    // expand yaml
    fireEvent.click(container.querySelector('[data-testid="eventYAML-panel"]')!)
    await waitFor(() => expect(container.querySelector('[class*="main"] textarea')))

    // click diff button
    fireEvent.click(container.querySelector('[class*="main"] button')!)
    await waitFor(() => expect(document.body.querySelector('.bp3-dialog textarea')).not.toBeNull())
  })
})
