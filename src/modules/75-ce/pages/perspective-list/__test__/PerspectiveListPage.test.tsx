import React from 'react'
import { render, queryByAttribute, fireEvent, act } from '@testing-library/react'
import { Provider } from 'urql'
import { fromValue } from 'wonka'
import type { DocumentNode } from 'graphql'
import { TestWrapper } from '@common/utils/testUtils'
import { FetchAllPerspectivesDocument } from 'services/ce/services'
import PerspectiveListPage from '../PerspectiveListPage'

import ResponseData from './ResponseData.json'

const params = {
  accountId: 'TEST_ACC'
}

describe('test cases for Perspective details Page', () => {
  test('should be able to render the details page', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchAllPerspectivesDocument) {
          return fromValue(ResponseData)
        }
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <PerspectiveListPage />
        </Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should be able to render and switch to list view', async () => {
    const responseState = {
      executeQuery: ({ query }: { query: DocumentNode }) => {
        if (query === FetchAllPerspectivesDocument) {
          return fromValue(ResponseData)
        }
      }
    }

    const { container } = render(
      <TestWrapper pathParams={params}>
        <Provider value={responseState as any}>
          <PerspectiveListPage />
        </Provider>
      </TestWrapper>
    )

    const listIcon = queryByAttribute('class', container, /bp3-icon-list/)

    act(() => {
      fireEvent.click(listIcon!)
    })
    expect(container).toMatchSnapshot()
  })
})
