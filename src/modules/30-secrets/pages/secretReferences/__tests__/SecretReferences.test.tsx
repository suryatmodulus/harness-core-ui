import React from 'react'
import { act, fireEvent, render, waitFor, queryByText, getByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { accountPathProps, secretPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import SecretReferences from '../SecretReferences'
import referencedData from './secret-references-entities-data.json'

jest.mock('react-timeago', () => () => 'dummy date')

describe('Secret Referenced By', () => {
  test('render for no data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toResourcesSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretReferences
          mockData={{
            data: {} as any,
            loading: false
          }}
        />
      </TestWrapper>
    )
    await waitFor(() => queryByText(container, 'entityReference.noRecordFound'))
    expect(container).toMatchSnapshot()
  })
  test('render for data', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toResourcesSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretReferences
          mockData={{
            data: referencedData as any,
            loading: false
          }}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    await act(async () => {
      await waitFor(() => getByText(document.body, 'entity'))
      await waitFor(() => getByText(document.body, 'details'))
      await waitFor(() => getByText(document.body, 'lastActivity'))
    })
  })

  test('search', async () => {
    const { getByPlaceholderText } = render(
      <TestWrapper
        path={routes.toResourcesSecretDetailsReferences({ ...accountPathProps, ...secretPathProps })}
        pathParams={{ accountId: 'dummy', secretId: 'secretId' }}
      >
        <SecretReferences
          mockData={{
            data: referencedData as any,
            loading: false
          }}
        />
      </TestWrapper>
    )

    const searchBox = getByPlaceholderText('projectSelector.placeholder')
    expect(searchBox).not.toBe(null)
    await act(async () => {
      fireEvent.change(searchBox!, { target: { value: 'test' } })
    })
    expect(searchBox).toMatchSnapshot()
  })
})
