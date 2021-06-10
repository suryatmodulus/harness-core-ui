import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { FormikForm } from '@wings-software/uicore'
import { Formik } from 'formik'
import { act } from 'react-test-renderer'
import { TestWrapper } from '@common/utils/testUtils'
import { InputWithDynamicModalForJson } from '../InputWithDynamicModalForJson'
import type { InputWithDynamicModalForJsonProps } from '../types'

function WrapperComponent(props: InputWithDynamicModalForJsonProps): any {
  return (
    <TestWrapper>
      <Formik initialValues={{}} onSubmit={jest.fn()}>
        <FormikForm>
          <InputWithDynamicModalForJson {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

describe('Unit tests for InputWithDynamicModalForJson component', () => {
  const initialProps = {
    onChange: jest.fn(),
    isQueryExecuted: true,
    isDisabled: false,
    sampleRecord: {
      insertId: '81zi3bf8rn604',
      jsonPayload: {
        logger: 'io.harness.threading.ForceQueuePolicy',
        message: 'rejectedExecution occurred - will force the thread pool to increase pool size',
        thread: 'New I/O worker #1',
        timestamp: '2021-06-10 10:27:21.150 +0000'
      },
      resource: {
        type: 'global',
        labels: {
          project_id: 'prod-setup-205416'
        }
      },
      timestamp: '2021-06-10T10:27:21.150Z',
      severity: 'INFO',
      labels: {
        processId: '273',
        delegateId: 'ETXC0fZzSi-jSOH1CSuSsw',
        app: 'delegate',
        source: 'harness-gke-stg-dieaes-0',
        version: '1.0.69405',
        managerHost: 'app.harness.io/gratis',
        accountId: '3Di8EaE3SfSb2K_qnu6h5g'
      },
      logName: 'projects/prod-setup-205416/logs/delegate',
      receiveTimestamp: '2021-06-10T10:27:21.760361428Z'
    },
    inputLabel: 'input-label',
    inputName: 'input-name',
    inputPlaceholder: 'input-placeholder',
    noRecordModalHeader: 'norecord-modalheader',
    noRecordInputLabel: 'norecord-inputlabel',
    recordsModalHeader: 'record-modal-header'
  }
  test('Verify that Valid Records state is rendering correctly for InputWithDynamicModalForJson', async () => {
    const { getByText } = render(<WrapperComponent {...initialProps} />)

    const plusIcon = await waitFor(() => getByText('plus'))
    expect(plusIcon).not.toBeNull()
    act(() => {
      fireEvent.click(plusIcon)
    })

    // check if the modal to select the field path is opened
    expect(getByText(initialProps.inputLabel)).not.toBeNull()
    expect(getByText(initialProps.recordsModalHeader)).not.toBeNull()
  })

  test('Verify that No Records state is rendering correctly for InputWithDynamicModalForJson', async () => {
    const newProps = { ...initialProps, sampleRecord: null }
    const { getByText } = render(<WrapperComponent {...newProps} />)

    const plusIcon = await waitFor(() => getByText('plus'))
    expect(plusIcon).not.toBeNull()
    act(() => {
      fireEvent.click(plusIcon)
    })

    // check if the modal to enter the field value is opened.
    expect(getByText(initialProps.inputLabel)).not.toBeNull()
    expect(getByText(initialProps.noRecordModalHeader)).not.toBeNull()
  })

  test('Verify that Disabled state is rendering correctly for InputWithDynamicModalForJson', async () => {
    const newProps = { ...initialProps, isDisabled: true }
    const { getByText } = render(<WrapperComponent {...newProps} />)

    const plusIcon = await waitFor(() => getByText('plus'))
    expect(plusIcon).not.toBeNull()
    expect(plusIcon.closest('button')).toBeDisabled()
  })
})
