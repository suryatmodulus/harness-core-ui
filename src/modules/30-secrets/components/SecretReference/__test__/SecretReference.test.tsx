import React from 'react'
import { render, getByText, queryByAttribute, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'

import { TestWrapper } from '@common/utils/testUtils'
import SecretReference from '../SecretReference'
import mockData from './listSecretsMock.json'

describe('Secret Reference', () => {
  test('render with secret type text', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretReference type="SecretText" accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    await waitFor(() => getByText(container, 'Apply Selected'))
    expect(getByText(container, 'Account')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('render with secret type file', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretReference type="SecretFile" accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    await waitFor(() => getByText(container, 'Apply Selected'))
    expect(getByText(container, 'Account')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('render with no secret type', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretReference accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    await waitFor(() => getByText(container, 'Apply Selected'))
    expect(getByText(container, 'Account')).toBeTruthy()
    expect(queryByAttribute('class', container, /secretTypeSelect/)).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
  test('render with spinner', async () => {
    const { container } = render(
      <TestWrapper>
        <SecretReference accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    expect(getByText(container, 'Account')).toBeTruthy()
    expect(queryByAttribute('data-icon', container, /spinner/)).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
  test('render with no data', async () => {
    mockData.data.empty = true
    mockData.data.content = []
    const { container } = render(
      <TestWrapper>
        <SecretReference accountIdentifier="dummy" mock={mockData as any} onSelect={noop} />
      </TestWrapper>
    )
    await waitFor(() => getByText(container, 'Apply Selected'))
    expect(getByText(container, 'No Secrets Found')).toBeTruthy()
    expect(container).toMatchSnapshot()
  })
})
