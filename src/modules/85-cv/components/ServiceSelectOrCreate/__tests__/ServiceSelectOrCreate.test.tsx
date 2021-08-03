import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { useCreateService } from 'services/cd-ng'
import { ServiceSelectOrCreate } from '../ServiceSelectOrCreate'

jest.mock('services/cd-ng')
const useCreateServiceMock = useCreateService as jest.MockedFunction<any>

const onSelect = jest.fn()
const onNewCreated = jest.fn()

describe('ServiceSelectOrCreate', () => {
  test('Match Snapshot', () => {
    useCreateServiceMock.mockImplementation(() => {
      return {
        loading: false,
        mutate: jest.fn().mockImplementation(() => {
          return {
            status: 'SUCCESS',
            data: {}
          }
        })
      }
    })
    const { container } = render(
      <TestWrapper>
        <ServiceSelectOrCreate options={[]} onSelect={onSelect} onNewCreated={onNewCreated} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
