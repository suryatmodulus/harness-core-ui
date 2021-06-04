import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get, isEqual, flatMap } from 'lodash-es'
import {
  Layout,
  Text,
  Button,
  Container,
  Collapse,
  Formik,
  FormikForm as Form,
  FormInput,
  useModalHook
} from '@wings-software/uicore'
import { FieldArray } from 'formik'
import cx from 'classnames'
import { Menu, Dialog } from '@blueprintjs/core'
import type { IconName } from '@blueprintjs/core'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import {
  Feature,
  PatchFeatureQueryParams,
  Prerequisite,
  useGetAllFeatures,
  usePatchFeature,
  Variation
} from 'services/cf'
import patch from '../../utils/instructions'
import css from './FlagActivationDetails.module.scss'

const editCardCollapsedProps = {
  collapsedIcon: 'main-chevron-right' as IconName,
  expandedIcon: 'main-chevron-down' as IconName,
  isOpen: false,
  isRemovable: false,
  className: 'collapse'
}

interface FlagRerequisitesProps {
  featureFlag: Feature
  refetchFlag: () => void
}

interface PrerequisiteEntry {
  feature: string
  variation: string
}

export const FlagRerequisites: React.FC<FlagRerequisitesProps> = props => {
  const { featureFlag, refetchFlag } = props
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { orgIdentifier, accountId, projectIdentifier, environmentIdentifier } = useParams<Record<string, string>>()
  const [searchTerm, setSearchTerm] = useState<string>()
  const queryParams = useMemo(
    () => ({
      environment: environmentIdentifier !== 'undefined' ? environmentIdentifier : '',
      project: projectIdentifier as string,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      name: searchTerm
    }),
    [searchTerm]
  )
  const { data: searchedFeatures, loading, error, refetch: fetchFlags } = useGetAllFeatures({
    lazy: true,
    queryParams
  })
  const featureList = useMemo(() => {
    return searchedFeatures?.features?.filter(_feature => _feature.identifier !== featureFlag.identifier)
  }, [featureFlag.identifier, searchedFeatures?.features?.filter])
  const [isEditingPrerequisites, setEditingPrerequisites] = useState<boolean>(false)
  const { mutate: patchPrerequisites } = usePatchFeature({
    identifier: featureFlag.identifier as string,
    queryParams: {
      project: featureFlag.project as string,
      environment: featureFlag.envProperties?.environment as string,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier
    } as PatchFeatureQueryParams
  })
  const handlePrerequisiteInteraction = (action: 'edit' | 'delete', prereq: Prerequisite) => () => {
    if (action === 'delete') {
      patch.feature.addInstruction(patch.creators.removePrerequisite(prereq.feature))
      patch.feature.onPatchAvailable(data => {
        patchPrerequisites(data)
          .then(refetchFlag)
          .catch(err => {
            showError(get(err, 'data.message', err?.message), undefined, 'cf.patch.prereq.error')
          })
          .finally(patch.feature.reset)
      })
    } else {
      setEditingPrerequisites(true)
      openModalPrerequisites()
    }
  }

  const [openModalPrerequisites, hideModalPrerequisites] = useModalHook(() => {
    const initialPrereqValues = {
      prerequisites: flatMap(featureFlag.prerequisites, ({ feature, variations }) => {
        return variations.map(variation => ({ variation, feature } as PrerequisiteEntry))
      })
    }

    const handleAddPrerequisite = (prereqValues: typeof initialPrereqValues): void => {
      const validPreqs = prereqValues.prerequisites
        .reduce((acc, next) => {
          const prIndex = acc.findIndex(p => p.feature === next.feature)
          if (prIndex === -1) {
            acc.push({ feature: next.feature, variations: [next.variation] })
          } else {
            acc[prIndex].variations.push(next.variation)
          }
          return acc
        }, [] as Prerequisite[])
        .filter(({ feature, variations }) => Boolean(feature.length && variations.filter(x => x.length).length))
      const prerequisites = validPreqs
        .reduce((acc, prereq) => {
          const { feature, variations } = prereq
          const exists = acc.find(p => p.feature === feature)
          if (exists) {
            exists.variations = exists.variations.concat(variations)
            return acc
          } else {
            return [...acc, prereq]
          }
        }, [] as Prerequisite[])
        .map(p => ({ ...p, variations: p.variations.sort() } as Prerequisite))
        .sort((a, b) => a.feature.localeCompare(b.feature))

      const initialPrerequisites = featureFlag.prerequisites || []
      const removedPrerequisites = initialPrerequisites.filter(pr => !prerequisites.find(p => pr.feature === p.feature))
      const newPrerequisites = prerequisites.filter(p => !initialPrerequisites.find(pr => pr.feature === p.feature))
      const updatedPrequisites = prerequisites.filter(p =>
        initialPrerequisites.find(pr => pr.feature === p.feature && !isEqual(pr.variations, p.variations))
      )

      const instructions = [
        ...removedPrerequisites.map(p => patch.creators.removePrerequisite(p.feature)),
        ...newPrerequisites.map(patch.creators.addPrerequisite),
        ...updatedPrequisites.map(patch.creators.updatePrequisite)
      ]

      patch.feature.addAllInstructions(instructions)
      patch.feature
        .onPatchAvailable(data => {
          patchPrerequisites(data)
            .then(() => {
              hideModalPrerequisites()
              refetchFlag()
            })
            .catch(err => {
              showError(get(err, 'data.message', err?.message), undefined, 'cf.patch.req.error')
            })
            .finally(() => {
              patch.feature.reset()
            })
        })
        .onEmptyPatch(hideModalPrerequisites)
    }
    const title = isEditingPrerequisites
      ? getString('cf.addPrerequisites.editPrerequisitesHeading')
      : getString('cf.addPrerequisites.addPrerequisitesHeading')
    const updateSelect = (e: React.FormEvent<HTMLInputElement>): void => {
      const _searchTerm = (e?.target as HTMLInputElement)?.value || ''
      if (_searchTerm !== searchTerm) {
        setSearchTerm(_searchTerm)
        fetchFlags({ queryParams: { ...queryParams, name: _searchTerm } })
      }
    }
    const updateSelectFromVariation = (entry: PrerequisiteEntry): void => {
      setSearchTerm(entry.feature)
      fetchFlags({ queryParams: { ...queryParams, name: entry.feature } })
    }

    return (
      <Dialog title={title} onClose={hideModalPrerequisites} isOpen={true}>
        <Layout.Vertical padding={{ left: 'large', right: 'medium' }}>
          <Text margin={{ top: 'medium', bottom: 'xlarge' }}>
            {getString('cf.addPrerequisites.addPrerequisitesDesc')}
          </Text>
          {!loading && !error && (
            <Formik initialValues={initialPrereqValues} formName="flagRequisite" onSubmit={handleAddPrerequisite}>
              {formikProps => (
                <Form>
                  <FieldArray name="prerequisites">
                    {arrayHelpers => {
                      return (
                        <>
                          {formikProps.values.prerequisites.map((elem, i) => {
                            return (
                              <Layout.Horizontal flex key={`prereq-${i}`}>
                                <FormInput.Select
                                  name={`prerequisites.${i}.feature`}
                                  placeholder={getString('cf.addPrerequisites.selectFlag')}
                                  items={
                                    featureList?.map((flag: Feature) => ({
                                      label: flag.name,
                                      value: flag.identifier
                                    })) ||
                                    (formikProps?.values?.prerequisites[i]?.feature
                                      ? [
                                          {
                                            label: formikProps.values.prerequisites[i].feature,
                                            value: formikProps.values.prerequisites[i].feature
                                          }
                                        ]
                                      : [])
                                  }
                                  selectProps={{
                                    inputProps: {
                                      onFocus: updateSelect,
                                      onInput: updateSelect
                                    }
                                  }}
                                />
                                <FormInput.Select
                                  name={`prerequisites.${i}.variation`}
                                  placeholder={getString('cf.addPrerequisites.selectVariation')}
                                  items={
                                    featureList
                                      ?.find(ff => ff.identifier === elem.feature)
                                      ?.variations?.map((v: Variation) => ({
                                        label: v.name?.length ? v.name : v.identifier,
                                        value: v.identifier
                                      })) ||
                                    (formikProps?.values?.prerequisites[i]?.variation
                                      ? [
                                          {
                                            label: formikProps.values.prerequisites[i].variation,
                                            value: formikProps.values.prerequisites[i].variation
                                          }
                                        ]
                                      : [])
                                  }
                                  selectProps={{
                                    inputProps: {
                                      onFocus: () => updateSelectFromVariation(elem)
                                    }
                                  }}
                                />
                              </Layout.Horizontal>
                            )
                          })}
                          <Button
                            minimal
                            intent="primary"
                            text={getString('cf.shared.prerequisites')}
                            icon="small-plus"
                            onClick={() => {
                              arrayHelpers.push({ feature: '', variations: [''] })
                            }}
                          />
                        </>
                      )
                    }}
                  </FieldArray>
                  <Layout.Horizontal padding={{ top: 'large', bottom: 'large' }} border={{ bottom: true }}>
                    <Button text={getString('save')} intent="primary" margin={{ right: 'small' }} type="submit" />
                    <Button text={getString('cancel')} onClick={hideModalPrerequisites} />
                  </Layout.Horizontal>
                </Form>
              )}
            </Formik>
          )}
        </Layout.Vertical>
      </Dialog>
    )
  }, [featureList, isEditingPrerequisites])

  const prerequisitesTitle = (
    <Text
      style={{
        fontSize: '14px',
        color: '#22222A',
        fontWeight: 600,
        lineHeight: '20px',
        paddingLeft: 'var(--spacing-small)'
      }}
    >
      {getString('cf.shared.prerequisites')}
      <span style={{ fontSize: '12px', fontWeight: 400, display: 'inline-block', marginLeft: 'var(--spacing-xsmall)' }}>
        {getString('cf.featureFlags.prerequisitesDesc')}
      </span>
    </Text>
  )

  return (
    <Container className={cx(css.collapseFeatures, css.module)}>
      <Collapse {...editCardCollapsedProps} heading={prerequisitesTitle}>
        {!!featureFlag.prerequisites?.length && (
          <Layout.Horizontal flex margin={{ bottom: 'xsmall' }}>
            <Text width="50%">{getString('flag')}</Text>
            <Text width="50%">{getString('cf.shared.variation')}</Text>
          </Layout.Horizontal>
        )}
        <Layout.Vertical className={css.collapseFeaturesPrerequisites}>
          {Boolean(featureFlag.prerequisites?.length) &&
            featureFlag.prerequisites?.map((elem, i) => (
              <Layout.Horizontal key={i} flex padding="medium">
                <Text>{elem.feature}</Text>
                <Text>{elem.variations[0]}</Text>
                <Button
                  minimal
                  icon="Options"
                  style={{ marginLeft: 'auto' }}
                  tooltip={
                    <Menu style={{ minWidth: 'unset' }}>
                      <Menu.Item
                        icon="edit"
                        text={getString('edit')}
                        onClick={handlePrerequisiteInteraction('edit', elem)}
                        disabled={featureFlag.archived}
                      />
                      <Menu.Item
                        icon="cross"
                        text={getString('delete')}
                        onClick={handlePrerequisiteInteraction('delete', elem)}
                        disabled={featureFlag.archived}
                      />
                    </Menu>
                  }
                  tooltipProps={{ isDark: true, interactionKind: 'click' }}
                />
              </Layout.Horizontal>
            ))}
          <Button
            minimal
            intent="primary"
            icon="small-plus"
            text={getString('cf.shared.prerequisites')}
            onClick={() => {
              setEditingPrerequisites(false)
              openModalPrerequisites()
            }}
            disabled={featureFlag.archived}
          />
        </Layout.Vertical>
      </Collapse>
    </Container>
  )
}
