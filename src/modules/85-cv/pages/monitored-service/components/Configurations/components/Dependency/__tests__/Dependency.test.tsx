import React from 'react'
import { render, waitFor, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { monitoredService, monitoredServiceList, updatedPayload } from './Dependency.mock'
import Dependency from '../Dependency'

const onSuccess = jest.fn()
const updateMonitoredService = jest.fn()

jest.mock('services/cv', () => ({
  useListMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: monitoredServiceList, refetch: jest.fn() })),
  useUpdateMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, mutate: updateMonitoredService }))
}))
describe('Dependency compoennt', () => {
  test('should render', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <Dependency value={monitoredService} onSuccess={onSuccess} dependencyTabformRef={{ current: {} }} />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText(`total ${monitoredServiceList.data.content.length}`)).toBeTruthy())
    const checkedValues = monitoredService.dependencies.map(dependeny => dependeny.monitoredServiceIdentifier)
    container.querySelectorAll('input[type="checkbox"]').forEach(async item => {
      if (checkedValues.includes(item.id)) {
        await waitFor(() => expect(item).toBeChecked())
      } else {
        await waitFor(() => expect(item).not.toBeChecked())
      }
    })
    act(() => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => expect(onSuccess).toHaveBeenCalledWith(updatedPayload))
  })
})
