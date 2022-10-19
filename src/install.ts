// Copyright 2022 D2iQ, Inc. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as core from "@actions/core"
import * as tc from "@actions/tool-cache"
import os from "os"
import path from "path"

import { VersionConfig } from "./version"

const downloadURL = "https://github.com/mesosphere/mindthegap/releases/download"

const getAssetURL = (versionConfig: VersionConfig): string => {
  let ext = "tar.gz"
  let platform = os.platform().toString()
  switch (platform) {
    case "win32":
      platform = "windows"
      ext = "zip"
      break
  }
  let arch = os.arch()
  switch (arch) {
    case "x64":
      arch = "amd64"
      break
    case "x32":
    case "ia32":
      arch = "386"
      break
  }

  return `${downloadURL}/${versionConfig.TargetVersion}/mindthegap_${versionConfig.TargetVersion}_${platform}_${arch}.${ext}`
}

// The installLint returns path to installed binary of mindthegap.
export async function installMindthegap(versionConfig: VersionConfig): Promise<string> {
  core.info(`Installing mindthegap ${versionConfig.TargetVersion}...`)
  const startedAt = Date.now()
  const assetURL = getAssetURL(versionConfig)
  core.info(`Downloading ${assetURL} ...`)
  const archivePath = await tc.downloadTool(assetURL)
  let extractedDir = ""
  if (assetURL.endsWith("zip")) {
    extractedDir = await tc.extractZip(archivePath, process.env.HOME)
  } else {
    // We want to always overwrite files if the local cache already has them
    const args = ["xz"]
    if (process.platform.toString() != "darwin") {
      args.push("--overwrite")
    }
    extractedDir = await tc.extractTar(archivePath, process.env.HOME, args)
  }

  const mindthegapPath = path.join(extractedDir, `mindthegap`)
  core.info(`Installed mindthegap into ${mindthegapPath} in ${Date.now() - startedAt}ms`)
  return mindthegapPath
}
