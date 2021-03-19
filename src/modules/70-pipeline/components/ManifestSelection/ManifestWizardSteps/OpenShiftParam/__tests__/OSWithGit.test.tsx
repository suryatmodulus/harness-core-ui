import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import OpenShiftParamWithGit from '../OSWithGit'

const props = {
  stepName: 'Manifest details',
  expressions: [],
  initialValues: {
    identifier: 'test',
    branch: 'master',
    commitId: 'test-commit',
    gitFetchType: 'Branch',
    paths: ['test'],
    skipResourceVersioning: false,
    repoName: 'repo-test'
  },
  handleSubmit: jest.fn()
}
describe('Open shift params with git tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <OpenShiftParamWithGit {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
