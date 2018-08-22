#!/usr/bin/env bash

rm -rf ./pyFiles/aligned/cache.t7
python ./pyFiles/align-dlib.py
th ./pyFiles/embedding.lua -outDir ./pyFiles -data ./pyFiles/aligned/
python ./pyFiles/train.py
