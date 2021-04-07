## Steps

Once you create the step, register it with the steps factory.

Following view types needs to be supported for each step:

- InputSet/DeploymentForm - Input Set view which is visible, it should also support readonly view
- Edit View - Edit Pipeline view
- Variable view - Variable view of the same step
- Yaml Support

Properties to define for each step based on different view type:

#### All Steps views

- Step Type
- default values
- isHarnessSpecific - Is this specific for harness? check with PM to get this value
- \_hasDelegateSelectionVisible: In constructor set the value to true if the step support delegate selector in advanced view

#### Edit View

- Step Pallet kind [which are visible in add step]

  - stepPaletteVisible = true
  - use `React.forwardRef` and set formik ref for step
  - icon
  - name
  - processFormData: Define in every step if you want post process data
  - isNewStep: will tell you if its an new step and is it allowed to change identifier or not

- Other Steps
  - stepPaletteVisible = false

#### InputSet/DeploymentForm View

- validateInputSet - method to validate the input set data and return errors in the formik errors object
- readonly support - All fields should be readonly support
- Step should show only fields which are runtime input

#### Variable View

You can use <VariablesListTable /> component to render variable list view but make sure to pass flattened object individually

- \_hasStepVariables - set the value to true under constructor if variable view is written for this.

#### Yaml Support

- Set invocationMap in constructor of the step if you have fields which requires an API call Example [DeployEnvStep](https://github.com/wings-software/nextgenui/blob/df7ee50d888785d5341cdf7dad67904d004b4757/src/modules/75-cd/components/PipelineSteps/DeployEnvStep/DeployEnvStep.tsx#L401)
