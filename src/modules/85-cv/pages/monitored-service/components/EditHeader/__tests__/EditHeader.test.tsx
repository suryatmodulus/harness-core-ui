import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { MonitoredServiceDTO } from 'services/cv'
import EditHeader from '../EditHeader'
import type { EditHeaderProps } from '../EditHeader.types'
import { MonitoredServiceType } from '../../Configurations/components/Service/components/MonitoredServiceOverview/MonitoredServiceOverview.constants'

const WrapperComponent = (props: EditHeaderProps): JSX.Element => {
  return (
    <TestWrapper>
      <EditHeader {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for EditHeader', () => {
  const initialProps = {
    monitoredServiceData: {
      name: 'monitored-service-name',
      identifier: 'monitored-service-identifier',
      environmentRef: 'env',
      serviceRef: 'service',
      type: MonitoredServiceType.INFRASTRUCTURE
    } as MonitoredServiceDTO,
    lastModifiedAt: 1628707742169
  }
  test('Verify if all the fields are rendered correctly inside EditHeader', async () => {
    const { container } = render(<WrapperComponent {...initialProps} />)
    expect(container).toMatchSnapshot()
  })
})
