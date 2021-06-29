import { DefaultNodeModel, DefaultNodeModelOptions } from '../DefaultNodeModel'
import { DefaultPortModel } from '../../port/DefaultPortModel'
import { DiagramType, PortName } from '../../Constants'

export class EmptyNodeModel extends DefaultNodeModel {
  constructor(option: DefaultNodeModelOptions = { name: 'Empty' }) {
    super({ type: DiagramType.EmptyNode, ...option })
    this.addPort(
      new DefaultPortModel({
        in: false,
        name: PortName.Out
      })
    )
    this.addPort(
      new DefaultPortModel({
        in: true,
        name: PortName.In
      })
    )
  }

  setOptions(options: DefaultNodeModelOptions): void {
    this.options = { ...this.getOptions(), ...options }
  }

  serialize(): any {
    return {
      ...super.serialize()
    }
  }

  deserialize(event: any): void {
    super.deserialize(event)
  }
}
