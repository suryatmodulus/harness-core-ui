import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { MonitoredServiceType } from '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.constants'
import MonitoredServiceCategory from '../MonitoredServiceCategory'

describe('Unit tests for MonitoredServiceCategory', () => {
  test('Ensure infra type is rendered correctly', async () => {
    const { container, getByText } = render(<MonitoredServiceCategory type="Infrastructure" />)
    await waitFor(() => expect(container.querySelector('[class*="infrastructure"]')).not.toBeNull())
    getByText(MonitoredServiceType.INFRASTRUCTURE)
    expect(container).toMatchSnapshot()
  })
  test('Ensure application typee is rendered correctly', async () => {
    const { container, getByText } = render(<MonitoredServiceCategory type="Application" />)
    await waitFor(() => expect(container.querySelector('[class*="application"]')).not.toBeNull())
    getByText(MonitoredServiceType.APPLICATION)
    expect(container).toMatchSnapshot()
  })
  test('Ensure null type is rendered correctly', async () => {
    const { container } = render(<MonitoredServiceCategory />)
    await waitFor(() => expect(container.querySelector('[class*="application"]')).toBeNull())
    expect(container.querySelector('[class*="infrastructure"]')).toBeNull()
    expect(container).toMatchSnapshot()
  })
})
