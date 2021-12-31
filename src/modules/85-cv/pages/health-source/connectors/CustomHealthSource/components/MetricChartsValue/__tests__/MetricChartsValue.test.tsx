import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import MetricChartsValue from '../MetricChartsValue'
import { CustomHealthSourceFieldNames } from '../../../CustomHealthSource.constants'
import { mocksampledata } from '../../../__tests__/CustomHealthSource.mock'

const formikSetFieldValue = jest.fn()
const formikValues = {
  [CustomHealthSourceFieldNames.METRIC_VALUE]: '',
  [CustomHealthSourceFieldNames.TIMESTAMP_LOCATOR]: '',
  [CustomHealthSourceFieldNames.SERVICE_INSTANCE]: '',
  [CustomHealthSourceFieldNames.TIMESTAMP_FORMAT]: ''
}
describe('Validate MetricChartsValue conponent', () => {
  test('should render MetricChartsValue', () => {
    const { container } = render(
      <TestWrapper>
        <MetricChartsValue
          formikValues={formikValues as any}
          formikSetFieldValue={formikSetFieldValue}
          isQueryExecuted={true}
          recordsData={mocksampledata as any}
          isSelectingJsonPathDisabled={false}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('JSON path component is disabled when isQueryExecuted is disabled', () => {
    const { container, rerender } = render(
      <TestWrapper>
        <MetricChartsValue
          formikValues={{} as any}
          formikSetFieldValue={{ formikSetFieldValue }}
          isQueryExecuted={false}
          recordsData={[] as any}
          isSelectingJsonPathDisabled={true}
        />
      </TestWrapper>
    )

    expect(container.querySelectorAll('.bp3-disabled').length).toEqual(2)

    rerender(
      <TestWrapper>
        <MetricChartsValue
          formikValues={{} as any}
          formikSetFieldValue={{ formikSetFieldValue }}
          isQueryExecuted={false}
          recordsData={[] as any}
          isSelectingJsonPathDisabled={false}
        />
      </TestWrapper>
    )

    expect(container.querySelectorAll('.bp3-disabled').length).toEqual(0)

    expect(container).toMatchSnapshot()
  })
})
