import React from 'react'
import type { DetailedReactHTMLElement } from 'react'
import type { Diagnostic } from 'vscode-languageserver-types'
import { parse } from 'yaml'

import { findLeafToParentPath } from '../../utils/YamlUtils'

/**
 * Get YAML from editor with placeholder added at current position in editor
 * @param editor
 * @param shouldAddPlaceholder whether to add a placeholder at current position in editor during yaml->json conversion
 */
const getYAMLFromEditor = (editor: any, shouldAddPlaceholder: boolean, cropToCursor = false): string | null => {
  const currentPositionInEditor = editor?.getPosition()
  if (currentPositionInEditor) {
    const textInCurrentEditor = editor?.getValue()?.trim(),
      currentLineNumber = currentPositionInEditor.lineNumber,
      textInCurrentEditorArr = textInCurrentEditor?.split('\n'),
      textFirstPartArr = textInCurrentEditorArr.slice(0, currentLineNumber),
      textSecondPart = textInCurrentEditorArr.slice(currentLineNumber),
      currentLineContent = textFirstPartArr?.[currentLineNumber - 1]
    const lengthOfCurrentText = textInCurrentEditor?.length
    if (lengthOfCurrentText > 0) {
      let textToInsert = ''
      if (shouldAddPlaceholder) {
        textToInsert = textInCurrentEditor[lengthOfCurrentText - 1] === ':' ? '' : ': ' + 'placeholder'
      }
      textFirstPartArr[currentLineNumber - 1] = [
        currentLineContent?.slice(0, currentPositionInEditor.column - 1),
        textToInsert,
        currentLineContent?.slice(currentPositionInEditor.column - 1)
      ].join('')
      editor.setPosition(currentPositionInEditor)
      const secondPart = cropToCursor ? '' : '\n' + textSecondPart.join('\n')
      return textFirstPartArr.join('\n') + secondPart
    }
  }
  return null
}

function getJSONFromYAML(yaml: string): Record<string, any> {
  try {
    return parse(yaml)
  } catch (error) {
    throw error
  }
}

/**
 * Get current property to parent json path
 * @param editor
 * @param shouldAddPlaceholder
 */
const getMetaDataForKeyboardEventProcessing = (
  editor: any,
  shouldAddPlaceholder: boolean = false
): Record<string, string | undefined> | undefined => {
  const yamlInEditor = getYAMLFromEditor(editor, shouldAddPlaceholder, true)
  if (yamlInEditor) {
    const jsonEquivalentOfYAMLInEditor = getJSONFromYAML(yamlInEditor)
    const textInCurrentEditorLine = editor.getModel()?.getLineContent(editor.getPosition().lineNumber)
    const currentProperty = textInCurrentEditorLine?.split(':').map((item: string) => item.trim())[0]
    const parentToCurrentPropertyPath = findLeafToParentPath(jsonEquivalentOfYAMLInEditor, currentProperty)
    return { currentProperty, yamlInEditor, parentToCurrentPropertyPath }
  }
}

/**
 * Get mapping of json path of a property to all errors on the value at that property
 * @param currentYaml
 * @param validationErrors
 * @param editor
 */
const getYAMLValidationErrors = (validationErrors: Diagnostic[]): Map<number, string> => {
  const errorMap = new Map<number, string>()
  validationErrors.forEach(valError => {
    const errorIndex = valError?.range?.end?.line
    errorMap.set(errorIndex, valError?.message)
  })
  return errorMap
}

/**
 * Get formatted HTML of list items
 * @param errorMap yaml path to validation error map
 */
const getValidationErrorMessagesForToaster = (
  errorMap: Map<string, string[]>
): DetailedReactHTMLElement<{ id: string }, HTMLElement> => {
  const errorRenderItemList: JSX.Element[] = []
  errorMap?.forEach((values: string[], key: string) => {
    errorRenderItemList.push(
      <li key={key}>
        In{' '}
        <b>
          <i>{key}</i>
        </b>
        , {values?.map((value: string) => value.charAt(0).toLowerCase() + value.slice(1))?.join(', ')}
      </li>
    )
  })
  return React.createElement('ul', { id: 'ul-errors' }, errorRenderItemList)
}

export {
  getYAMLFromEditor,
  getMetaDataForKeyboardEventProcessing,
  getYAMLValidationErrors,
  getValidationErrorMessagesForToaster
}
