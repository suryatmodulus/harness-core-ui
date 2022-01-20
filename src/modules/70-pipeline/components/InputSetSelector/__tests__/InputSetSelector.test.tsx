/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor } from '@testing-library/react'
import { InputSetSummaryResponse, useGetInputSetsListForPipeline } from 'services/pipeline-ng'
import { TestWrapper } from '@common/utils/testUtils'
import { InputSetSelector, InputSetSelectorProps } from '../InputSetSelector'
import {
  mockInputSetsList,
  mockInputSetsListEmpty,
  mockInputSetsListError,
  mockInputSetsListWithGitDetails,
  mockInputSetsValue
} from './mocks'
import type { InputSetValue } from '../utils'

const commonProps: InputSetSelectorProps = {
  pipelineIdentifier: 'pipId'
}

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))

jest.mock('services/pipeline-ng', () => ({
  useGetInputSetsListForPipeline: jest.fn()
}))

describe('INPUT SET SELECTOR', () => {
  test('No input sets - should show loading symbol', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => ({
      data: {},
      refetch: jest.fn()
    }))
    const { queryByText, getByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    // Show loading input sets after click
    await waitFor(() => expect(queryByText(/Loading, please wait\.\.\./)).toBeTruthy())
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Input sets API has data', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { container, getByText, rerender, getByPlaceholderText, queryByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })
    await waitFor(() => expect(container).toMatchSnapshot('snapshot afteropening the input set list'))

    // Click on the overlay input set, it should reorder and come to the top
    act(() => {
      fireEvent.click(getByText('ol1'))
    })
    await waitFor(() => expect(container).toMatchSnapshot('reorder after selecting an overlay'))

    // Click again to uncheck
    act(() => {
      fireEvent.click(getByText('ol1'))
    })

    // click again to check
    act(() => {
      fireEvent.click(getByText('ol1'))
    })

    // Select the other input set
    act(() => {
      fireEvent.click(getByText('is1'))
    })

    // Use the search box
    act(() => {
      fireEvent.change(getByPlaceholderText('search'), { target: { value: 'randomstring' } })
    })
    // Since we searched for a random string, it should filter out the remaining option is2
    await waitFor(() => expect(queryByText('is2')).toBeNull())

    // Apply the selections
    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.applyInputSets'))
    })

    // Check if onChange is called with proper values
    const selectedValues: InputSetValue[] | undefined = mockInputSetsList.data?.data?.content
      ?.filter(opt => opt.name !== 'is2')
      .map(opt => ({
        label: opt.name || '',
        value: opt.identifier || '',
        type: opt.inputSetType || ('INPUT_SET' as InputSetSummaryResponse['inputSetType']),
        gitDetails: {}
      }))

    await waitFor(() =>
      expect(onChangeMock).toBeCalledWith([
        {
          gitDetails: {},
          label: 'ol1',
          type: 'OVERLAY_INPUT_SET',
          value: 'overlay1'
        },
        {
          gitDetails: {},
          label: 'is1',
          type: 'INPUT_SET',
          value: 'inputset1'
        }
      ])
    )

    // Rerender with selected values i.e. is1 and ol1
    const onChangeRe = jest.fn()
    rerender(
      <TestWrapper>
        <InputSetSelector {...commonProps} value={selectedValues} onChange={onChangeRe} />
      </TestWrapper>
    )

    // Try and remove the first input set
    const firstXIcon = container.querySelectorAll('span[icon="cross"]')[0]
    fireEvent.click(firstXIcon)

    // Check if onChange is passed with the latest selected values
    await waitFor(() =>
      expect(onChangeRe).toBeCalledWith([
        {
          label: 'ol1',
          value: 'overlay1',
          type: 'OVERLAY_INPUT_SET',
          gitDetails: {}
        }
      ])
    )
  })

  test('input set displayed', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { getByTestId } = render(
      <TestWrapper>
        <InputSetSelector value={mockInputSetsValue} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )
    expect(getByTestId('button-input1')).toBeTruthy()
  })

  test('input set displayed in popover list', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { getByTestId, getByText, container } = render(
      <TestWrapper>
        <InputSetSelector value={mockInputSetsValue} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(container).toMatchSnapshot('snapshot afteropening the input set list'))

    expect(getByTestId('popover-is1')).toBeTruthy()
  })

  test('cross button exists when there is a selected inputset', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { container } = render(
      <TestWrapper>
        <InputSetSelector value={mockInputSetsValue} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )
    const crossbtn = container.querySelector('.bp3-popover-target .bp3-icon-cross')

    expect(crossbtn).toBeTruthy()
  })

  test('cross button working fine', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsList)

    const onChangeMock = jest.fn()
    const { container } = render(
      <TestWrapper>
        <InputSetSelector value={mockInputSetsValue} {...commonProps} onChange={onChangeMock} />
      </TestWrapper>
    )
    const crossbtn = container.querySelector('.bp3-popover-target .bp3-icon-cross')

    await waitFor(() => expect(crossbtn).toBeTruthy())

    if (crossbtn)
      act(() => {
        fireEvent.click(crossbtn)
      })

    expect(onChangeMock).toBeCalled()
  })

  test('Input set API return empty', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsListEmpty)

    const { getByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(getByText('inputSets.noRecord')).toBeTruthy())
  })

  test('Input set with git details', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsListWithGitDetails)

    const { getByText, queryByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('pipeline.inputSets.selectPlaceholder'))
    })

    await waitFor(() => expect(getByText('inputsetwithgit')).toBeTruthy())
    act(() => {
      fireEvent.click(getByText('inputsetwithgit'))
    })

    // Checkif 'branch' is visible
    expect(queryByText('branch')).toBeTruthy()
  })

  test('Input set API has error', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    useGetInputSetsListForPipeline.mockImplementation(() => mockInputSetsListError)

    const { queryByText } = render(
      <TestWrapper>
        <InputSetSelector {...commonProps} />
      </TestWrapper>
    )

    await waitFor(() => expect(queryByText('error message')).toBeTruthy())
  })
})
