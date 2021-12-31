import {
  Layout,
  FormInput,
  MultiTypeInputType,
  ButtonVariation,
  Text,
  Button,
  Icon,
  ButtonSize
} from '@wings-software/uicore'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import React, { useCallback } from 'react'
import { v4 as nameSpace, v5 as uuid } from 'uuid'

import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'
import { useStrings } from 'framework/strings'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'

import { ManifestDataType } from './Manifesthelper'
import css from './ManifestWizardSteps/ManifestDetails/ManifestDetails.module.scss'

const defaultValueToReset = [{ path: '', uuid: uuid('', nameSpace()) }]
const DragnDropPaths: React.FC<{
  formik: any
  expressions: any
  allowableTypes: MultiTypeInputType[]
  selectedManifest?: string | null
  pathLabel?: string | null
}> = ({ formik, selectedManifest, expressions, allowableTypes, pathLabel }) => {
  const { getString } = useStrings()
  const onDragStart = useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEnd = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore else */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore else */
      if (data) {
        const index = parseInt(data, 10)
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )

  return (
    <DragDropContext
      onDragEnd={(result: DropResult) => {
        if (!result.destination) {
          return
        }
        const res = Array.from(formik.values.paths)
        const [removed] = res.splice(result.source.index, 1)
        res.splice(result.destination.index, 0, removed)
        formik.setFieldValue('paths', res as any)
      }}
    >
      <Droppable droppableId="droppable">
        {(provided, _snapshot) => (
          <div className={css.halfWidth} {...provided.droppableProps} ref={provided.innerRef}>
            <MultiTypeFieldSelector
              defaultValueToReset={defaultValueToReset}
              allowedTypes={allowableTypes.filter(allowedType => allowedType !== MultiTypeInputType.EXPRESSION)}
              name={'paths'}
              label={
                <Text>
                  {pathLabel
                    ? pathLabel
                    : selectedManifest === ManifestDataType.K8sManifest
                    ? getString('fileFolderPathText')
                    : getString('common.git.filePath')}
                </Text>
              }
            >
              <FieldArray
                name="paths"
                render={arrayHelpers => (
                  <Layout.Vertical>
                    {formik.values?.paths?.map((path: { path: string; uuid: string }, index: number) => (
                      <Draggable key={index} draggableId={path.path} index={index}>
                        {providedDrag => (
                          <Layout.Horizontal
                            key={path.uuid}
                            flex={{ distribution: 'space-between' }}
                            style={{ alignItems: 'end' }}
                            ref={providedDrag.innerRef}
                            {...providedDrag.draggableProps}
                            {...providedDrag.dragHandleProps}
                          >
                            <Layout.Horizontal
                              spacing="medium"
                              style={{ alignItems: 'baseline' }}
                              draggable={true}
                              onDragStart={event => {
                                onDragStart(event, index)
                              }}
                              onDragEnd={onDragEnd}
                              onDragOver={onDragOver}
                              onDragLeave={onDragLeave}
                              onDrop={event => onDrop(event, arrayHelpers, index)}
                            >
                              <Icon name="drag-handle-vertical" className={css.drag} />
                              <Text width={12}>{`${index + 1}.`}</Text>
                              <FormInput.MultiTextInput
                                label={''}
                                placeholder={
                                  selectedManifest === ManifestDataType.K8sManifest
                                    ? getString('pipeline.manifestType.manifestPathPlaceholder')
                                    : getString('pipeline.manifestType.pathPlaceholder')
                                }
                                name={`paths[${index}].path`}
                                style={{ width: 275 }}
                                multiTextInputProps={{
                                  expressions,
                                  allowableTypes: allowableTypes.filter(
                                    allowedType => allowedType !== MultiTypeInputType.RUNTIME
                                  )
                                }}
                              />
                            </Layout.Horizontal>
                            {formik.values?.paths?.length > 1 && (
                              <Button minimal icon="main-trash" onClick={() => arrayHelpers.remove(index)} />
                            )}
                          </Layout.Horizontal>
                        )}
                      </Draggable>
                    ))}
                    <span>
                      <Button
                        text={getString('addFileText')}
                        icon="plus"
                        size={ButtonSize.SMALL}
                        variation={ButtonVariation.LINK}
                        className={css.addFileButton}
                        onClick={() => arrayHelpers.push({ path: '', uuid: uuid('', nameSpace()) })}
                      />
                    </span>
                  </Layout.Vertical>
                )}
              />
            </MultiTypeFieldSelector>
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}

export default DragnDropPaths
