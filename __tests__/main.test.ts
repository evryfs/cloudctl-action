import {run} from '../src/main'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {beforeEach} from 'jest-circus'

let inputs = {} as any

beforeAll(() => {
  inputs.apiEndpoint = 'someEndpoint'
  inputs.username = 'someUser'
  inputs.password = 'somePassword'
  inputs.namespace = 'someNamespace'

  jest.spyOn(exec, 'exec').mockImplementation(
    (): Promise<number> => {
      return Promise.resolve(0)
    }
  )

  jest.spyOn(core, 'getInput').mockImplementation((name: string): string => {
    return inputs[name]
  })
})

/*
beforeEach(() => {
  // Reset inputs
  inputs = {}
})
*/

test('test runs', async () => {
  await expect(run()).resolves.not.toThrow
})
