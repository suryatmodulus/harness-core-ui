import React from 'react'

import { render, queryByText, fireEvent, act } from '@testing-library/react'
import type { Project } from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import PurposeList from '../PurposeList'

const project: Project = {
  orgIdentifier: 'testOrg',
  identifier: 'test',
  name: 'test',
  color: '#e6b800',
  modules: [],
  description: 'test',
  tags: { tag1: '', tag2: 'tag3' }
}

const addModule = jest.fn()
jest.mock('services/cd-ng', () => ({
  usePutProject: jest.fn().mockImplementation(() => ({ mutate: addModule }))
}))

describe('PurposeList test', () => {
  test('initializes ok ', async () => {
    const { container, getByTestId } = render(
      <TestWrapper
        path="/account/:accountId"
        pathParams={{ accountId: 'testAcc' }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <PurposeList data={project} />
      </TestWrapper>
    )
    expect(queryByText(container, i18n.newProjectWizard.purposeList.name)).toBeDefined()
    expect(container).toMatchSnapshot()
    await act(async () => {
      const enablecd = getByTestId('CD')
      fireEvent.click(enablecd)
    })
    expect(addModule).toHaveBeenCalledWith({
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: ['CD'],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    })
    addModule.mockReset()
    await act(async () => {
      const enablecv = getByTestId('CV')
      fireEvent.click(enablecv)
    })
    expect(addModule).toHaveBeenCalledWith({
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: ['CD', 'CV'],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    })
    addModule.mockReset()
    await act(async () => {
      const enableci = getByTestId('CI')
      fireEvent.click(enableci)
    })
    expect(addModule).toHaveBeenCalledWith({
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: ['CD', 'CV', 'CI'],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    })
    addModule.mockReset()
    await act(async () => {
      const enablece = getByTestId('CE')
      fireEvent.click(enablece)
    })
    expect(addModule).toHaveBeenCalledWith({
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: ['CD', 'CV', 'CI', 'CE'],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    })
    addModule.mockReset()
    await act(async () => {
      const enablecf = getByTestId('CF')
      fireEvent.click(enablecf)
    })
    expect(addModule).toHaveBeenCalledWith({
      project: {
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    })
    expect(container).toMatchSnapshot()
  })
})
