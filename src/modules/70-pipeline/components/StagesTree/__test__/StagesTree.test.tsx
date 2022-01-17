/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import type { ITreeNode } from '@blueprintjs/core'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import StagesTree from '../StagesTree'

const childNode1: ITreeNode = { id: 'childId1', label: 'childLabel1' }
const childNode2: ITreeNode = { id: 'childId2', label: 'childLabel2' }
const node1: ITreeNode = { id: 'id1', label: 'label1' }
const node2: ITreeNode = { id: 'id2', label: 'label2', childNodes: [childNode1, childNode2] }
const node3: ITreeNode = { id: 'id3', label: 'label3' }
const nodes: ITreeNode[] = [node1, node2, node3]

describe('StagesTree snapshot test', () => {
  test('shoud render properly', async () => {
    const { container } = render(<StagesTree contents={nodes} selectedId="childId2" selectionChange={noop} />)
    expect(container).toMatchSnapshot()
  })
})

describe('StagesTree bahave properly', () => {
  test('shoud call selectionChange on node click', async () => {
    const selectionChange = jest.fn()

    const { getByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <StagesTree contents={nodes} selectedId="id2" selectionChange={selectionChange} />
      </TestWrapper>
    )

    await act(async () => {
      const node = await getByText('label2')
      fireEvent.click(node?.parentElement!)
    })

    expect(selectionChange).toBeCalledWith('id2', node2)
  })

  test('shoud select and open tree to selected node', async () => {
    const selectionChange = jest.fn()

    const { getByText } = render(
      <TestWrapper pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
        <StagesTree contents={nodes} selectedId="childId2" selectionChange={selectionChange} />
      </TestWrapper>
    )

    // check if is selected node (selectedId) has 'selected' classnale
    const node = await getByText('childLabel2')
    expect(node?.parentElement?.parentElement?.className).toContain('bp3-tree-node-selected')

    // check if full path to selected node is expanded
    await waitFor(() => expect(getByText('label2')).not.toBeNull())
    await waitFor(() => expect(getByText('childLabel2')).not.toBeNull())
  })
})
