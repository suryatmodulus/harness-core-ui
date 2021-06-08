import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import SecretReferences from '../SecretReferences'
import referencedData from './secret-references-entities-data.json'

describe('Secret Referenced By', () => {
  test('render for no data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretReferences secretData={{} as any} />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'entityReference.noRecordFound'))
    expect(container).toMatchSnapshot()
  })
  test('render for data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretReferences secretData={referencedData as any} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
