/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

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
