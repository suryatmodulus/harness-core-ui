import { AbstractPureComponent2, IDialogProps as BpDialogProps } from '@blueprintjs/core'

// Declaring a new blueprint module, so thet enforceFocus can be flagged as false.
// This is needed for the NG tooltip framework to work
// All the dialogs/drawers/overlays should pass this flag as false

declare module '@blueprintjs/core' {
  export interface IDialogProps extends Omit<BpDialogProps, 'enforceFocus'> {
    enforceFocus: false
  }

  // To avoid the error  "Don't use `{}` as a type. `{}` actually means "any non-nullish value"."
  // eslint-disable-next-line
  export declare class Dialog extends AbstractPureComponent2<IDialogProps, {}> {
    static displayName: string
    render(): JSX.Element
    protected validateProps(props: IDialogProps): void
    private maybeRenderCloseButton
    private maybeRenderHeader
  }
}
