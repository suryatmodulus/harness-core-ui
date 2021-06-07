import React from 'react'
import { Container, Button } from '@wings-software/uicore'
import { render, fireEvent, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import * as portalService from 'services/portal'
import * as cdService from 'services/cd-ng'
import { cvConnectorHOC } from '../CVConnectorHOC'

const MockProps = {
  onClose: jest.fn(),
  onSuccess: jest.fn(),
  isEditMode: false,
  accountId: '1234_accountId',
  projectIdentifier: '1234_projectIdentifier',
  orgIdentifier: '1234_orgIdentifier',
  connectorInfo: undefined,
  setIsEditMode: () => undefined
}

const mockTransFormFunc = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegateTags: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesStatus: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateFromId: jest.fn().mockImplementation(() => jest.fn()),
  useGetDelegateSelectors: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetDelegatesStatusV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

function WrappedComponent(props: any) {
  return (
    <Container>
      <p>Dummy component</p>
      <Button onClick={() => props.nextStep()}>next</Button>
    </Container>
  )
}

function WrapperComponent(mockProps: any) {
  const MockComponent = cvConnectorHOC({
    connectorType: 'Prometheus',
    ConnectorCredentialsStep: WrappedComponent,
    buildSubmissionPayload: mockTransFormFunc
  })
  return (
    <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: '1234_accountId' }}>
      <MockComponent {...mockProps} />
    </TestWrapper>
  )
}

describe('Unit tests for cv connector hoc', () => {
  beforeEach(() => {
    jest.spyOn(portalService, 'useGetDelegateSelectors')
    jest.spyOn(cdService, 'validateTheIdentifierIsUniquePromise').mockResolvedValue({
      status: 'SUCCESS',
      data: true,
      metaData: {},
      correlationId: ''
    })
  })

  test('should render form', async () => {
    const { container, getByText } = render(<WrapperComponent {...MockProps} />)

    // match step 1
    expect(container).toMatchSnapshot()

    // fill step 1
    await setFieldValue({ container, fieldId: 'name', value: 'dummy name', type: InputTypes.TEXTFIELD })
    fireEvent.click(getByText('continue'))

    // step 2
    await waitFor(() => expect(getByText('Dummy component')).not.toBeNull())
    fireEvent.click(getByText('next'))

    // step 3
    await waitFor(() => expect(getByText('back')))
    const backBtn = getByText('back')
    fireEvent.click(backBtn)

    // back to step 2
    await waitFor(() => expect(getByText('Dummy component')).not.toBeNull())
  })
})
