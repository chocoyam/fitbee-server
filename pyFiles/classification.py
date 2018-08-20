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
    print("getRep call")
    start = time.time()
    bgrImg = cv2.imread(imgPath)
    if bgrImg is None:
        raise Exception("Unable to load image: {}".format(imgPath))

    rgbImg = cv2.cvtColor(bgrImg, cv2.COLOR_BGR2RGB)

    if args.verbose:
        print("  + Original size: {}".format(rgbImg.shape))
    if args.verbose:
        print("Loading the image took {} seconds.".format(time.time() - start))

    start = time.time()

    align = openface.AlignDlib(args.dlibFacePredictor)

    if multiple:
        bbs = align.getAllFaceBoundingBoxes(rgbImg)
    else:
        bb1 = align.getLargestFaceBoundingBox(rgbImg)
        bbs = [bb1]
    if len(bbs) == 0 or (not multiple and bb1 is None):
        raise Exception("Unable to find a face: {}".format(imgPath))
    if args.verbose:
        print("Face detection took {} seconds.".format(time.time() - start))

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
        if args.verbose:
            print("Alignment took {} seconds.".format(time.time() - start))
            print("This bbox is centered at {}, {}".format(bb.center().x, bb.center().y))

        start = time.time()

        net = openface.TorchNeuralNet(model=args.networkModel)
        rep = net.forward(alignedFace)
        if args.verbose:
            print("Neural network forward pass took {} seconds.".format(
                time.time() - start))
        reps.append((bb.center().x, rep))
    sreps = sorted(reps, key=lambda x: x[0])
    return sreps


def infer(args, multiple=False):
    print("infer call")
    print("----------------------------------")
    print(args)
    print("----------------------------------")
    with open(args.classifierModel, 'rb') as f:
        if sys.version_info[0] < 3:
                (le, clf) = pickle.load(f)
        else:
                (le, clf) = pickle.load(f, encoding='latin1')

    for img in args.imgs:
        print("\n=== {} ===".format(img))
        reps = getRep(img, multiple)
        if len(reps) > 1:
            print("List of faces in image from left to right")
        for r in reps:
            rep = r[1].reshape(1, -1)
            bbx = r[0]
            start = time.time()
            predictions = clf.predict_proba(rep).ravel()
            maxI = np.argmax(predictions)
            person = le.inverse_transform(maxI)
            confidence = predictions[maxI]
            if args.verbose:
                print("Prediction took {} seconds.".format(time.time() - start))
            if isinstance(clf, GMM):
                dist = np.linalg.norm(rep - clf.means_[maxI])
                print("  + Distance from the mean: {}".format(dist))
            if multiple:
                print("Predict {} @ x={} with {:.2f} confidence.".format(person.decode('utf-8'), bbx,
                                                                         confidence))
            else:
                print("Predict {} with {:.2f} confidence.".format(person.decode('utf-8'), confidence))
                return [confidence, person.decode('utf-8')]
            
def main() :
    if __name__ == '__main__':
        files = os.listdir('./faces')
        maxConf = 0
        maxName = ""

        for file in files :
            args = argparse.Namespace(classifierModel='./classifier.pkl', 
            cuda=False, dlibFacePredictor='./shape_predictor_68_face_landmarks.dat', 
            imgDim=96, imgs=['./faces/'+file], mode='infer', multi=False, 
            networkModel='./nn4.small2.v1.t7', verbose=False)

            result = infer(args)

            if maxConf < result[0] :
                maxConf = result[0]
                maxName = result[1]
        
        return maxName


main()


    
