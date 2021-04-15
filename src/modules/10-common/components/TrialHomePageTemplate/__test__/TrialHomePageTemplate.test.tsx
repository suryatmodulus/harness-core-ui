import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TrialHomePageTemplate } from '../TrialHomePageTemplate'

const props = {
  title: 'Continuous Integration',
  bgImageUrl: '',
  trialInProgressProps: {
    description: 'trial in progress description',
    startBtn: {
      description: 'Create Project',
      onClick: jest.fn
    }
  },
  startTrialProps: {
    description: 'start trial description',
    learnMore: {
      description: 'learn more description',
      url: ''
    },
    startBtn: {
      description: 'Start A Trial',
      onClick: () => true
    },
    changePlan: {
      description: 'Change Plan',
      url: ''
    }
  }
}
describe('TrialHomePageTemplate snapshot test', () => {
  test('should render start a trial by default', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <TrialHomePageTemplate {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render trial in progress when click start button', async () => {
    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <TrialHomePageTemplate {...props} />
      </TestWrapper>
    )
    fireEvent.click(getByText('Start A Trial'))
    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
