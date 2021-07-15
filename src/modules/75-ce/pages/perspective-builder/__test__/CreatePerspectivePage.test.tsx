import React from 'react'
import { render } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { TestWrapper } from '@common/utils/testUtils'
import { FetchViewFieldsDocument } from 'services/ce/services'

import CreatePerspectivePage from '../CreatePerspectivePage'
import PerspectiveResponseData from '../../perspective-details/__test__/PerspectiveData.json'
import ViewFieldResponseData from '../../perspective-details/__test__/ViewFieldResponse.json'

jest.mock('services/ce', () => ({
  ...(jest.requireActual('services/ce') as any),
  useGetPerspective: jest.fn().mockImplementation(() => {
    return { data: PerspectiveResponseData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('@ce/components/CEChart/CEChart', () => 'mock')

const params = {
  accountId: 'TEST_ACC',
  perspetiveId: 'perspectiveId',
  perspectiveName: 'sample perspective'
}

describe('test cases for Create Perspective Page', () => {
  test('should be able to render the Perspective Builder', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchViewFieldsDocument) {
          return fromValue(ViewFieldResponseData)
        }
        return fromValue({})
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <CreatePerspectivePage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
