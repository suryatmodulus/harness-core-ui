import React from 'react'
import { render, fireEvent, findByText, waitFor } from '@testing-library/react'
import { FormikForm, Formik } from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'

import secretsListMockData from './secretsListMockData.json'
import mockData from './connectorsListMockdata.json'
import connectorMockData from './getConnectorMock.json'

import SecretInput from '../SecretInput'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetConnectorList: () => {
    return {
      data: mockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: connectorMockData,
      refetch: jest.fn()
    }
  }
}))

describe('SecretInput', () => {
  test('render', async () => {
    const handleSuccess = jest.fn()

    const { container, getByText } = render(
      <TestWrapper>
        <Formik initialValues={{}} onSubmit={noop}>
          {() => {
            return (
              <FormikForm>
                <SecretInput
                  name="test"
                  label="test"
                  onSuccess={handleSuccess}
                  secretsListMockData={secretsListMockData as any}
                />
              </FormikForm>
            )
          }}
        </Formik>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('Create or Select a Secret'))
    })

    const modal = findDialogContainer()
    const secret = await findByText(modal!, 'a1')

    expect(modal).toMatchSnapshot()

    act(() => {
      fireEvent.click(secret)
    })

    const applyBtn = await waitFor(() => findByText(modal!, 'Apply Selected'))

    act(() => {
      fireEvent.click(applyBtn)
    })

    expect(handleSuccess).toHaveBeenCalled()

    const closeButton = modal?.querySelector("span[icon='cross']")?.closest('button')

    act(() => {
      fireEvent.click(closeButton!)
    })
  })
})
