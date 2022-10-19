// Copyright 2022 D2iQ, Inc. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as core from "@actions/core"
import { exec } from "child_process"
import * as path from "path"
import { promisify } from "util"

import { installMindthegap } from "./install"
import { findMindthegapVersion } from "./version"

const execShellCommand = promisify(exec)

async function prepareMindthegap(): Promise<string> {
  const versionConfig = await findMindthegapVersion()
  return await installMindthegap(versionConfig)
}

type Env = {
  mindthegapPath: string
}

async function prepareEnv(): Promise<Env> {
  const startedAt = Date.now()

  const prepareMindthegapPromise = prepareMindthegap()

  const mindthegapPath = await prepareMindthegapPromise

  core.info(`Prepared env in ${Date.now() - startedAt}ms`)
  return { mindthegapPath: mindthegapPath }
}

type ExecRes = {
  stdout: string
  stderr: string
}

const printOutput = (res: ExecRes): void => {
  if (res.stdout) {
    core.info(res.stdout)
  }
  if (res.stderr) {
    core.info(res.stderr)
  }
}

async function runMindthegap(mindthegapPath: string): Promise<void> {
  const addedArgs: string[] = ["--images-file", core.getInput("images-file"), "--output-file", core.getInput("output-file")]

  const cmd = `${mindthegapPath} create image-bundle ${addedArgs.join(` `)}`.trimEnd()
  core.info(`Running [${cmd}] ...`)
  const startedAt = Date.now()
  try {
    const res = await execShellCommand(cmd)
    printOutput(res)
  } catch (exc) {
    printOutput(exc)
    core.setFailed(`mindthegap exit with code ${exc.code}`)
  }

  core.info(`Ran mindthegap in ${Date.now() - startedAt}ms`)
}

export async function run(): Promise<void> {
  try {
    const { mindthegapPath } = await core.group(`prepare environment`, prepareEnv)
    core.addPath(path.dirname(mindthegapPath))
    await core.group(`run mindthegap`, () => runMindthegap(mindthegapPath))
  } catch (error) {
    core.error(`Failed to run: ${error}, ${error.stack}`)
    core.setFailed(error.message)
  }
}

run()
