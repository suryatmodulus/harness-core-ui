import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/exports'
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
  module: ModuleName.CI
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

  test('should render trial in progress when click start button', async () => {
    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'dummy' }}>
        <StartTrialTemplate {...props} />
      </TestWrapper>
    )
    fireEvent.click(getByText('Start A Trial'))
    await waitFor(() => expect(container).toMatchSnapshot())
  })
})
