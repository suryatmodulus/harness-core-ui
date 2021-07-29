import type { TriggerFormType, FormDetailsRegister } from './types'

export class ArtifactTriggerInputFactory {
  private triggerFormDetailsMap = new Map<TriggerFormType, FormDetailsRegister>()

  getTriggerFormDetails(formType: TriggerFormType): FormDetailsRegister {
    return this.triggerFormDetailsMap.get(formType)!
  }

  registerTriggerForm(formType: TriggerFormType, stepDetails: FormDetailsRegister): void {
    if (this.triggerFormDetailsMap.has(formType)) {
      throw new Error(`Form of type "${formType}" is already registred`)
    }

    this.triggerFormDetailsMap.set(formType, stepDetails)
  }
}
