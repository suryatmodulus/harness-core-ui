import React from 'react'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import produce from 'immer'
import * as Yup from 'yup'
import { Icon, Accordion, Tag, Text, Formik } from '@wings-software/uicore'
import { set, debounce, cloneDeep } from 'lodash-es'
import { FieldArray } from 'formik'
import { Tooltip } from '@blueprintjs/core'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { String, useStrings } from 'framework/strings'
import type { UseStringsReturn } from 'framework/strings'
import { useGetBarriersSetupInfoList, StageDetail } from 'services/pipeline-ng'
import { useMutateAsGet } from '@common/hooks'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import css from './FlowControl.module.scss'

const getErrors = (barriers: Barrier[], getString: UseStringsReturn['getString']): Barrier[] => {
  const errors: unknown[] = []
  const barrierValueMap: { [key: string]: { indexes: number[] } } = {}
  for (let index = 0; index < barriers.length; index++) {
    const barrierId = barriers[index].identifier
    if (barrierValueMap[barrierId]) {
      barrierValueMap[barrierId].indexes.push(index)
    } else {
      barrierValueMap[barrierId] = { indexes: barrierId === '' ? [index] : [] }
    }
  }
  Object.values(barrierValueMap).map(({ indexes }: { indexes: number[] }) => {
    indexes.map((errIndex: number) => {
      if (barriers[errIndex].identifier === '') {
        set(errors, `[${errIndex}].name`, getString('secret.validationIdentifier'))
      } else {
        set(errors, `[${errIndex}].name`, getString('common.duplicateId'))
      }
    })
  })
  return errors as Barrier[]
}

const getValidBarriers = (barriers: Barrier[]): Barrier[] =>
  barriers.filter(barrier => barrier.identifier.length > 0 && barrier.name.length > 0)

interface Barrier {
  identifier: string
  name: string
  id?: string
  mode?: 'ADD' | 'EDIT' | null
  stages?: StageDetail[]
}
interface BarrierListProps {
  list: Array<Barrier>
  pipeline: PipelineInfoConfig
  createItem: (push: (data: Barrier) => void) => void
  deleteItem: (index: number, remove: (a: number) => void) => void
  commitItem: (data: Barrier, index: number) => void
  updatePipeline: (pipeline: PipelineInfoConfig) => Promise<void>
  getString: UseStringsReturn['getString']
  loadingSetupInfo: boolean
}
export const FlowControl: React.FC = (): JSX.Element => {
  const {
    state: { pipeline, originalPipeline },
    updatePipeline
  } = React.useContext(PipelineContext)
  const [barriers, updateBarriers] = React.useState<Barrier[]>(pipeline?.flowControl?.barriers || [])
  const { data, loading: loadingSetupInfo } = useMutateAsGet(useGetBarriersSetupInfoList, {
    body: yamlStringify({ pipeline: originalPipeline }) as unknown as void,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    },
    debounce: 800
  })
  React.useEffect(() => {
    if (data?.data) {
      const barrierInfoList = data?.data
      const newBarriers = cloneDeep(barriers)
      barrierInfoList.forEach(barrierInfo => {
        if (!barrierInfo.stages?.length) {
          return
        }
        const matchingIndex = newBarriers.findIndex(brr => brr.identifier === barrierInfo.identifier)
        if (matchingIndex > -1) {
          newBarriers[matchingIndex].stages = barrierInfo.stages
        }
      })
      updateBarriers(newBarriers)
    }
  }, [data?.data])

  const debouncedUpdatePipeline = React.useCallback(debounce(updatePipeline, 300), [updatePipeline])
  const addBarrier = (push: (data: Barrier) => void): void => {
    const newBarrier: Barrier = {
      name: '',
      identifier: '',
      id: uuid('', nameSpace()),
      mode: 'ADD'
    }
    const updatedState: Barrier[] = [...barriers, newBarrier]
    push(newBarrier)
    updateBarriers(updatedState)
  }

  const commitBarrier = (barrierData: Barrier, index: number): void => {
    if (!barrierData?.name?.length || !barrierData?.identifier?.length) {
      return
    }
    const updatedBarriers: Barrier[] = produce(barriers, draft => {
      draft[index] = {
        ...barrierData,
        mode: null
      }
    })
    updateBarriers(updatedBarriers)
    const validBarriers = getValidBarriers(updatedBarriers)
    debouncedUpdatePipeline({
      ...pipeline,
      flowControl: {
        barriers: validBarriers.map(barrier => ({
          name: barrier.name,
          identifier: barrier.identifier
        }))
      }
    })
  }

  const deleteBarrier = (index: number, remove: (index: number) => void): void => {
    if (barriers[index]?.stages?.length) return
    const updatedBarriers: Barrier[] = produce(barriers, draft => {
      draft.splice(index, 1)
    })
    updateBarriers(updatedBarriers)
    remove(index)
    debouncedUpdatePipeline({
      ...pipeline,
      flowControl: {
        barriers: barriers.map(barrier => ({
          name: barrier.name,
          identifier: barrier.identifier
        }))
      }
    })
  }

  const { getString } = useStrings()
  return (
    <div className={css.container}>
      <div className={css.header}>
        <Icon name="settings" size={14} className={css.headerIcon} />

        <div className={css.gridColumn}>
          <String stringID="pipeline.barriers.flowControl" className={css.title} />
          <span>
            {getString('total')} : {barriers.length}
          </span>
        </div>
      </div>
      <div>
        <Accordion activeId="syncBarriers">
          <Accordion.Panel
            id="syncBarriers"
            summary={getString('pipeline.barriers.syncBarriers')}
            details={
              <BarrierList
                list={barriers}
                pipeline={pipeline}
                createItem={addBarrier}
                deleteItem={deleteBarrier}
                commitItem={commitBarrier}
                updatePipeline={debouncedUpdatePipeline}
                getString={getString}
                loadingSetupInfo={loadingSetupInfo}
              />
            }
          />
        </Accordion>
      </div>
    </div>
  )
}

