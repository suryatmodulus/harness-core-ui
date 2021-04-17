import React from 'react'
import type { Meta, Story } from '@storybook/react'
import styled from '@emotion/styled'
import { TestWrapper } from '@common/utils/testUtils'
import { CanvasWidget, createEngine, DefaultLinkModel, DefaultNodeModel, DiagramModel } from '.'
import css from './Diagram.module.scss'

const Wrapper = styled.div`
  min-height: 500px;
  padding-top: 80px;
  max-width: 300px;
`

// eslint-disable-next-line @typescript-eslint/ban-types
const DiagramSample: React.FC<{}> = () => {
  //1) setup the diagram engine
  const engine = React.useMemo(() => createEngine({}), [])

  //2) setup the diagram model
  const model = React.useMemo(() => new DiagramModel(), [])
  //3-A) create a default node
  const node1 = new DefaultNodeModel({
    name: 'Node 1',
    isInComplete: true
  })
  node1.setPosition(100, 100)
  const port1 = node1.addOutPort('Out')

  //3-B) create another default node
  const node2 = new DefaultNodeModel({
    name: 'Node 2',
    secondaryIcon: 'graph'
  })
  const port2 = node2.addInPort('In')
  node2.setPosition(400, 100)

  // link the ports
  const link1 = port1.link<DefaultLinkModel>(port2)
  link1.getOptions().testName = 'Test'
  link1.addLabel('Hello World!')

  //4) add the models to the root graph
  model.addAll(node1, node2, link1)

  //5) load model into engine
  engine.setModel(model)

  //6) render the diagram!
  return (
    <div className={css.canvas}>
      <CanvasWidget engine={engine} />
    </div>
  )
}

export default {
  title: 'Pipelines / Diagram',
  component: DiagramSample
} as Meta

// eslint-disable-next-line @typescript-eslint/ban-types
export const Basic: Story<{}> = _args => {
  return (
    <TestWrapper>
      <Wrapper>
        <DiagramSample />
      </Wrapper>
    </TestWrapper>
  )
}

Basic.args = {}
