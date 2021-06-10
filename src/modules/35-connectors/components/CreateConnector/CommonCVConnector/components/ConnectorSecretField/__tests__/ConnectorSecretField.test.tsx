import React from 'react'
import { Formik, FormikForm } from '@wings-software/uicore'
import { render, waitFor } from '@testing-library/react'
import * as connectorUtils from '@connectors/pages/connectors/utils/ConnectorUtils'
import { TestWrapper } from '@common/utils/testUtils'
import { ConnectorSecretField, ConnectorSecretFieldProps } from '../ConnectorSecretField'

const orgIdentifier = '1234_orgIdentifier'
const projectIdentifier = '1234_identifier'
const accountId = '1234_accountIf'

function WrapperComponent(props: ConnectorSecretFieldProps): JSX.Element {
  return (
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <FormikForm>
          <ConnectorSecretField {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for ConnectorSecretField', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('Ensure that if api errors out toaster displays meessage', async () => {
    jest.spyOn(connectorUtils, 'setSecretField').mockRejectedValue('mock error')
    const { getByText } = render(
      <WrapperComponent
        secretInputProps={{
          label: 'dsfsdf',
          name: 'sdf'
        }}
        secretFieldValue="secretValue"
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onSuccessfulFetch={jest.fn()}
      />
    )

    await waitFor(() => expect(getByText('mock error')).not.toBeNull())
  })

  test('Ensure that if api is loading field has loading placeholder', async () => {
    jest.spyOn(connectorUtils, 'setSecretField').mockImplementation(() => new Promise(() => undefined))
    const { getByText } = render(
      <WrapperComponent
        secretInputProps={{
          label: 'dsfsdf',
          name: 'sdf'
        }}
        secretFieldValue="secretValue"
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onSuccessfulFetch={jest.fn()}
      />
    )

    await waitFor(() => expect(getByText('loading')).not.toBeNull())
  })

  test('Ensure that when api returns valid value the onsuccess function is called', async () => {
    jest.spyOn(connectorUtils, 'setSecretField').mockResolvedValue('someValue' as any)
    const onSuccessMck = jest.fn()
    render(
      <WrapperComponent
        secretInputProps={{
          label: 'dsfsdf',
          name: 'sdf'
        }}
        secretFieldValue="secretValue"
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onSuccessfulFetch={onSuccessMck}
      />
    )

    await waitFor(() => expect(onSuccessMck).toHaveBeenCalledWith('someValue'))
  })

  test('Ensure that when scret value isnt provided api is not callede', async () => {
    const mockfn = jest.spyOn(connectorUtils, 'setSecretField').mockResolvedValue('someValue' as any)
    const onSuccessMck = jest.fn()
    const { container } = render(
      <WrapperComponent
        secretInputProps={{
          label: 'dsfsdf',
          name: 'sdf'
        }}
        accountIdentifier={accountId}
        projectIdentifier={projectIdentifier}
        orgIdentifier={orgIdentifier}
        onSuccessfulFetch={onSuccessMck}
      />
    )

    await waitFor(() => expect(container.querySelector('[data-testid="sdf"]')).not.toBeNull())
    expect(mockfn).not.toHaveBeenCalled()
  })
})
