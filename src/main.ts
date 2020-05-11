import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'
import fs from 'fs'
import * as exec from '@actions/exec'

const STATE_FLAG = 'cloudctlLogin'

export async function run(): Promise<void> {
  if (isCleanupPhase()) {
    await exec.exec('cloudctl', ['logout'])
  } else {
    return downloadToolAndLogin()
  }
}

async function downloadToolAndLogin(): Promise<void> {
  try {
    const cloudCtl = await toolCache.downloadTool(
      `${core.getInput('apiEndpoint', {
        required: true
      })}/api/cli/cloudctl-linux-amd64`
    )
    fs.chmodSync(cloudCtl, 0o555)
    const cachedPath = await toolCache.cacheFile(
      cloudCtl,
      'cloudctl',
      'cloudctl',
      'latest'
    )
    core.addPath(cachedPath)
    await exec
      .exec('cloudctl', [
        'login',
        '-a',
        core.getInput('apiEndpoint', {required: true}),
        '-u',
        core.getInput('username', {required: true}),
        '-p',
        core.getInput('password', {required: true}),
        '-n',
        core.getInput('namespace', {required: true})
      ])
      .then(() => core.saveState(STATE_FLAG, 'true'))
  } catch (error) {
    core.setFailed(error.message)
  }
}

function isCleanupPhase(): boolean {
  return core.getState(STATE_FLAG).length > 0
}

run()
