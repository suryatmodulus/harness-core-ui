import { DefaultView } from '@pipeline/components/execution/StepDetails/views/DefaultView/DefaultView'
import { ExecutionFactory } from './ExecutionFactory'

const factory = new ExecutionFactory()

factory.registerDefaultStepDetails({
  component: DefaultView
})

export default factory
