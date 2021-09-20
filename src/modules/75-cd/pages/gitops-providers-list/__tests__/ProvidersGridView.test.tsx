import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ProvidersGridView from '../ProvidersGridView/ProvidersGridView'

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

describe('ProvidersGridView snapshot test', () => {
  test('should render ProvidersGridView', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <ProvidersGridView gotoPage={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
