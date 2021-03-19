import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import OpenShiftTemplateWithGit from '../OSTemplateWithGit'

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
describe('Open shift template with git tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <OpenShiftTemplateWithGit {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
