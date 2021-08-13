import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import { QlceViewFilterOperator } from 'services/ce/services'
import { TestWrapper } from '@common/utils/testUtils'
import ValueSelector from '../views/ValueSelector'
import ResponseData from './ResponseData.json'

const props = {
  setValues: jest.fn(),
  setOperator: jest.fn(),
  operator: QlceViewFilterOperator.In,
  values: {},
  service: {
    id: 'region',
    name: 'Region'
  },
  provider: {
    id: 'COMMON',
    name: 'Common'
  },
  isLabelOrTag: false,
  setService: jest.fn(),
  timeRange: {
    to: '2021-08-09',
    from: '2021-08-04'
  }
}

describe('test cases for value Selector component', () => {
  test('should be able to render the component', () => {
    const responseState = {
      executeQuery: () => {
        return fromValue(ResponseData)
      }
    }
    const { container } = render(
      <TestWrapper>
        <Provider value={responseState as any}>
          <ValueSelector {...props} />
        </Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
