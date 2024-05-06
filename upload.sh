#!/bin/bash
rsync -a --exclude="node_modules" . root@acur.ai:/home/ez-chatgpt-finetuner-server/