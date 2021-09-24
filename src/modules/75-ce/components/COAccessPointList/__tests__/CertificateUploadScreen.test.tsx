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
