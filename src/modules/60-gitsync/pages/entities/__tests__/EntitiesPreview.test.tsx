import React from 'react'
import { render, waitFor } from '@testing-library/react'
import EntitiesPreview, { EntityListView } from '../EntitiesPreview'
import entitiesMockResponse from './mockData/entitiesMockResponse.json'

jest.mock('services/cd-ng', () => ({
  useListGitSyncEntitiesByProduct: jest.fn(() => [])
}))

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => {
    return { accountId: 'dummy' }
  })
}))

describe('Git Sync - EntitiesPreview', () => {
  test('render Git Sync EntitiesPreview wrapper', async () => {
    const { container } = render(<EntitiesPreview selectedProduct={'CD'} />)
    expect(container).toMatchSnapshot()
  })

  test('render Git Sync Entity List ', async () => {
    const { container, getAllByText } = render(
      <EntityListView
        data={entitiesMockResponse.data.gitSyncEntityListDTOList[0] as any}
        hideHeaders={true}
      ></EntityListView>
    )
    await waitFor(() => getAllByText('My prod pipeline'))
    expect(container).toMatchSnapshot()
  })
})
