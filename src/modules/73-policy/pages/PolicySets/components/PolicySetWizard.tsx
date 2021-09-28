import React from 'react'
import {
  Button,
  Text,
  Color,
  StepProps,
  FormikForm,
  Formik,
  Container,
  SelectOption,
  Layout,
  FieldArray,
  StepWizard,
  Select,
  FormInput
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useMutate } from 'restful-react'
import { useStrings } from 'framework/strings'
import { StringUtils } from '@common/exports'
import { NameIdDescriptionTags } from '@common/components'
import { useCreatePolicySet, useGetPolicyList, Policy } from 'services/pm'
import { useToaster } from '@common/exports'
import css from '../PolicySets.module.scss'
type CreatePolicySetWizardProps = StepProps<{ refetch: () => void; hideModal: () => void }> & {
  hideModal?: () => void
  refetch: () => void
}

const StepOne: React.FC<CreatePolicySetWizardProps> = ({ nextStep }) => {
  const { mutate: createPolicySet } = useCreatePolicySet({})
  const { showSuccess, showError } = useToaster()
  const onSubmitFirstStep = async (values: any) => {
    values['enabled'] = true
    createPolicySet(values)
      .then(response => {
        showSuccess(`Successfully created ${values.name} Policy Set`)
        nextStep?.({ ...values, id: response.id })
      })
      .catch(error => showError(error?.message))
  }

  const { getString } = useStrings()
  return (
    <Container padding="small" height={500}>
      <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('overview')}
      </Text>
      <Formik
        onSubmit={values => {
          onSubmitFirstStep(values)
          //   nextStep?.({ detailsData: values })
        }}
        formName="CreatePolicySet"
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('common.policiesSets.stepOne.validName')),
          identifier: Yup.string().when('name', {
            is: val => val?.length,
            then: Yup.string()
              .trim()
              .required(getString('validation.identifierRequired'))
              .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
              .notOneOf(StringUtils.illegalIdentifiers)
          })
        })}
        initialValues={{
          name: '',
          identifier: ''
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container>
                <NameIdDescriptionTags
                  formikProps={formikProps}
                  identifierProps={{
                    inputName: 'name',
                    isIdentifierEditable: true
                  }}
                />
                <FormInput.Select
                  items={[{ label: 'Pipeline', value: 'pipeline' }]}
                  label={'Entity Type that this policy set applies to'}
                  name="type"
                  disabled={false}
                />
                <FormInput.Select
                  items={[
                    { label: 'On Run', value: 'onrun' },
                    { label: 'On Save', value: 'onsave' }
                  ]}
                  label={'On what event should the policy set be evaluated'}
                  name="action"
                  disabled={false}
                />
              </Container>
              <Layout.Horizontal>
                <Button type="submit" intent="primary" text={getString('continue')} style={{ marginTop: '80px' }} />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

const StepTwo: React.FC<{ hideModal: () => void; refetch: () => void; prevStepData: { id: string } }> = ({
  prevStepData,
  hideModal
}) => {
  const { getString } = useStrings()
  const { data: policies, refetch } = useGetPolicyList({})
  const [policyId, setPolicyId] = React.useState('')
  const [severity, setSeverity] = React.useState('')
  const [deLinkpolicyId, setDelinkPolicyId] = React.useState('')
  const policyList: SelectOption[] = []

  const { showSuccess, showError } = useToaster()

  React.useEffect(() => {
    if (policies) {
      policies.map((v: Policy) => {
        policyList.push({ label: v.name as string, value: v.id?.toString() as string })
      })
    }
  }, [policies])

  const { mutate: patchPolicy } = useMutate({
    verb: 'PATCH',
    path: `pm/v1/policysets/${prevStepData?.id}/policy/${policyId}`
  })

  const { mutate: deleteLinkedPolicy } = useMutate({
    verb: 'DELETE',
    path: `pm/v1/policysets/${prevStepData?.id}/policy/${deLinkpolicyId}`
  })

  const handlePatchRequest = async (severitySelected: string) => {
    const response = await patchPolicy({ severity: severitySelected })
    return response
  }

  const handleDeleteRequest = async () => {
    const response = await deleteLinkedPolicy({})
    return response
  }

  React.useEffect(() => {
    if (policyId && severity) {
      handlePatchRequest(severity)
        .then(() => {
          showSuccess('Successfully linked policy with the policy set')
          refetch()
        })
        .catch(error => {
          showError(error.message || error)
        })
    }
  }, [policyId && severity])

  React.useEffect(() => {
    if (deLinkpolicyId) {
      handleDeleteRequest()
        .then(() => {
          showSuccess('Successfully delinked policy with the policy set')
          refetch()
        })
        .catch(error => {
          showError(error.message || error)
        })
    }
  }, [deLinkpolicyId])

  const handleChangeValue = async (attachedPolicies: any) => {
    if (attachedPolicies?.modifiedRows?.length) {
      const { rowIndex } = attachedPolicies

      const row = attachedPolicies.modifiedRows[rowIndex]

      const policyDetail = row?.policy?.value
      const severitySelected = row?.severity?.value
      if (policyDetail && severitySelected) {
        setPolicyId(policyDetail)
        setSeverity(severitySelected)
      }
    }
  }

  return (
    <Container padding="small" height={500}>
      <Text margin={{ bottom: 'xlarge' }} font={{ size: 'medium' }} color={Color.BLACK}>
        {getString('common.policiesSets.evaluationCriteria')}
      </Text>
      <Formik
        onSubmit={() => {
          hideModal()
          refetch()
        }}
        formName="patchPolicy"
        initialValues={{}}
      >
        {() => {
          return (
            <FormikForm>
              <Container className={css.policyAssignment}>
                <FieldArray
                  label="Applies to Pipeline on the following events"
                  addLabel="Add Policy"
                  name="attachedPolicies"
                  onChange={data => handleChangeValue(data)}
                  insertRowAtBeginning={false}
                  isDeleteOfRowAllowed={() => true}
                  onDeleteOfRow={async data => {
                    setDelinkPolicyId(data?.policy?.value)
                    return true
                  }}
                  containerProps={{ className: css.containerProps }}
                  fields={[
                    {
                      name: 'policy',
                      label: 'Evaluate Policy',
                      renderer: (value, _index, handleChange) => (
                        <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                          <Select
                            items={policyList}
                            value={value}
                            inputProps={{
                              placeholder: 'Select Policy'
                            }}
                            onChange={handleChange}
                          />
                        </Layout.Vertical>
                      )
                    },
                    {
                      name: 'severity',
                      label: 'What should happen if a policy fails?',
                      renderer: (value, _index, handleChange) => (
                        <Layout.Vertical flex={{ alignItems: 'end' }} spacing="xsmall">
                          <Select
                            items={[
                              { label: 'Warn & continue', value: 'warning' },
                              { label: 'Error and exit', value: 'error' }
                            ]}
                            value={value}
                            inputProps={{
                              placeholder: 'Select Severity'
                            }}
                            onChange={handleChange}
                          />
                        </Layout.Vertical>
                      )
                    }
                  ]}
                />

                <Layout.Horizontal>
                  <Button type="submit" intent="primary" text={getString('finish')} />
                </Layout.Horizontal>
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

const CreatePolicySetWizard: React.FC<any> = props => {
  //   const { isEdit } = props
  const { getString } = useStrings()

  return (
    <StepWizard iconProps={{ size: 37 }} title={getString('pipeline.policyEvaluations.policySet')}>
      <StepOne name={getString('overview')} {...props} />
      <StepTwo name={getString('common.policiesSets.evaluationCriteria')} {...props} />
    </StepWizard>
  )
}

export default CreatePolicySetWizard
