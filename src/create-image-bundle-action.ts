// Copyright 2022 D2iQ, Inc. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import * as core from "@actions/core"

import { runMindthegap } from "./run-mindthegap"

export async function run(): Promise<void> {
  return runMindthegap([
    "create",
    "image-bundle",
    "--images-file",
    core.getInput("images-file", { required: true }),
    "--output-file",
    core.getInput("output-file", { required: true }),
    "--platform",
    core.getInput("platforms", { required: true }),
  ])
}

run()
