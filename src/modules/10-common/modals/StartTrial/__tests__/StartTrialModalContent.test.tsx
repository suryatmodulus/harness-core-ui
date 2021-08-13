import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import type { Module } from '@common/interfaces/RouteInterfaces'

import StartTrialModalContent from '../StartTrialModalContent'

describe('StartTrialModalContent', () => {
  describe('Rendering', () => {
    test('that the content renders', () => {
      const props = {
        handleStartTrial: jest.fn(),
        module: 'ce' as Module
      }

      const { container, getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <StartTrialModalContent {...props} />
        </TestWrapper>
      )
      expect(getByText('common.purpose.ce.description')).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    test('test that the warning container renders', async () => {
      const props = {
        handleStartTrial: jest.fn(),
        module: 'ce' as Module
      }

      const { container, getByText } = render(
        <TestWrapper
          path="/account/:accountId"
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <StartTrialModalContent {...props} />
        </TestWrapper>
      )
      expect(getByText('common.purpose.ce.description')).toBeDefined()

      expect(container).toMatchSnapshot()
    })

    test('test that adding a source query param updates the button text', async () => {
      const startTrialMock = jest.fn()

      const props = {
        handleStartTrial: startTrialMock,
        module: 'ce' as Module
      }

      const { container } = render(
        <TestWrapper
          path="/account/:accountId"
          queryParams={{ source: 'signup' }}
          pathParams={{ accountId: 'testAcc' }}
          defaultAppStoreValues={defaultAppStoreValues}
        >
          <StartTrialModalContent {...props} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })
})
