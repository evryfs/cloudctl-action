import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'
import fs from 'fs'
import * as exec from '@actions/exec'

const STATE_FLAG = 'cloudctlLogin'

export async function run(): Promise<void> {
  if (isCleanupPhase()) {
    await exec.exec('cloudctl', ['logout'])
    if (core.getState('context').length > 0) {
      await exec.exec('kubectl', [
        'config',
        'delete-context',
        core.getState('context')
      ])
      await exec.exec('kubectl', ['config', 'unset', 'current-context'])
    }
  } else {
    if (core.getInput('installKubectl', {required: true}) === 'true') {
      await downloadTool('kubectl')
    }
    await downloadTool('cloudctl')
    return cloudctlLogin()
  }
}

async function downloadTool(tool: string): Promise<void> {
  try {
    const download = await toolCache.downloadTool(
      `${core.getInput('apiEndpoint', {
        required: true
      })}/api/cli/${tool}-linux-amd64`
    )
    fs.chmodSync(download, 0o555)
    const cachedPath = await toolCache.cacheFile(download, tool, tool, 'latest')
    core.addPath(cachedPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function cloudctlLogin(): Promise<void> {
  try {
    await exec
      .exec(
        'cloudctl',
        [
          'login',
          '-a',
          core.getInput('apiEndpoint', {required: true}),
          '-u',
          core.getInput('username', {required: true}),
          '-p',
          core.getInput('password', {required: true}),
          '-n',
          core.getInput('namespace', {required: true})
        ],
        {
          listeners: {
            stdline: (data: string) => {
              const match = data.match(/Context "(?<context>.*)" created./)
              if (match?.groups) {
                const context = match.groups['context']
                core.saveState('context', context)
              }
            }
          }
        }
      )
      .then(() => core.saveState(STATE_FLAG, 'true'))
  } catch (error) {
    core.setFailed(error.message)
  }
}

function isCleanupPhase(): boolean {
  return core.getState(STATE_FLAG).length > 0
}

run()
