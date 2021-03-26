import React from 'react'
import * as Yup from 'yup'
import { Dialog, Classes } from '@blueprintjs/core'
import { Button, Formik, FormikForm, FormInput } from '@wings-software/uicore'

import { useStrings } from 'framework/exports'
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
}

export default function AddEditCustomVariable(props: AddEditCustomVariableProps): React.ReactElement {
  const { selectedVariable, setSelectedVariable, addNewVariable, updateVariable } = props
  const { getString } = useStrings()

  function closeModal(): void {
    setSelectedVariable(null)
  }

  return (
    <Dialog isOpen={!!selectedVariable} title={getString('common.addVariable')} onClose={closeModal}>
      <Formik
        initialValues={selectedVariable?.variable}
        enableReinitialize
        validationSchema={Yup.object().shape({
          name: Yup.string()
            .trim()
            .required(getString('fieldRequired', { name: getString('name') }))
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
          <>
            <div className={Classes.DIALOG_BODY}>
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
              </FormikForm>
            </div>
            <div className={Classes.DIALOG_FOOTER}>
              <Button intent="primary" text={getString('save')} onClick={submitForm} /> &nbsp; &nbsp;
              <Button text={getString('cancel')} onClick={() => closeModal()} />
            </div>
          </>
        )}
      </Formik>
    </Dialog>
  )
}
