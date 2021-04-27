import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Module } from '@common/interfaces/RouteInterfaces'
import { StartTrialTemplate } from '../StartTrialTemplate'

jest.mock('services/portal', () => ({
  useGetModuleLicenseInfo: jest.fn().mockImplementation(() => {
    return {
      data: null
    }
  }),
  useStartTrial: jest.fn().mockImplementation(() => {
    return {
      cancel: jest.fn(),
      loading: false,
      mutate: jest.fn().mockImplementationOnce(() => {
        return {
          status: 'SUCCESS',
          data: {
            licenseType: 'TRIAL'
          }
        }
      })
    }
  })
}))

const props = {
  title: 'Continuous Integration',
  bgImageUrl: '',
  startTrialProps: {
    description: 'start trial description',
    learnMore: {
      description: 'learn more description',
      url: ''
    },
    startBtn: {
      description: 'Start A Trial',
      onClick: () => true
    }
  },
  module: 'ci' as Module
}
describe('StartTrialTemplate snapshot test', () => {
  test('should render start a trial by default', async () => {
    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
