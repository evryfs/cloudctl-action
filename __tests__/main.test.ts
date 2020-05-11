import {run} from '../src/main'
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {beforeEach} from 'jest-circus'
import * as toolcache from '@actions/tool-cache'

let inputs = {} as any

beforeAll(() => {
  inputs.apiEndpoint = 'someEndpoint'
  inputs.username = 'someUser'
  inputs.password = 'somePassword'
  inputs.namespace = 'someNamespace'
  inputs.downloadKubectl = 'true'

  process.env.RUNNER_TEMP = '/tmp'

  jest.spyOn(exec, 'exec').mockImplementation(
    (): Promise<number> => {
      return Promise.resolve(0)
    }
  )

  jest.spyOn(toolcache, 'downloadTool').mockImplementation(
    (): Promise<string> => {
      return Promise.resolve('somefile')
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
