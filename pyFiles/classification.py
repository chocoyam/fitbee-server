#!/usr/bin/env python2
#
# Copyright 2015-2016 Carnegie Mellon University
#     http://www.apache.org/licenses/LICENSE-2.0

import time
start = time.time()
import argparse
import cv2
import os
import pickle
import sys
from operator import itemgetter
import numpy as np
np.set_printoptions(precision=2)
import pandas as pd
import openface
from sklearn.pipeline import Pipeline
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis as LDA
from sklearn.preprocessing import LabelEncoder
from sklearn.svm import SVC
from sklearn.grid_search import GridSearchCV
from sklearn.mixture import GMM
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import GaussianNB



def getRep(imgPath, multiple=False):
    start = time.time()
    bgrImg = cv2.imread(imgPath)
    if bgrImg is None:
        raise Exception("Unable to load image: {}".format(imgPath))

    rgbImg = cv2.cvtColor(bgrImg, cv2.COLOR_BGR2RGB)
    start = time.time()
    align = openface.AlignDlib(args.dlibFacePredictor)

    if multiple:
        bbs = align.getAllFaceBoundingBoxes(rgbImg)
    else:
        bb1 = align.getLargestFaceBoundingBox(rgbImg)
        bbs = [bb1]

    if len(bbs) == 0 or (not multiple and bb1 is None):
        raise Exception("Unable to find a face: {}".format(imgPath))

    reps = []
    for bb in bbs:
        start = time.time()
        alignedFace = align.align(
            args.imgDim,
            rgbImg,
            bb,
            landmarkIndices=openface.AlignDlib.OUTER_EYES_AND_NOSE)
        if alignedFace is None:
            raise Exception("Unable to align image: {}".format(imgPath))

        start = time.time()

        net = openface.TorchNeuralNet(model=args.networkModel)
        rep = net.forward(alignedFace)
        reps.append((bb.center().x, rep))

    sreps = sorted(reps, key=lambda x: x[0])
    return sreps


def infer(args, multiple=False):
    with open(args.classifierModel, 'rb') as f:
        if sys.version_info[0] < 3:
                (le, clf) = pickle.load(f)
        else:
                (le, clf) = pickle.load(f, encoding='latin1')

    for img in args.imgs:
        reps = getRep(img, multiple)

        for r in reps:
            rep = r[1].reshape(1, -1)
            bbx = r[0]
            start = time.time()
            predictions = clf.predict_proba(rep).ravel()
            maxI = np.argmax(predictions)
            person = le.inverse_transform(maxI)
            confidence = predictions[maxI]
            if isinstance(clf, GMM):
                dist = np.linalg.norm(rep - clf.means_[maxI])
            return [confidence, person.decode('utf-8')]
            

if __name__ == '__main__':
    files = os.listdir('./pyFiles/faces')
    maxConf = 0
    maxName = ""

    for file in files :
        args = argparse.Namespace(classifierModel='./pyFiles/classifier.pkl', 
        cuda=False, dlibFacePredictor='./pyFiles/shape_predictor_68_face_landmarks.dat', 
        imgDim=96, imgs=['./pyFiles/faces/'+file], mode='infer', multi=False, 
        networkModel='./pyFiles/nn4.small2.v1.t7', verbose=False)

        result = infer(args)

        if maxConf < result[0] :
            maxConf = result[0]
            maxName = result[1]
    
    print(maxName)




    
