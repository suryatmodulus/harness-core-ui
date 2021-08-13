import { IDrawerProps, IPopoverProps, PopoverInteractionKind, PopoverPosition, Position } from '@blueprintjs/core'

export const RiskOptions = [
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
  { label: 'P3', value: 'P3' },
  { label: 'P4', value: 'P4' },
  { label: 'P5', value: 'P5' }
]

export const DrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: true,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '70%'
}

export const ShareContentPopoverProps: IPopoverProps = {
  canEscapeKeyClose: true,
  interactionKind: PopoverInteractionKind.CLICK,
  minimal: true,
  position: PopoverPosition.BOTTOM,
  usePortal: true
}
