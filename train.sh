#!/usr/bin/env bash

rm -rf ./aligned/cache.t7
python ./align-dlib.py
th ./embedding.lua -outDir ./ -data ./aligned/
python ./train.py
