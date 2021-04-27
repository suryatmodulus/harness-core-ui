import type { IconName } from '@wings-software/uicore'
import { DefaultNodeModelOptions, DefaultNodeModel } from '../DefaultNodeModel'
import { DiagramType } from '../../Constants'

export interface DiamondNodeModelOptions extends Omit<DefaultNodeModelOptions, 'secondaryIcon' | 'name'> {
  name?: string
  secondaryIcon?: IconName
}

export class DiamondNodeModel extends DefaultNodeModel {
  constructor(options?: DiamondNodeModelOptions) {
    super({
      type: DiagramType.DiamondNode,
      name: 'Approve',
      icon: 'add',
      secondaryIcon: null,
      allowDropOnNode: false,
      ...options
    })
  }
}
