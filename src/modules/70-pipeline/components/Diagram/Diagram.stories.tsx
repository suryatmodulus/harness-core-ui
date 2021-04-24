import React from 'react'
import type { Meta, Story } from '@storybook/react'
import styled from '@emotion/styled'
import { TestWrapper } from '@common/utils/testUtils'
import { DiamondNodeModel } from './node/DiamondNode/DiamondNodeModel'
import { IconNodeModel } from './node/IconNode/IconNodeModel'
import {
  CanvasWidget,
  createEngine,
  DefaultLinkModel,
  DefaultNodeModel,
  DiagramModel,
  EmptyNodeModel,
  PortName
} from '.'
import css from './Diagram.module.scss'

const Wrapper = styled.div`
  min-height: 800px;
  padding-top: 80px;
  max-width: 1000px;
`

const DiagramSample: React.FC<any> = () => {
  //1) setup the diagram engine
  const engine = React.useMemo(() => createEngine({}), [])

  //2) setup the diagram model
  const model = React.useMemo(() => new DiagramModel(), [])
  //3-A) create a default node
  const node1 = new DefaultNodeModel({
    id: 'node1',
    name: 'Node 1',
    isInComplete: true
  })
  node1.setPosition(100, 100)
  const port1 = node1.addOutPort('Out')

  //3-B) create another default node
  const node2 = new DefaultNodeModel({
    id: 'node2',
    name: 'Node 2',
    secondaryIcon: 'graph',
    skipCondition: 'Test Skip',
    canDelete: false
  })
  node2.setPosition(500, 100)

  // Add Icon Node
  const iconNode = new IconNodeModel({
    id: 'iconNode',
    name: 'Icon 2',
    icon: 'barrier-open',
    iconProps: {
      size: 24,
      color: 'red500'
    }
  })
  iconNode.setPosition(500, 250)
  const port2 = node2.addInPort('In')
  const port3 = node2.addOutPort('Out')

  //Add Empty Node
  const emptyNode1 = new EmptyNodeModel({ id: 'emptyNode1', name: 'emptyNode1' })
  emptyNode1.setPosition(250, 100)
  const emptyNode2 = new EmptyNodeModel({ id: 'emptyNode2', name: 'emptyNode2' })
  emptyNode2.setPosition(750, 100)

  // Approval Node
  const approvalNode = new DiamondNodeModel({
    id: 'approval',
    name: 'Jira Approval',
    icon: 'check'
  })
  approvalNode.setPosition(900, 100)
  const port4 = approvalNode.addInPort('In')

  // link the ports
  const link1 = new DefaultLinkModel({ id: 'link1' })
  link1.setSourcePort(port1)
  link1.setTargetPort(emptyNode1.getPort(PortName.In) || emptyNode1.addInPort(PortName.In))
  link1.getOptions().testName = 'Test'
  link1.addLabel('Hello World!')

  // Connect Empty Node to Node 2
  const emptyNode2Link = new DefaultLinkModel({ id: 'emptyNode2', allowAdd: false })
  emptyNode2Link.setSourcePort(emptyNode1.getPort(PortName.Out) || emptyNode1.addInPort(PortName.Out))
  emptyNode2Link.setTargetPort(port2)

  // Connect Empty Node to Icon Node
  const emptyIconLink = new DefaultLinkModel({ id: 'emptyIconLink', allowAdd: false })
  emptyIconLink.setSourcePort(emptyNode1.getPort(PortName.Out) || emptyNode1.addInPort(PortName.Out))
  emptyIconLink.setTargetPort(iconNode.getPort(PortName.In) || emptyNode1.addInPort(PortName.In))

  // Connect Node 2 to Empty Node 2
  const node2Empty2Link = new DefaultLinkModel({ id: 'node2Empty2Link', allowAdd: false })
  node2Empty2Link.setSourcePort(port3)
  node2Empty2Link.setTargetPort(emptyNode2.getPort(PortName.In) || emptyNode2.addInPort(PortName.In))

  // Connect Icon to Empty Node 2
  const iconEmpty2Link = new DefaultLinkModel({ id: 'iconEmpty2Link', allowAdd: false })
  iconEmpty2Link.setSourcePort(iconNode.getPort(PortName.Out) || emptyNode1.addInPort(PortName.Out))
  iconEmpty2Link.setTargetPort(emptyNode2.getPort(PortName.In) || emptyNode2.addInPort(PortName.In))

  const link2 = new DefaultLinkModel({ id: 'link2' })
  link2.setSourcePort(emptyNode2.getPort(PortName.Out) || emptyNode2.addInPort(PortName.Out))
  link2.setTargetPort(port4)

  //4) add the models to the root graph
  model.addAll(
    node1,
    node2,
    link1,
    approvalNode,
    link2,
    iconNode,
    emptyNode1,
    emptyNode2,
    emptyNode2Link,
    emptyIconLink,
    node2Empty2Link,
    iconEmpty2Link
  )

  //5) load model into engine
  engine.setModel(model)

  //6) render the diagram!
  return (
    <div className={css.canvas}>
      <CanvasWidget engine={engine} isRollback rollBackProps={{ large: true }} />
    </div>
  )
}

export const DiagramDemo = (): JSX.Element => (
  <Wrapper>
    <DiagramSample />
  </Wrapper>
)

export default {
  title: 'Pipelines / Diagram',
  component: DiagramSample
} as Meta

export const Basic: Story<any> = _args => {
  return (
    <TestWrapper>
      <DiagramDemo />
    </TestWrapper>
  )
}

Basic.args = {}
