import React, { useEffect, useState } from 'react'
import cx from 'classnames'
import { cloneDeep } from 'lodash-es'
import { Tree, ITreeNode, IProps } from '@blueprintjs/core'
import css from './StagesTree.module.scss'

export const stagesTreeNodeClasses = {
  primary: css.stagesTreeBulletSquare,
  secondary: css.stagesTreeBulletCircle,
  empty: css.stagesTreeBulletEmpty
}

export interface StagesTreeProps extends IProps {
  contents: ITreeNode[]
  selectedId: string | undefined
  selectionChange: (selectedId: string, node: ITreeNode) => void
}

function expandToSelected(nodes: ITreeNode[], id: string): boolean {
  let retExpanded = false
  nodes.forEach(node => {
    node.isSelected = node.id === id

    let expanded = node.id === id
    if (node.childNodes) {
      expanded = expandToSelected(node.childNodes, id) || expanded
    }
    node.isExpanded = node.isExpanded || expanded
    retExpanded = retExpanded || expanded
  })
  return retExpanded
}

function forEachNode(nodes: ITreeNode[], callback: (node: ITreeNode) => void): void {
  for (const node of nodes) {
    callback(node)
    if (node.childNodes) {
      forEachNode(node.childNodes, callback)
    }
  }
}

const StagesTree: React.FC<StagesTreeProps> = props => {
  const { contents, selectedId, selectionChange, className } = props
  const [nodes, setNodes] = useState(cloneDeep(contents))

  // expand to selected one
  useEffect(() => {
    if (selectedId) {
      expandToSelected(contents, selectedId)
      setNodes(contents)
    }
  }, [contents, selectedId])

  return (
    <div className={cx(className, css.container)}>
      <Tree
        contents={contents}
        onNodeClick={node => {
          forEachNode(nodes, n => (n.isSelected = false))
          if (node.hasCaret) {
            node.isExpanded = !node.isExpanded
          } else {
            selectionChange(node.id as string, node)
          }
          setNodes(cloneDeep(nodes))
        }}
        onNodeCollapse={node => {
          node.isExpanded = false
          setNodes(cloneDeep(nodes))
        }}
        onNodeExpand={node => {
          node.isExpanded = true
          setNodes(cloneDeep(nodes))
        }}
      />
    </div>
  )
}

export default StagesTree
