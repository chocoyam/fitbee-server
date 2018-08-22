const AWS = require('aws-sdk');
const async = require('async');
const fs = require('fs');
const assert = require('assert');
const easyimg = require('easyimage');
const pathUtil = require('path');

const config = require('./s3config.js');
AWS.config.region = config.region;
AWS.config.accessKeyId = config.accessKeyId;
AWS.config.secretAccessKey = config.secretAccessKey;
var bucketName = config.bucketName;

const s3 = new AWS.S3();
require('date-utils');
var now = new Date().toFormat('YYYY-MM-DD');


// 날짜+userId를 이용해서 임의의 파일 이름 만들기
function getItemKey(originName, userId) {
    const extname = pathUtil.extname(originName); // 확장자 얻기
    const itemKey = userId + '_' + now + '_' + Math.floor(Math.random()*1000) + extname;    
    return itemKey;
}

// 파일 업로드
AWS.S3.prototype.uploadFile = function (filePath, contentType, itemKey) {
    var params = {
        Bucket: bucketName,
        Key: itemKey,
        ACL: 'public-read',
        Body: fs.createReadStream(filePath),
        ContentType: contentType
    }

    return new Promise( (resolve, reject) => {
         this.putObject(params, function (err, data) {
            if (err) {
            console.error('S3 PutObject Error', err);
            return reject(err);
        }
        // 접근 경로 - 2가지 방법
        var imageUrl = s3.endpoint.href + bucketName + '/' + itemKey; // http, https
        resolve(imageUrl);
    }   );
    })
}


AWS.S3.prototype.uploadImage = async function (fileInfo, uploadInfo) {
    // filePath, contentType, itemKey
    if (!fileInfo.path || !uploadInfo) {
        assert(false, 'check parameter!');
    }

    if (!fileInfo.contentType) {
        fileInfo.contentType = 'image/jpg';
    }

    // 최종 결과용
    var uploadResult = {};

    // 삭제할 파일 경로 저장
    var pathForDelete = [];

    // 원본 이미지 업로드
    let result = await this.uploadFile(fileInfo.path, fileInfo.contentType, uploadInfo.itemKey);
    // 삭제할 이미지 경로 저장
    pathForDelete.push(fileInfo.path);
    // 결과용 객체에 이미지 경로 저장
    uploadResult.imageUrl = result;

    //파일 삭제
    for(var i = 0 ; i < pathForDelete.length ; i++) {
        const path = pathForDelete[i];
        fs.unlinkSync(path);
    }
    return uploadResult;
}

module.exports = s3;
module.exports.getItemKey = getItemKey;