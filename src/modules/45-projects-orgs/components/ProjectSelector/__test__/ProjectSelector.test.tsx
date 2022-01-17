/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ProjectSelector } from '../ProjectSelector'

import projects from './projects.json'

jest.mock('services/cd-ng', () => ({
  useGetProjectAggregateDTOList: jest.fn().mockImplementation(() => {
    return { data: projects, refetch: jest.fn(), error: null }
  }),
  useDeleteProject: jest.fn().mockImplementation(() => ({ mutate: jest.fn() }))
}))

describe('ProjectSelector', () => {
  test('render with projects', async () => {
    const handleSelect = jest.fn()

    const { container, getByText, getByTestId } = render(
      <TestWrapper path="/account/:accountId/cd/home" pathParams={{ accountId: 'dummy' }} projects={projects as any}>
        <ProjectSelector onSelect={handleSelect} moduleFilter="CD" />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    await act(async () => {
      fireEvent.click(getByTestId('project-select-button'))
    })

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('Online Banking'))
    })

    expect(getByText('Online Banking')).toBeDefined()
    expect(handleSelect).toHaveBeenCalled()
  })
})
