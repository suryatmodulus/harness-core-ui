import { LayerModel, LayerModelGenerics, LayerModelOptions } from '@projectstorm/react-canvas-core'
import { DiagramEngine, NodeModel, DiagramModel } from '@projectstorm/react-diagrams-core'
import { EmptyNodeModel } from '../node/EmptyNode/EmptyNodeModel'
import type { RollbackToggleSwitchProps } from '../canvas/RollbackToggleSwitch/RollbackToggleSwitch'

export interface StepGroupNodeLayerOptions extends LayerModelOptions {
  label?: string
  childrenDistance?: number
  depth?: number
  headerDepth?: number
  allowAdd?: boolean
  identifier?: string
  showRollback?: boolean
  inComplete?: boolean
  containerCss?: React.CSSProperties
  textCss?: React.CSSProperties
  skipCondition?: string
  conditionalExecutionEnabled?: boolean
  rollBackProps?: Omit<RollbackToggleSwitchProps, 'onChange'>
  disableCollapseButton?: boolean
  hideOutPort?: boolean
}

export interface StepGroupNodeLayerModelGenerics extends LayerModelGenerics {
  OPTIONS: StepGroupNodeLayerOptions
  CHILDREN: NodeModel
  ENGINE: DiagramEngine
}

export class StepGroupNodeLayerModel<
  G extends StepGroupNodeLayerModelGenerics = StepGroupNodeLayerModelGenerics
> extends LayerModel<G> {
  startNode: EmptyNodeModel
  endNode: EmptyNodeModel

  constructor(options: StepGroupNodeLayerOptions = {}) {
    super({
      type: 'step-group-nodes',
      isSvg: false,
      allowAdd: false,
      depth: 1,
      containerCss: {},
      textCss: {},
      inComplete: false,
      transformed: true,
      showRollback: true,
      ...options
    })
    this.startNode = new EmptyNodeModel({
      id: options.identifier + '-Start',
      identifier: options.identifier + '-Start',
      name: 'Empty',
      hideOutPort: true
    })
    this.endNode = new EmptyNodeModel({
      id: options.identifier + '-End',
      identifier: options.identifier + '-End',
      name: 'Empty',
      hideInPort: true,
      hideOutPort: options.hideOutPort
    })
    this.addModel(this.startNode)
    this.addModel(this.endNode)
  }

  setOptions(options: StepGroupNodeLayerOptions): void {
    this.options = { ...this.options, ...options }
    this.endNode.setOptions({ ...this.endNode.getOptions(), ...{ hideOutPort: this.options.hideOutPort } })
  }

  addModel(model: G['CHILDREN']): void {
    if (!(model instanceof NodeModel)) {
      throw new Error('Can only add nodes to this layer')
    }
    model.registerListener({
      entityRemoved: () => {
        ;(this.getParent() as DiagramModel).removeNode(model)
      }
    })
    super.addModel(model)
  }

  getIdentifier(): string | undefined {
    return this.options.identifier
  }

  getChildModelFactoryBank(engine: G['ENGINE']) {
    return engine.getNodeFactories()
  }

  getNodes() {
    return this.getModels()
  }
}
