import React from 'react'
import {
  Color,
  Container,
  Text,
  FontVariation,
  FormikForm,
  FormInput,
  Formik,
  Layout,
  Button,
  FlexExpander,
  ButtonVariation,
  StepProps
} from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { get } from 'lodash-es'
import { useToaster } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useCreatePerspective, CEView } from 'services/ce'
import { useStrings } from 'framework/strings'
import { QlceView, useFetchPerspectiveListQuery } from 'services/ce/services'
import { generateId, CREATE_CALL_OBJECT } from '@ce/utils/perspectiveUtils'
import type { BudgetStepData } from '../types'
import css from '../PerspectiveCreateBudget.module.scss'

interface PerspectiveForm {
  perspective: string
}
interface SelectPerspectiveProps {
  name: string
  perspective?: string
  isEditMode?: boolean
}

const SelectPerspective: (props: StepProps<BudgetStepData> & SelectPerspectiveProps) => JSX.Element = props => {
  const { getString } = useStrings()
  const { nextStep, prevStepData, perspective, isEditMode } = props

  const { showError } = useToaster()
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()

  const { mutate: createView, loading: createViewLoading } = useCreatePerspective({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const [{ data: perspectiveData }] = useFetchPerspectiveListQuery()

  const perspectiveList = (perspectiveData?.perspectives?.customerViews || []) as QlceView[]

  const items = perspectiveList.map(name => ({
    label: name.name as string,
    value: name.id as string
  }))

  const handleSubmit = (data: PerspectiveForm) => {
    const perspectiveName = items.find(e => e.value === data.perspective)?.label as string

    const nextStepData = {
      perspective: data.perspective,
      perspectiveName: perspectiveName
    }
    nextStep?.(nextStepData)
  }

  const createNewPerspective = async () => {
    const perspectiveName = `Perspective-${generateId(6).toUpperCase()}`
    const createData = { ...CREATE_CALL_OBJECT, name: perspectiveName }

    try {
      const response = await createView(createData as CEView)
      const { data } = response

      const uuid = data?.uuid

      if (uuid) {
        history.push(
          routes.toCECreatePerspective({
            accountId: accountId,
            perspectiveId: uuid
          })
        )
      }
    } catch (e) {
      const errMessage = e.data.message
      showError(errMessage)
    }
  }

  return (
    <Container>
      <Formik<PerspectiveForm>
        onSubmit={data => {
          handleSubmit(data)
        }}
        formName="selectPerspective"
        enableReinitialize={true}
        initialValues={{
          perspective: perspective || get(prevStepData, 'perspective') || ''
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container className={css.selectPerspectiveContainer}>
                <Text font={{ variation: FontVariation.H4 }}>
                  {getString('ce.perspectives.budgets.defineTarget.title')}
                </Text>

                <Container
                  margin={{
                    top: 'xxlarge'
                  }}
                >
                  <Container padding="large" background={Color.PRIMARY_1}>
                    <Text>{getString('ce.perspectives.budgets.defineTarget.text')}</Text>
                  </Container>

                  <Layout.Horizontal
                    margin={{
                      top: 'xxlarge'
                    }}
                    spacing="large"
                  >
                    <Container width={280}>
                      <FormInput.Select
                        items={items}
                        name={'perspective'}
                        disabled={isEditMode || !!perspective}
                        label={getString('ce.perspectives.budgets.defineTarget.selectPerspective')}
                      />
                    </Container>
                    {!isEditMode && !perspective ? (
                      <Button
                        margin={{
                          top: 'large',
                          left: 'xlarge'
                        }}
                        loading={createViewLoading}
                        onClick={createNewPerspective}
                        text={getString('ce.perspectives.budgets.defineTarget.createNewPerspective')}
                        icon="plus"
                        variation={ButtonVariation.SECONDARY}
                      />
                    ) : null}
                  </Layout.Horizontal>
                </Container>
                <FlexExpander />
                <Container>
                  <Button
                    type="submit"
                    intent="primary"
                    rightIcon={'chevron-right'}
                    disabled={!formikProps.values.perspective || createViewLoading}
                  >
                    {getString('continue')}
                  </Button>
                </Container>
              </Container>
            </FormikForm>
          )
        }}
      </Formik>
    </Container>
  )
}

export default SelectPerspective
