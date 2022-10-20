// Copyright 2022 D2iQ, Inc. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as core from "@actions/core"

import { runMindthegap } from "./run-mindthegap"

export async function run(): Promise<void> {
  const args = [
    "push",
    "image-bundle",
    "--image-bundle",
    core.getInput("image-bundle", { required: true }),
    "--to-registry",
    core.getInput("to-registry", { required: true }),
  ]

  if (core.getInput("to-registry-ca-cert-file")) {
    args.push("--to-registry-ca-cert-file", core.getInput("to-registry-ca-cert-file"))
  }
  if (core.getInput("to-registry-insecure-skip-tls-verify")) {
    args.push("--to-registry-insecure-skip-tls-verify", core.getBooleanInput("to-registry-insecure-skip-tls-verify").toString())
  }
  if (core.getInput("to-registry-username")) {
    args.push("--to-registry-username", core.getInput("to-registry-username"))
  }
  if (core.getInput("to-registry-password")) {
    args.push("--to-registry-password", core.getInput("to-registry-password"))
  }

  return runMindthegap(args)
}

run()
