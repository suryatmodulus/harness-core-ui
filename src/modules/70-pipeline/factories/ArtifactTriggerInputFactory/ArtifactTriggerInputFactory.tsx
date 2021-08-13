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
