import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cdService from 'services/cd-ng'
import * as cvService from 'services/cv'
import SelectApplications from '../SelectApplications'

jest.mock('../EnvironmentSelect', () => ({
  EnvironmentSelect: function MockSelect(props: any) {
    return (
      <div
        className="environment-select-mock"
        onClick={() =>
          props?.onSelect({
            label: 'env1',
            value: 'env1'
          })
        }
      />
    )
  }
}))

describe('SelectApplications', () => {
  beforeAll(() => {
    jest.spyOn(cdService, 'useGetEnvironmentListForProject').mockReturnValue({
      loading: false,
      data: {
        content: [
          {
            name: 'env1'
          },
          {
            name: 'env2'
          }
        ]
      }
    } as UseGetReturn<any, any, any, any>)
  })
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Matches snapshot', () => {
    jest.spyOn(cvService, 'useGetAppDynamicsApplications').mockReturnValue({
      loading: false,
      data: {
        data: {
          content: [
            {
              id: 1,
              name: 'app1'
            },
            {
              id: 2,
              name: 'app2'
            }
          ]
        }
      }
    } as UseGetReturn<any, any, any, any>)
    const { container } = render(
      <TestWrapper>
        <SelectApplications stepData={{}} onCompleteStep={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Mantains state correctly and calls onCompleteStep callback', () => {
    jest.spyOn(cvService, 'useGetAppDynamicsApplications').mockReturnValue({
      loading: false,
      data: {
        data: {
          content: [
            {
              id: 1,
              name: 'app1'
            },
            {
              id: 2,
              name: 'app2'
            }
          ]
        }
      }
    } as UseGetReturn<any, any, any, any>)
    const onCompleteStep = jest.fn()
    const { container } = render(
      <TestWrapper>
        <SelectApplications stepData={{}} onCompleteStep={onCompleteStep} />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('input[type=checkbox]')!)
    fireEvent.click(container.querySelector('.environment-select-mock')!)
    fireEvent.click(container.querySelector('button[type=submit]')!)
    expect(onCompleteStep).toHaveBeenCalled()
    const calledWithArg = onCompleteStep.mock.calls[0][0]
    expect(calledWithArg.applications['app1'].name).toEqual('app1')
    expect(calledWithArg.applications['app1'].environment).toEqual('env1')
  })

  test('Ensure no data state is rendered', async () => {
    const refetchMock = jest.fn()
    jest.spyOn(cvService, 'useGetAppDynamicsApplications').mockReturnValue({
      loading: false,
      data: { data: { content: [] } },
      refetch: refetchMock as unknown
    } as UseGetReturn<any, any, any, any>)

    const onCompleteStep = jest.fn()
    const { getByText } = render(
      <TestWrapper>
        <SelectApplications stepData={{}} onCompleteStep={onCompleteStep} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('retry')).not.toBeNull())
    fireEvent.click(getByText('retry'))
    await waitFor(() => expect(refetchMock).toHaveBeenCalledTimes(1))
  })
})
