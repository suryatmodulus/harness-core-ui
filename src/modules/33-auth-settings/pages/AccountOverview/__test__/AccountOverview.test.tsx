/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import AccountOverview from '../AccountOverview'

jest.mock('services/cd-ng', () => {
  return {
    useGetAccountLicenses: jest.fn().mockImplementation(() => {
      return {
        data: {
          correlationId: '40d39b08-857d-4bd2-9418-af1aafc42d20',
          data: {
            accountId: 'HlORRJY8SH2IlwpAGWwkmg',
            moduleLicenses: {}
          },
          metaData: null,
          status: 'SUCCESS'
        }
      }
    }),
    useGetAccountNG: jest.fn().mockImplementation(() => {
      return {
        data: {
          data: {
            name: 'account name',
            identifier: 'id1',
            cluster: 'free',
            defaultExperience: 'NG'
          }
        },
        refetch: jest.fn()
      }
    }),
    useUpdateAccountDefaultExperienceNG: jest.fn().mockImplementation(() => {
      return {
        mutate: jest.fn(),
        loading: false
      }
    }),
    useUpdateAccountNameNG: jest.fn().mockImplementation(() => {
      return {
        mutate: jest.fn(),
        loading: false
      }
    })
  }
})

describe('Account Overview Page', () => {
  describe('Rendering', () => {
    test('should render properly', () => {
      const { container } = render(
        <TestWrapper>
          <AccountOverview />
        </TestWrapper>
      )
      expect(container).toMatchSnapshot()
    })
  })
})
