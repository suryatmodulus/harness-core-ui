import {
  DefaultDiagramState,
  DiagramEngine,
  LinkLayerFactory,
  NodeLayerFactory
} from '@projectstorm/react-diagrams-core'

import { SelectionBoxLayerFactory, CanvasEngineOptions } from '@projectstorm/react-canvas-core'
import { StepGroupNodeLayerFactory } from './node-layer/StepGroupNodeLayerFactory'
import { DefaultLabelFactory } from './label/DefaultLabelFactory'
import { DefaultNodeFactory } from './node/DefaultNodeFactory'
import { CreateNewFactory } from './node/CreateNew/CreateNewFactory'
import { IconNodeFactory } from './node/IconNode/IconNodeFactory'
import { EmptyNodeFactory } from './node/EmptyNode/EmptyNodeFactory'
import { NodeStartFactory } from './node/NodeStart/NodeStartFactory'
import { GroupNodeFactory } from './node/GroupNode/GroupNodeFactory'
import { DiamondNodeFactory } from './node/DiamondNode/DiamondNodeFactory'
import { DefaultLinkFactory } from './link/DefaultLinkFactory'
import { DefaultPortFactory } from './port/DefaultPortFactory'

export * from './label/DefaultLabelFactory'
export * from './label/DefaultLabelModel'
export * from './label/DefaultLabelWidget'

export * from './link/DefaultLinkFactory'
export * from './link/DefaultLinkModel'
export * from './link/DefaultLinkWidget'
export * from './link/DefaultLinkSegmentWidget'
export * from './link/DefaultLinkPointWidget'

export * from './node/DefaultNodeFactory'
export * from './node/DefaultNodeModel'
export * from './node/DefaultNodeWidget'

export * from './node-layer/StepGroupNodeLayerFactory'
export * from './node-layer/StepGroupNodeLayerModel'
export * from './node-layer/StepGroupNodeLayerWidget'

export * from './node/CreateNew/CreateNewFactory'
export * from './node/CreateNew/CreateNewModel'
export * from './node/CreateNew/CreateNewWidget'

export * from './node/IconNode/IconNodeFactory'
export * from './node/IconNode/IconNodeModel'
export * from './node/IconNode/IconNodeWidget'

export * from './node/EmptyNode/EmptyNodeFactory'
export * from './node/EmptyNode/EmptyNodeModel'
export * from './node/EmptyNode/EmptyNodeWidget'

export * from './node/GroupNode/GroupNodeFactory'
export * from './node/GroupNode/GroupNodeModel'
export * from './node/GroupNode/GroupNodeWidget'

export * from './node/NodeStart/NodeStartFactory'
export * from './node/NodeStart/NodeStartModel'
export * from './node/NodeStart/NodeStartWidget'

export * from './node/DiamondNode/DiamondNodeFactory'
export * from './node/DiamondNode/DiamondNodeModel'
export * from './node/DiamondNode/DiamondNodeWidget'

export * from './port/DefaultPortFactory'
export * from './port/DefaultPortLabelWidget'
export * from './port/DefaultPortModel'

export * from './model/DiagramModel'
export * from './canvas/CanvasWidget'
export * from './Constants'

export * from './canvas/RollbackToggleSwitch/RollbackToggleSwitch'

/**
 * Construct an engine with the defaults installed
 */
export const createEngine = (options: CanvasEngineOptions = {}): DiagramEngine => {
  const engine = new DiagramEngine(options)

  // register model factories
  engine.getLayerFactories().registerFactory(new NodeLayerFactory() as any)
  engine.getLayerFactories().registerFactory(new StepGroupNodeLayerFactory() as any)
  engine.getLayerFactories().registerFactory(new LinkLayerFactory() as any)
  engine.getLayerFactories().registerFactory(new SelectionBoxLayerFactory())

  engine.getLabelFactories().registerFactory(new DefaultLabelFactory())
  engine.getNodeFactories().registerFactory(new DefaultNodeFactory())
  engine.getLinkFactories().registerFactory(new DefaultLinkFactory())
  engine.getPortFactories().registerFactory(new DefaultPortFactory())
  engine.getNodeFactories().registerFactory(new EmptyNodeFactory())
  engine.getNodeFactories().registerFactory(new CreateNewFactory())
  engine.getNodeFactories().registerFactory(new GroupNodeFactory())
  engine.getNodeFactories().registerFactory(new DiamondNodeFactory())
  engine.getNodeFactories().registerFactory(new IconNodeFactory())
  engine.getNodeFactories().registerFactory(new NodeStartFactory())
  // register the default interaction behaviors
  engine.getStateMachine().pushState(new DefaultDiagramState())
  return engine
}
