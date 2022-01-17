/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { FormikForm } from '@wings-software/uicore'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import MapQueriesToHarnessServiceLayout from '../MapQueriesToHarnessServiceLayout'
import type { MapQueriesToHarnessServiceLayoutProps } from '../types'
import { mockedStackdriverLogSampleData } from './MapQueriesToHarnessServiceLayout.mocks'

const WrapperComponent = (props: MapQueriesToHarnessServiceLayoutProps): JSX.Element => {
  return (
    <TestWrapper
      pathParams={{
        accountId: '1234_accountId',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG'
      }}
    >
      <Formik initialValues={props.formikProps.initialValues} onSubmit={jest.fn()}>
        <FormikForm>
          <MapQueriesToHarnessServiceLayout {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetStackdriverLogSampleData: jest.fn().mockImplementation(() => ({
    loading: false,
    error: null,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS',
        data: mockedStackdriverLogSampleData
      }
    })
  }))
}))

describe('Unit tests for MapQueriesToHarnessServiceLayout', () => {
  const initialProps = {
    formikProps: {
      initialValues: {
        metricName: 'GCO Logs Query',
        query: '',
        messageIdentifier: '',
        serviceInstance: ''
      }
    },
    connectorIdentifier: 'Test',
    onChange: jest.fn()
  }
  test('Verify that records are fetched when fetch records button is clicked', async () => {
    const { getByText, container } = render(<WrapperComponent {...initialProps} />)

    // When query is empty initially then fetch records button should be disabled
    const fetchRecordsButton = getByText('cv.monitoringSources.gcoLogs.fetchRecords')
    await waitFor(() => expect(fetchRecordsButton).not.toBeNull())
    await waitFor(() => expect(fetchRecordsButton.parentElement?.className).toContain('disabled'))

    // Entering query
    await setFieldValue({
      container,
      type: InputTypes.TEXTAREA,
      fieldId: 'query',
      value: 'Test'
    })

    // Clicking on the fetch query button
    await waitFor(() => expect(fetchRecordsButton).not.toBeNull())
    fireEvent.click(fetchRecordsButton)

    //Verify if charts are present
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())
    await waitFor(() => expect(getByText('timeline-line-chart')).not.toBeNull())
  })

  test('Verify that records are fetched automatically when query is prefilled in edit flow', async () => {
    const propsWhenQueryIsPresent = {
      formikProps: {
        initialValues: {
          metricName: 'GCO Logs Query',
          query: 'Test',
          messageIdentifier: '',
          serviceInstance: ''
        }
      },
      connectorIdentifier: 'Test',
      onChange: jest.fn()
    }
    const { getByText } = render(<WrapperComponent {...propsWhenQueryIsPresent} />)

    //Verify if charts are present
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())
    await waitFor(() => expect(getByText('timeline-line-chart')).not.toBeNull())
  })
})
