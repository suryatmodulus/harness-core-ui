import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import { TrialInProgressTemplate } from '../TrialInProgressTemplate'

const props = {
  title: 'Continuous Integration',
  bgImageUrl: '',
  trialInProgressProps: {
    description: 'trial in progress description',
    startBtn: {
      description: 'Create a project',
      onClick: () => true
    }
  },
  module: ModuleName.CI
}
describe('TrialInProgressTemplate snapshot test', () => {
  test('should render trial in progress', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <TrialInProgressTemplate {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
