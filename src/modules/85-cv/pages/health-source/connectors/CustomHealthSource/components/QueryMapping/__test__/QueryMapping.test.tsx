/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import * as cdServices from 'services/cd-ng'
import QueryMapping from '../QueryMapping'
import { mocksampledata } from '../../../__tests__/CustomHealthSource.mock'
import { formikValue } from './QueryMapping.mock'

const onFetchRecordsSuccess = jest.fn()
const setLoading = jest.fn()
describe('Validate MapMetricsToServices conponent', () => {
  test('should render MapMetricsToServices', () => {
    const getSampleData = jest.fn()
    jest
      .spyOn(cvServices, 'useFetchSampleData')
      .mockImplementation(() => ({ loading: false, error: null, mutate: getSampleData } as any))
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
    const { container } = render(
      <TestWrapper>
        <QueryMapping
          formikSetFieldValue={jest.fn()}
          formikValues={{} as any}
          connectorIdentifier={'customConn'}
          onFetchRecordsSuccess={onFetchRecordsSuccess}
          isQueryExecuted={true}
          recordsData={mocksampledata as any}
          setLoading={setLoading}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render MapMetricsToServices in editMode', () => {
    const getSampleData = jest.fn()
    jest
      .spyOn(cvServices, 'useFetchSampleData')
      .mockImplementation(() => ({ loading: false, error: null, mutate: getSampleData } as any))
    jest
      .spyOn(cdServices, 'useGetConnector')
      .mockImplementation(() => ({ loading: false, error: null, data: {} } as any))
    const { container } = render(
      <TestWrapper>
        <QueryMapping
          formikSetFieldValue={jest.fn()}
          formikValues={formikValue as any}
          connectorIdentifier={'customConn'}
          onFetchRecordsSuccess={onFetchRecordsSuccess}
          isQueryExecuted={true}
          recordsData={mocksampledata as any}
          setLoading={setLoading}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
