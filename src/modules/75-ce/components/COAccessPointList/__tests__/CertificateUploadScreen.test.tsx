import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CertificateUpload from '../CertificateUploadScreen'

describe('Certificate Upload Screen', () => {
  test('render upload component along with other fields', () => {
    const { container } = render(
      <TestWrapper>
        <CertificateUpload onSubmit={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
