import React, { useCallback } from 'react'
import { Text, Formik, FormInput, Container, Color, ThumbnailSelect } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import type { ConnectorReferenceFieldProps } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  createCardOptions,
  createChangesourceList,
  validateChangeSource,
  getChangeSourceOptions,
  updateSpecByType,
  buildInitialData,
  preSelectChangeSourceConnectorOnCategoryChange
} from './ChangeSourceDrawer.utils'
import type { ChangeSoureDrawerInterface, UpdatedChangeSourceDTO } from './ChangeSourceDrawer.types'
import PageDutyChangeSource from './components/PagerDutyChangeSource/PagerDutyChangeSource'
import { ChangeSourceFieldNames, HARNESS_CD } from './ChangeSourceDrawer.constants'
import style from './ChangeSourceDrawer.module.scss'

export function ChangeSourceDrawer({
  isEdit,
  rowdata,
  tableData,
  onSuccess,
  hideDrawer
}: ChangeSoureDrawerInterface): JSX.Element {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const onSuccessWrapper = (data: UpdatedChangeSourceDTO): void => {
    data['spec'] = updateSpecByType(data)
    const updatedChangeSources = createChangesourceList(tableData, data)
    onSuccess(updatedChangeSources)
  }

  const renderChangeSource = useCallback(
    (formik: FormikProps<any>): React.ReactNode => {
      const changeSourceType = formik.values?.type as string
      if (!changeSourceType || changeSourceType === HARNESS_CD) return null
      let changeSource = null

      switch (changeSourceType) {
        case Connectors.PAGER_DUTY:
          changeSource = <PageDutyChangeSource formik={formik} />
          break
        default:
          changeSource = (
            <FormConnectorReferenceField
              width={400}
              formik={formik}
              type={changeSourceType as ConnectorReferenceFieldProps['type']}
              name={'spec.connectorRef'}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              placeholder={getString('cv.healthSource.connectors.selectConnector', {
                sourceType: formik?.values?.type
              })}
              label={
                <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                  {getString('connectors.selectConnector')}
                </Text>
              }
            />
          )
      }

      return (
        <CardWithOuterTitle title={getString('cv.changeSource.connectChangeSource')}>{changeSource}</CardWithOuterTitle>
      )
    },
    [accountId, orgIdentifier, projectIdentifier]
  )

  return (
    <Formik
      formName={'changeSourceaForm'}
      initialValues={rowdata?.category ? rowdata : buildInitialData()}
      onSubmit={onSuccessWrapper}
      validate={values => validateChangeSource(values, tableData, isEdit, getString)}
      enableReinitialize
    >
      {formik => {
        return (
          <>
            <CardWithOuterTitle title={getString('cv.changeSource.defineChangeSource')} className={style.outerCard}>
              <Text className={style.selectChangeSource}>{getString('cv.changeSource.selectChangeSource')}</Text>
              <Container margin={{ bottom: 'large' }} width="300px">
                <div className={style.alignHorizontal}>
                  <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                    {getString('connectors.docker.dockerProvideType')}
                  </Text>
                  <FormInput.Select
                    name={ChangeSourceFieldNames.CATEGORY}
                    disabled={isEdit}
                    items={getChangeSourceOptions(getString)}
                    onChange={categoryName =>
                      formik.setValues({
                        [ChangeSourceFieldNames.CATEGORY]: categoryName?.value || ('' as string),
                        [ChangeSourceFieldNames.TYPE]: preSelectChangeSourceConnectorOnCategoryChange(
                          categoryName?.value as string
                        ),
                        spec: {}
                      })
                    }
                  />
                </div>
                {formik.values?.category && (
                  <ThumbnailSelect
                    isReadonly={isEdit}
                    name={ChangeSourceFieldNames.TYPE}
                    items={createCardOptions(formik.values?.category, getString)}
                  />
                )}
              </Container>
              <hr className={style.divider} />
              <Container margin={{ bottom: 'large', top: 'large' }} color={Color.BLACK} width="400px">
                <FormInput.InputWithIdentifier
                  inputLabel={getString('cv.changeSource.sourceName')}
                  isIdentifierEditable={!isEdit}
                />
              </Container>
            </CardWithOuterTitle>
            {renderChangeSource(formik)}
            <DrawerFooter isSubmit onPrevious={hideDrawer} onNext={formik.submitForm} />
          </>
        )
      }}
    </Formik>
  )
}
