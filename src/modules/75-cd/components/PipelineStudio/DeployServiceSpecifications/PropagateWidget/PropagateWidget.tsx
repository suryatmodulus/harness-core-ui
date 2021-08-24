import React from 'react'
import {
  FormInput,
  SelectOption,
  Layout,
  RadioButton,
  Container,
  Color,
  HarnessDocTooltip
} from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import isEmpty from 'lodash/isEmpty'
import { useStrings } from 'framework/strings'
import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { DeployTabs } from '@cd/components/PipelineStudio/DeployStageSetupShell/DeployStageSetupShellUtils'
import css from './PropagateWidget.module.scss'

export const setupMode = {
  PROPAGATE: 'PROPAGATE',
  DIFFERENT: 'DIFFERENT'
}

export interface PropagateWidgetProps {
  setupModeType: string
  isReadonly: boolean
  previousStageList: SelectOption[]
  selectedPropagatedState: SelectOption | undefined
  initWithServiceDefinition: () => void
  setSetupMode: (setupModeType: string) => void
  setSelectedPropagatedState: (item: SelectOption) => void
}

export default function PropagateWidget(props: PropagateWidgetProps): JSX.Element {
  const {
    setupModeType,
    isReadonly,
    previousStageList,
    selectedPropagatedState,
    initWithServiceDefinition,
    setSetupMode,
    setSelectedPropagatedState
  } = props
  const { getString } = useStrings()
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)
  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)

  React.useEffect(() => {
    subscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
    return () => unSubscribeForm({ tab: DeployTabs.SERVICE, form: formikRef })
  }, [])

  return (
    <Formik<{ setupModeType: string; selectedPropagatedState: SelectOption | undefined }>
      onSubmit={noop}
      validationSchema={Yup.object().shape({
        selectedPropagatedState: Yup.object().when('setupModeType', {
          is: setupMode.PROPAGATE,
          then: Yup.object().test(
            'selectedPropagatedState',
            getString('cd.pipelineSteps.serviceTab.propagateStage'),
            propagatedState => !isEmpty(propagatedState.value)
          )
        })
      })}
      initialValues={{
        setupModeType: setupModeType,
        selectedPropagatedState: selectedPropagatedState
      }}
      enableReinitialize
    >
      {formik => {
        window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.SERVICE }))
        formikRef.current = formik
        const { values } = formik
        return (
          <Container>
            <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing={'xxxlarge'}>
              <section
                onClick={() => !isReadonly && setSetupMode(setupMode.PROPAGATE)}
                className={css.stageSelectionGrid}
              >
                <Layout.Horizontal flex spacing={'medium'}>
                  <RadioButton
                    color={Color.GREY_500}
                    font={{ weight: 'semi-bold' }}
                    label={'Propagate from:'}
                    checked={values.setupModeType === setupMode.PROPAGATE}
                    style={{ flexShrink: 0 }}
                  />
                  <FormInput.Select
                    className={css.stageSelectDropDown}
                    name={'selectedPropagatedState'}
                    placeholder={getString('pipeline.selectStagePlaceholder')}
                    disabled={values.setupModeType === setupMode.DIFFERENT || isReadonly}
                    onChange={value => {
                      formik.setFieldValue('selectedPropagatedState', value)
                      setSelectedPropagatedState(value)
                    }}
                    value={values.selectedPropagatedState}
                    items={previousStageList}
                  />
                  <span data-tooltip-id="selectPropagatedState" />
                  <HarnessDocTooltip useStandAlone={true} tooltipId="selectPropagatedState" />
                </Layout.Horizontal>
              </section>

              <section onClick={() => !isReadonly && initWithServiceDefinition()} className={css.stageSelectionGrid}>
                <RadioButton
                  color={Color.GREY_500}
                  font={{ weight: 'semi-bold' }}
                  label={getString('cd.pipelineSteps.serviceTab.differentService')}
                  checked={values.setupModeType === setupMode.DIFFERENT}
                />
              </section>
            </Layout.Horizontal>
          </Container>
        )
      }}
    </Formik>
  )
}