const BarrierList: React.FC<BarrierListProps> = ({
  list,
  createItem,
  deleteItem,
  commitItem,
  updatePipeline,
  getString,
  loadingSetupInfo,
  pipeline
}): JSX.Element => {
  return (
    <Formik
      initialValues={{ barriers: list }}
      onSubmit={value => {
        console.log(value) //eslint-disable-line
      }}
      formName="flowControl"
      validate={({ barriers }: { barriers: Barrier[] }) => {
        const errors: any = { barriers: [] }
        const identifierErrors = getErrors(barriers, getString)
        const validBarriers = getValidBarriers(barriers)
        if (identifierErrors.length) {
          errors.barriers = identifierErrors
        } else {
          updatePipeline({
            ...pipeline,
            flowControl: {
              barriers: validBarriers.map(barrier => ({
                name: barrier.name,
                identifier: barrier.identifier
              }))
            }
          })
        }
        return errors
      }}
      validationSchema={Yup.object().shape({
        barriers: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().required(getString('pipeline.barriers.validation.barrierNamerequired')),
            identifier: Yup.string().min(1).required(getString('common.duplicateId'))
          })
        )
      })}
    >
      {formik => (
        <FieldArray
          name="barriers"
          render={({ push, remove }) => {
            return (
              <div>
                <div className={css.barrierList}>
                  {list.map((barrier: Barrier, index) =>
                    !barrier.mode ? (
                      <div className={css.rowItem} key={barrier.id}>
                        <div>
                          <Text lineClamp={1} className={css.rowHeader}>
                            {barrier.name}
                          </Text>
                          <Text lineClamp={1}>{barrier.identifier}</Text>
                        </div>
                        <div>
                          {barrier.stages?.map((stage: StageDetail) => (
                            <Tag className={cx(css.tag, css.spaceRight)} key={stage.name}>
                              <Text lineClamp={1} width={50}>
                                {stage.name}
                              </Text>
                            </Tag>
                          ))}
                        </div>
                        <div>
                          <Tooltip
                            content={
                              barrier.stages?.length
                                ? 'Deleting this barrier is not allowed as it is being used in one or more stages'
                                : ''
                            }
                          >
                            <Icon
                              name="main-trash"
                              size={20}
                              className={cx(css.deleteIcon, {
                                [css.disabledIcon]: loadingSetupInfo || barrier.stages?.length
                              })}
                              onClick={() => deleteItem(index, remove)}
                            />
                          </Tooltip>
                        </div>
                      </div>
                    ) : (
                      <div className={css.rowItem} key={barrier.id}>
                        <div className={css.newBarrier}>
                          {barrier.name} <br />
                          <NameId
                            nameLabel="Barrier Name"
                            identifierProps={{
                              inputName: `barriers[${index}].name`,
                              idName: `barriers[${index}].identifier`,
                              inputGroupProps: {
                                inputGroup: {
                                  onBlur: () =>
                                    !formik.errors?.barriers?.[index] &&
                                    commitItem(formik.values.barriers[index], index)
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Icon
                            name="bin-main"
                            size={20}
                            className={css.deleteIcon}
                            onClick={() => deleteItem(index, remove)}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
                <span className={css.addLink} onClick={() => createItem(push)}>
                  <String stringID="pipeline.barriers.addBarrier" />
                </span>
              </div>
            )
          }}
        />
      )}
    </Formik>
  )
}
