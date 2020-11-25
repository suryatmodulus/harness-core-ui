import {
  default as patch,
  shape,
  unaryInstructionCreator,
  binaryInstructionCreator,
  ternaryInstructionCreator
} from './instructions'

describe('patch instructions', () => {
  describe('instruction creators', () => {
    test('shape return a function that creates an object with specified keys and values by arg order', () => {
      const ABShape = shape('a', 'b')
      expect(ABShape(1, 2)).toStrictEqual({ a: 1, b: 2 })
    })

    test('unaryInstructionCreator returns a proper unary instruction creator', () => {
      const mockIns = unaryInstructionCreator('updateName', shape('attr'))
      expect(mockIns(42)).toStrictEqual({ kind: 'updateName', parameters: { attr: 42 } })
    })

    test('binaryInstructionCreator returns a proper binary instruction creator', () => {
      const mockIns = binaryInstructionCreator('updateName', shape('a', 'b'))
      expect(mockIns(1, 2)).toStrictEqual({ kind: 'updateName', parameters: { a: 1, b: 2 } })
    })

    test('ternaryInstructionCreator returns a proper ternary instruction creator', () => {
      const mockIns = ternaryInstructionCreator('updateName', shape('a', 'b', 'c'))
      expect(mockIns(1, 2, 3)).toStrictEqual({ kind: 'updateName', parameters: { a: 1, b: 2, c: 3 } })
    })
  })

  describe('FeatureSemanticPatch', () => {
    const nameIns = patch.creators.updateName('name')
    beforeEach(() => patch.feature.reset())

    test('should add instruction', () => {
      patch.feature.addInstruction(nameIns)
      expect(patch.feature.toPatchOperation()).toStrictEqual({
        instructions: [nameIns]
      })
    })

    test('should add a collection of instructions', () => {
      patch.feature.addAllInstructions([nameIns, nameIns])
      expect(patch.feature.toPatchOperation()).toStrictEqual({
        instructions: [nameIns, nameIns]
      })
    })

    test('should remove all instructions on reset', () => {
      patch.feature.addInstruction(nameIns)
      patch.feature.reset()
      expect(patch.feature.toPatchOperation()).toStrictEqual({
        instructions: []
      })
    })

    test('should return instructions as JSON', () => {
      patch.feature.addInstruction(nameIns)
      expect(patch.feature.toPatchOperation()).toStrictEqual({ instructions: [nameIns] })
    })

    test('onPatchAvailable should run callback and return this on non-empty instruction set', () => {
      patch.feature.addInstruction(nameIns)
      const callback = jest.fn()
      const ret = patch.feature.onPatchAvailable(callback)
      expect(ret).toBe(patch.feature)
      expect(callback).toHaveBeenCalled()
      expect(callback).toHaveBeenCalledWith(patch.feature.toPatchOperation())
    })

    test('onPatchAvailable should return this on empty instruction set', () => {
      const callback = jest.fn()
      const ret = patch.feature.onPatchAvailable(callback)
      expect(ret).toBe(patch.feature)
      expect(callback).not.toHaveBeenCalled()
    })

    test('onEmptyPatch should return this on non-empty instruction set', () => {
      patch.feature.addInstruction(nameIns)
      const callback = jest.fn()
      const ret = patch.feature.onEmptyPatch(callback)
      expect(ret).toBe(patch.feature)
      expect(callback).not.toHaveBeenCalled()
    })

    test('onEmptyPatch should run callback and return this on empty instruction set', () => {
      const callback = jest.fn()
      const ret = patch.feature.onEmptyPatch(callback)
      expect(ret).toBe(patch.feature)
      expect(callback).toHaveBeenCalled()
    })
  })
})
