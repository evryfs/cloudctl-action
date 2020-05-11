# Cloudctl action

This action installs `cloudctl` and optionally `kubectl` and logs into the cluster.

## Usage

```yaml
- name: Setup cloudctl
  uses: evryfs/cloudctl-action@master
  with:
    apiEndpoint: https://your.cluster.endpoint:8443
    namespace: your-namespace
    username: someUser
    password: somePassword
    installKubectl: true # default true, install kubectl from ICP
```