import React from 'react'
import { render, waitFor, RenderResult } from '@testing-library/react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import * as cdng from 'services/cd-ng'
import mockBranches from './branchStatusMock.json'
import GitContextForm, { GitContextFormProps, GitContextProps } from '../GitContextForm'

const getListOfBranchesWithStatus = jest.fn(() => Promise.resolve(mockBranches))
const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('GitContextForm test', () => {
  const setup = (props?: Partial<GitContextFormProps<Record<string, any> & GitContextProps>>): RenderResult =>
    render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/resources/connectors"
        pathParams={pathParams}
      >
        <Formik<GitContextProps> initialValues={{ repo: '', branch: '' }} onSubmit={() => undefined}>
          {formikProps => (
            <FormikForm className="wrapperForm">
              <GitContextForm
                gitDetails={{
                  objectId: '1234',
                  branch: 'feature',
                  repoIdentifier: 'gitSyncRepo',
                  getDefaultFromOtherRepo: false
                }}
                formikProps={formikProps}
                {...props}
              />
            </FormikForm>
          )}
        </Formik>
      </GitSyncTestWrapper>
    )

  test('GitContextForm for edit should have repo and branch dropdown disabled', async () => {
    const { container, getByText } = setup()
    await waitFor(() => expect(() => getByText('common.git.selectRepoLabel')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('GitContextForm for create without deafult restriction should have repo and branch dropdown enabled', async () => {
    jest.spyOn(cdng, 'useGetListOfBranchesWithStatus').mockImplementation((): any => {
      return {
        data: mockBranches,
        refetch: getListOfBranchesWithStatus,
        error: null,
        loading: false,
        absolutePath: '',
        cancel: jest.fn(),
        response: null
      }
    })
    const { container, getByText } = setup({
      gitDetails: {
        branch: 'feature',
        repoIdentifier: 'gitSyncRepo',
        getDefaultFromOtherRepo: false
      }
    })
    await waitFor(() => expect(() => getByText('common.git.selectRepoLabel')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })

  test('GitContextForm for create with deafault restriction should have branch dropdown disabled', async () => {
    const { container, getByText } = setup({
      gitDetails: {
        branch: 'feature',
        repoIdentifier: 'gitSyncRepo',
        getDefaultFromOtherRepo: true
      }
    })
    await waitFor(() => expect(() => getByText('common.git.selectRepoLabel')).not.toBeNull())
    expect(container).toMatchSnapshot()
  })
})
