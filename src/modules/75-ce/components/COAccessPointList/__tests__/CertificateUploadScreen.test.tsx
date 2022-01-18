/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CertificateUpload from '../CertificateUploadScreen'

describe('Certificate Upload Screen', () => {
  test('render upload component along with other fields', () => {
    const { container } = render(
      <TestWrapper>
        <CertificateUpload onSubmit={jest.fn()} mode={'create'} editableFieldsMap={{}} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('render upload component in edit mode', () => {
    const { container } = render(
      <TestWrapper>
        <CertificateUpload onSubmit={jest.fn()} mode={'edit'} editableFieldsMap={{}} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
