/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { TriggerFormType, FormDetailsRegister } from './types'

export class ArtifactTriggerInputFactory {
  private triggerFormDetailsMap = new Map<TriggerFormType, FormDetailsRegister>()
  private defaultTriggerFormDetails!: FormDetailsRegister

  registerDefaultTriggerFormDetails(defaultRegister: FormDetailsRegister): void {
    this.defaultTriggerFormDetails = defaultRegister
  }

  getTriggerFormDetails(formType?: TriggerFormType): FormDetailsRegister {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return formType && this.triggerFormDetailsMap.has(formType)
      ? this.triggerFormDetailsMap.get(formType)!
      : this.defaultTriggerFormDetails
  }

  registerTriggerForm(formType: TriggerFormType, stepDetails: FormDetailsRegister): void {
    if (this.triggerFormDetailsMap.has(formType)) {
      throw new Error(`Form of type "${formType}" is already registred`)
    }

    this.triggerFormDetailsMap.set(formType, stepDetails)
  }
}
