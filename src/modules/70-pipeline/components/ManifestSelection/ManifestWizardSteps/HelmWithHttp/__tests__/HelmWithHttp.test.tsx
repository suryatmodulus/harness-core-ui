import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HelmWithHttp from '../HelmWithHttp'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  initialValues: {
    helmVersion: 'test',
    chartName: 'test',
    chartVersion: 'v3'
  },
  handleSubmit: jest.fn()
}
describe('helm with http tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <HelmWithHttp {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
