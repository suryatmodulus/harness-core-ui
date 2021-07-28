import type { TriggerFormType, FormDetailsRegister } from './types'

export class ArtifactTriggerInputFactory {
  private stepDetailsMap = new Map<TriggerFormType, FormDetailsRegister>()
  private defaultStepDetails!: FormDetailsRegister

  registerDefaultStepDetails(defaultRegister: FormDetailsRegister): void {
    this.defaultStepDetails = defaultRegister
  }

  getStepDetails(formType?: TriggerFormType): FormDetailsRegister {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return formType && this.stepDetailsMap.has(formType) ? this.stepDetailsMap.get(formType)! : this.defaultStepDetails
  }

  registerTriggerForm(formType: TriggerFormType, stepDetails: FormDetailsRegister): void {
    if (this.stepDetailsMap.has(formType)) {
      throw new Error(`Form of type "${formType}" is already registred`)
    }

    this.stepDetailsMap.set(formType, stepDetails)
  }
}
