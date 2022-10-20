// Copyright 2022 D2iQ, Inc. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as core from "@actions/core"
import * as github from "@actions/github"
import { RestEndpointMethodTypes } from "@octokit/plugin-rest-endpoint-methods"

// TODO: make a class
export type Version = {
  major: number
  minor: number
  patch: number | null
} | null

const versionRe = /^v(\d+)\.(\d+)\.(\d+)$/

const parseVersion = (s: string): Version => {
  if (s == "latest" || s == "") {
    return null
  }
  const match = s.match(versionRe)
  if (!match) {
    throw new Error(`invalid version string '${s}', expected format v1.2.3`)
  }

  return {
    major: parseInt(match[1]),
    minor: parseInt(match[2]),
    patch: parseInt(match[3]),
  }
}

export const stringifyVersion = (v: Version): string => {
  if (v == null) {
    return "latest"
  }
  return `v${v.major}.${v.minor}.${v.patch}`
}

const minVersion = {
  major: 1,
  minor: 2,
  patch: 0,
}

const isLessVersion = (a: Version, b: Version): boolean => {
  if (a == null) {
    return true
  }
  if (b == null) {
    return false
  }
  if (a.major != b.major) {
    return a.major < b.major
  }

  // Do not compare patch parts because if the min version has a non zero value
  // then it returns false, since the patch version of requested is always zero
  return a.minor < b.minor
}

const getRequestedMindthegapVersion = (): Version => {
  const requestedMindthegapVersion = core.getInput(`version`)

  const parsedRequestedMindthegapVersion = parseVersion(requestedMindthegapVersion)
  if (parsedRequestedMindthegapVersion == null) {
    return null
  }
  if (isLessVersion(parsedRequestedMindthegapVersion, minVersion)) {
    throw new Error(
      `requested mindthegap version '${requestedMindthegapVersion}' isn't supported: we support only ${stringifyVersion(
        minVersion
      )} and later versions`
    )
  }
  return parsedRequestedMindthegapVersion
}

export type VersionConfig = {
  TargetVersion: string
  AssetURL: string
}

export async function findMindthegapVersion(): Promise<VersionConfig> {
  core.info(`Finding needed mindthegap version...`)
  const reqMindthegapVersion = getRequestedMindthegapVersion()
  let versionToDownload: string
  if (reqMindthegapVersion != null) {
    versionToDownload = stringifyVersion(reqMindthegapVersion)
  } else {
    versionToDownload = await getLatestReleaseTag().then((release) => release.data.tag_name)
  }

  return new Promise((resolve) => {
    resolve({
      TargetVersion: versionToDownload,
      AssetURL: `https://github.com/mesosphere/mindthegap/releases/download/${versionToDownload}/mindthegap_${versionToDownload}_linux_amd64.tar.gz`,
    })
  })
}

async function getLatestReleaseTag(): Promise<RestEndpointMethodTypes["repos"]["getLatestRelease"]["response"]> {
  const token = core.getInput("github-token", { required: true })
  const octokit = github.getOctokit(token)

  return octokit.rest.repos.getLatestRelease({ owner: "mesosphere", repo: "mindthegap" })
}
