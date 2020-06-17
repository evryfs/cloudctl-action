import * as core from '@actions/core'
import * as toolCache from '@actions/tool-cache'
import fs from 'fs'
import * as exec from '@actions/exec'
import * as io from '@actions/io'
import * as os from 'os'

const STATE_FLAG = 'cloudctlLogin'
const KUBE_CONFIG_BACKUP = `${os.tmpdir()}/kubeconfig.cloudctl.bak`
const KUBE_CONFIG_FILE = `${os.homedir()}/.kube/config`

export async function run(): Promise<void> {
  if (isCleanupPhase()) {
    await exec.exec('cloudctl', ['logout'])
    await restoreKubeConfig()
  } else {
    if (core.getInput('installKubectl', {required: true}) === 'true') {
      await downloadTool('kubectl')
    }
    await downloadTool('cloudctl')
    return cloudctlLogin()
  }
}

async function restoreKubeConfig(): Promise<void> {
  await io.rmRF(KUBE_CONFIG_FILE)
  if (fs.existsSync(KUBE_CONFIG_BACKUP)) {
    await io.mv(KUBE_CONFIG_BACKUP, KUBE_CONFIG_FILE)
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

async function backupConfig(): Promise<void> {
  if (fs.existsSync(KUBE_CONFIG_FILE)) {
    await io.cp(KUBE_CONFIG_FILE, KUBE_CONFIG_BACKUP)
  }
}

async function cloudctlLogin(): Promise<void> {
  try {
    await backupConfig()
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
