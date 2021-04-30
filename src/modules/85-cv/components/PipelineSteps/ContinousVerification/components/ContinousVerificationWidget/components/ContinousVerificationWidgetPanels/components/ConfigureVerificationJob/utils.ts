import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { spec } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { VerificationJob } from '@cv/components/PipelineSteps/ContinousVerification/components/ContinousVerificationWidget/types'
/**
 *  gets particular field data from selected job
 * @param selectedJobField
 * @param options
 * @param selectedJob
 * @returns fieldData
 */
export function getFieldDataFromSelectedJob(
  selectedJobField: string,
  options: SelectOption[],
  selectedJob: VerificationJob
): SelectOption | string | undefined {
  let field: SelectOption | string | undefined
  if (selectedJob) {
    // if selected job is configured with run time param then user should be able to select anything
    if (selectedJob[selectedJobField]?.toString() === RUNTIME_INPUT_VALUE) {
      field = ''
    } else {
      field = options.find((el: SelectOption) => el.value === selectedJob[selectedJobField])
    }
  }
  return field
}

/**
 *  gets particular field data from Form
 * @param selectedJobField
 * @param options
 * @param specInfo
 * @param selectedJob
 * @returns fieldData
 */
export function getFieldDataFromForm(
  selectedJobField: string,
  options: SelectOption[],
  specInfo: spec | undefined,
  selectedJob: VerificationJob
): SelectOption | string | undefined {
  let completeFieldData: SelectOption | string | undefined
  if (specInfo) {
    // If form is modified then getting values from FORM
    if (specInfo[selectedJobField]) {
      if (specInfo[selectedJobField] === RUNTIME_INPUT_VALUE || specInfo[selectedJobField].value) {
        //if the user selects a fixed or run time value
        completeFieldData = specInfo[selectedJobField]
      }
    } else {
      // if form is not modified , then fetching info from the selected job
      completeFieldData = getFieldDataFromSelectedJob(selectedJobField, options, selectedJob)
    }
  }
  return completeFieldData
}

/**
 * Check is Field has to be disabled
 * @param formField
 * @param selectedJobField
 * @returns boolean
 */
export function isFieldDisabled(
  formField: SelectOption | string | undefined,
  selectedJobField: string | undefined
): boolean {
  const isFormNotModified = (formField as SelectOption)?.value?.toString() === selectedJobField
  return isFormNotModified
}
