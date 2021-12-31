import React from 'react'
import { Text, FontVariation, Label, Layout, TextInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import css from './RunPipelineForm.module.scss'
interface ReplacedExpressionInputFormProps {
  expressions?: string[]
  updateExpressionValue: React.FormEventHandler<HTMLElement>
}
const ReplacedExpressionInputForm = ({
  expressions = [],
  updateExpressionValue
}: ReplacedExpressionInputFormProps): React.ReactElement | null => {
  const { getString } = useStrings()

  return expressions.length > 0 ? (
    <Layout.Vertical className={css.replaceExpressionForm}>
      <Text
        font={{
          variation: FontVariation.FORM_TITLE
        }}
      >
        {getString('pipeline.replacedExpressions')}
      </Text>

      <div className={css.form}>
        {expressions?.map((exprName: string) => (
          <Layout.Vertical key={exprName}>
            <Label>
              <Text width={300} lineClamp={1}>
                {exprName}
              </Text>
            </Label>
            <TextInput name={exprName} onChange={updateExpressionValue} />
          </Layout.Vertical>
        ))}
      </div>
    </Layout.Vertical>
  ) : null
}
export default ReplacedExpressionInputForm
