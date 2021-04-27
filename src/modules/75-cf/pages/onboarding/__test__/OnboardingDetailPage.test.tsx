import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SupportPlatforms } from '@cf/components/LanguageSelection/LanguageSelection'
import { OnboardingDetailPage } from '../OnboardingDetailPage'
import { CreateAFlagView } from '../views/CreateAFlagView'
import { SetUpYourApplicationView } from '../views/SetUpYourApplicationView'
import { TestYourFlagViewView } from '../views/TestYourFlagView'

jest.mock('../views/SelectEnvironmentView', () => ({
  SelectEnvironmentView: function MockComponent() {
    return <div />
  }
}))

describe('OnboardingDetailPage', () => {
  test('OnboardingDetailPage empty state should be rendered properly', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <OnboardingDetailPage />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should be able to create a flag', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <OnboardingDetailPage />
      </TestWrapper>
    )

    const flagName = 'test-boolean-flag'

    fireEvent.input(container.querySelector('input') as HTMLInputElement, { target: { value: flagName } })

    waitFor(() =>
      expect(container.querySelector('button[class*=Button--button]:not(:first-of-type)[class*=disabled]')).toBeNull()
    )

    fireEvent.click(container.querySelector('button[class*=Button--button]:not(:first-of-type)') as HTMLButtonElement)

    waitFor(() => expect(container.querySelector('button[class*=LanguageSelection-module_button')).not.toBeNull())

    expect(container).toMatchSnapshot()
  })

  test('CreateAFlagView', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CreateAFlagView
          flagInfo={{
            project: 'dummy',
            name: 'test-flag',
            identifier: 'test_flag',
            kind: 'boolean',
            archived: false,
            variations: [
              { identifier: 'true', name: 'True', value: 'true' },
              { identifier: 'false', name: 'False', value: 'false' }
            ],
            defaultOnVariation: 'true',
            defaultOffVariation: 'false',
            permanent: false
          }}
          setFlagName={jest.fn()}
          isCreated={true}
          goNext={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('SetUpYourApplicationView', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <SetUpYourApplicationView
          flagInfo={{
            project: 'dummy',
            name: 'test-flag',
            identifier: 'test_flag',
            kind: 'boolean',
            archived: false,
            variations: [
              { identifier: 'true', name: 'True', value: 'true' },
              { identifier: 'false', name: 'False', value: 'false' }
            ],
            defaultOnVariation: 'true',
            defaultOffVariation: 'false',
            permanent: false
          }}
          language={SupportPlatforms[1]}
          setLanguage={jest.fn()}
          apiKey={{
            name: 'xxx-xxx-xxx',
            apiKey: 'xxx-xxx-xxx',
            identifier: 'xxx-xxx-xxx',
            type: 'Server'
          }}
          setApiKey={jest.fn()}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('TestYourFlagViewView', () => {
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <TestYourFlagViewView
          flagInfo={{
            project: 'dummy',
            name: 'test-flag',
            identifier: 'test_flag',
            kind: 'boolean',
            archived: false,
            variations: [
              { identifier: 'true', name: 'True', value: 'true' },
              { identifier: 'false', name: 'False', value: 'false' }
            ],
            defaultOnVariation: 'true',
            defaultOffVariation: 'false',
            permanent: false
          }}
          language={SupportPlatforms[1]}
          apiKey={{
            name: 'xxx-xxx-xxx',
            apiKey: 'xxx-xxx-xxx',
            identifier: 'xxx-xxx-xxx',
            type: 'Server'
          }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
