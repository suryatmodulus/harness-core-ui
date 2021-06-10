import React from 'react'
import * as Yup from 'yup'
import { Dialog } from '@blueprintjs/core'
import { Button, Formik, FormikForm, FormInput } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { NameSchema } from '@common/utils/Validation'
import type { AllNGVariables } from '@pipeline/utils/types'

import { getVaribaleTypeOptions } from './CustomVariableUtils'

export interface VariableState {
  variable: AllNGVariables
  index: number
}

export interface AddEditCustomVariableProps {
  selectedVariable: VariableState | null
  setSelectedVariable(variable: VariableState | null): void
  addNewVariable(variable: AllNGVariables): void
  updateVariable(index: number, variable: AllNGVariables): void
  existingVariables?: AllNGVariables[]
}

export default function AddEditCustomVariable(props: AddEditCustomVariableProps): React.ReactElement {
  const { selectedVariable, setSelectedVariable, addNewVariable, updateVariable, existingVariables } = props
  const { getString } = useStrings()

  const existingNames: string[] = Array.isArray(existingVariables) ? existingVariables.map(v => v.name || '') : []
  const isEdit = selectedVariable && typeof selectedVariable.index === 'number' && selectedVariable.index > -1

  // remove current variable name in case of edit
  if (isEdit) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    existingNames.splice(selectedVariable!.index, 1)
  }

  function closeModal(): void {
    setSelectedVariable(null)
  }

  return (
    <Dialog
      className={'padded-dialog'}
      isOpen={!!selectedVariable}
      title={isEdit ? getString('common.editVariable') : getString('common.addVariable')}
      onClose={closeModal}
    >
      <Formik
        initialValues={selectedVariable?.variable}
        enableReinitialize
        validationSchema={Yup.object().shape({
          name: NameSchema().notOneOf(existingNames, getString('common.validation.variableAlreadyExists'))
        })}
        onSubmit={data => {
          if (data && selectedVariable) {
            if (selectedVariable.index === -1) {
              addNewVariable(data)
            } else {
              updateVariable(selectedVariable.index, data)
            }
            closeModal()
          }
        }}
      >
        {({ submitForm }) => (
          <FormikForm>
            <FormInput.Text
              name="name"
              label={getString('variableNameLabel')}
              placeholder={getString('variableNameLabel')}
            />
            <FormInput.Select
              name="type"
              items={getVaribaleTypeOptions(getString)}
              label={getString('typeLabel')}
              placeholder={getString('typeLabel')}
            />
            <div className="buttons-container">
              <Button intent="primary" text={getString('save')} onClick={submitForm} /> &nbsp; &nbsp;
              <Button text={getString('cancel')} onClick={() => closeModal()} />
            </div>
          </FormikForm>
        )}
      </Formik>
    </Dialog>
  )
}
