#! /usr/bin/env node

const fs = require('fs-extra')
const path = require('path')
const yaml = require('js-yaml')
const shell = require('shelljs')
const argv = require('yargs')
      .usage('Usage: $0 --repo [repo] --message [commit-message]')
      .demandOption(['repo'])
      .argv

const fullRepoUrl = (repoId) => {
  if (repoId.startsWith('git@github.com:') ||
      repoId.startsWith('http://github.com/') ||
      repoId.startsWith('https://github.com/')) {
    return repoId
  } else {
    return `https://github.com/${repoId}`
  }
}

const downloadRepo = (repoUrl) => {
  if (shell.exec(`git clone --depth 1 ${repoUrl} ./xclone`).code !== 0) {
    shell.echo(`Error in cloning ${repoUrl}`)
    shell.exit(1)
  }
  return './xclone'
}

const readConfig = (configFile) => {
  try {
    return yaml.safeLoad(fs.readFileSync(configFile, 'utf8'))
  } catch (e) {
    console.log(e)
    shell.exit(1)
  }
}

// ENTRY POINT
let repo = argv.repo
let message = argv.message || '[TRAVIS] Xpulled files from travis'

let config = readConfig('./xpull.yaml')
if (!(repo in config)) {
  console.log(`No config found for #{repo}`)
  shell.exit(1)
}

let localRepoPath = downloadRepo(fullRepoUrl(repo))
config[repo].forEach(pattern => {
  // src is relative to downloaded repo
  let src = path.join(localRepoPath, pattern[0])
  // Targe is relative to current repo root
  let target = pattern[1]
  fs.ensureDirSync(target)

  shell.cp('-RfL', src, target)
  console.log(`✓ Copied ${src}`)
  shell.exec(`git add ${target}`)
})

shell.exec(`git diff-index --quiet HEAD || git commit -m "${message}"`)

// Cleanup
shell.rm('-rf', localRepoPath)
