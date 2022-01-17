/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CreateOrSelectAProjectTemplate } from '../CreateOrSelectAProjectTemplate'

const props = {
  moduleDescription: 'CD Create or select a project',
  onCreateProject: jest.fn()
}
describe('Rendering', () => {
  test('that it should render', () => {
    const { container } = render(
      <TestWrapper>
        <CreateOrSelectAProjectTemplate {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('that clicking the select project button will close the modal', async () => {
    const closeModalMock = jest.fn()

    const mockProps = {
      moduleDescription: 'test description',
      onCreateProject: jest.fn(),
      closeModal: closeModalMock
    }

    const { getByText } = render(
      <TestWrapper>
        <CreateOrSelectAProjectTemplate {...mockProps} />
      </TestWrapper>
    )

    expect(getByText('projectsOrgs.selectAnExistingProject')).toBeDefined

    fireEvent.click(getByText('projectsOrgs.selectAnExistingProject'))

    await waitFor(() => expect(closeModalMock).toHaveBeenCalled())
  })

  test('that clicking the create project button will call create project', async () => {
    const createProjectMock = jest.fn()

    const mockProps = {
      moduleDescription: 'test description',
      onCreateProject: createProjectMock
    }

    const { getByText } = render(
      <TestWrapper>
        <CreateOrSelectAProjectTemplate {...mockProps} />
      </TestWrapper>
    )

    expect(getByText('projectsOrgs.createANewProject')).toBeDefined

    fireEvent.click(getByText('projectsOrgs.createANewProject'))
    createProjectMock
    await waitFor(() => expect(createProjectMock).toHaveBeenCalled())
  })
})
