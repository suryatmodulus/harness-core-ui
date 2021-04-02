import type { IconName } from '@wings-software/uicore'
import { DefaultNodeModelOptions, DefaultNodeModel } from '../DefaultNodeModel'
import { DiagramType } from '../../Constants'

export interface DiamondNodeModelOptions extends Omit<DefaultNodeModelOptions, 'secondaryIcon' | 'name'> {
  name?: string
  secondaryIcon?: IconName
  errorList?: [string, string[]][]
}

export class DiamondNodeModel extends DefaultNodeModel {
  constructor(options?: DiamondNodeModelOptions) {
    super({
      type: DiagramType.DiamondNode,
      name: 'Approve',
      icon: 'add',
      ...options
    })
  }
}
