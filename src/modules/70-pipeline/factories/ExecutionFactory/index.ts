import { DefaultView } from '@pipeline/components/execution/StepDetails/views/DefaultView/DefaultView'
import { DefaultConsoleViewStepDetails } from '@pipeline/components/LogsContent/LogsContent'
import { ExecutionFactory } from './ExecutionFactory'

const factory = new ExecutionFactory({
  defaultStepDetails: {
    component: DefaultView
  },
  defaultConsoleViewStepDetails: {
    component: DefaultConsoleViewStepDetails
  }
})

export default factory
