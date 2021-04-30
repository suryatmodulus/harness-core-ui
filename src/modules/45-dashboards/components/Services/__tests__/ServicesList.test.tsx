import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ServicesList } from '@dashboards/components/Services/ServicesList/ServicesList'
import { ServiceListMock } from '@dashboards/mock'

jest.mock('highcharts-react-official', () => () => <></>)

describe('ServicesList', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ServicesList {...{ ...ServiceListMock, data: [ServiceListMock.data[0]] }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
