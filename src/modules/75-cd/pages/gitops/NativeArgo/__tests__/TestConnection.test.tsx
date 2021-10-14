import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TestConnection from '../TestConnection/TestConnection'

global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve({ text: '' })
  })
)

const currentUser = {
  defaultAccountId: '123',
  accounts: [
    {
      uuid: '123',
      createdFromNG: true
    }
  ]
}

describe('TestConnection snapshot test', () => {
  test('should render TestConnection', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ currentUserInfo: currentUser }}>
        <TestConnection />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
