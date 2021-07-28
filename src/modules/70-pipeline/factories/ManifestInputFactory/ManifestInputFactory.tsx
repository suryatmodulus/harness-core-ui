import type { FormType, StepDetailsRegister } from './types'

export class ManifestInputFactory {
  private stepDetailsMap = new Map<FormType, StepDetailsRegister>()
  private defaultStepDetails!: StepDetailsRegister

  registerDefaultStepDetails(defaultRegister: StepDetailsRegister): void {
    this.defaultStepDetails = defaultRegister
  }

  getStepDetails(formType?: FormType): StepDetailsRegister {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return formType && this.stepDetailsMap.has(formType) ? this.stepDetailsMap.get(formType)! : this.defaultStepDetails
  }

  registerStepDetails(formType: FormType, stepDetails: StepDetailsRegister): void {
    if (this.stepDetailsMap.has(formType)) {
      throw new Error(`Form of type "${formType}" is already registred`)
    }

    this.stepDetailsMap.set(formType, stepDetails)
  }
}
