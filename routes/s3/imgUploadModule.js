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

const s3 = new AWS.S3();

// 버킷 이름
var bucketName = 'surflife';

// 날짜를 이용해서 임의의 파일 이름 만들기
function getItemKey(originName) {
    // 확장자 얻기
    const extname = pathUtil.extname(originName); 

    const now = new Date(); // 날짜를 이용한 파일 이름 생성
    const itemKey = 'file_' + now.getYear() + now.getMonth() + now.getDay() + now.getHours() + now.getMinutes() + now.getSeconds() + Math.floor(Math.random()*1000) + extname;    
    return itemKey;
}

function createThumbnail(imagePath, thumbnailPath) {
    return new Promise((resolve, reject) => {
        result = easyimg.thumbnail({
                    src: imagePath,
                    dst: thumbnailPath,
                    width: 100
                });
        resolve(result);
    });
}

/*
function createThumbnail(imagePath, thumbnailPath, callback) {
    easyimg.thumbnail({
        src: imagePath,
        dst: thumbnailPath,
        width: 100
    }).then((image) => {
        console.log('thumbnail created');
        callback(null, image);
    }, (err) => {
        console.error('Thumbanil Create Error', err);
        callback(err);
    });
}
*/


// 파일 업로드
AWS.S3.prototype.uploadFile = function (filePath, contentType, itemKey) {
    var params = {
        Bucket: bucketName,  // 필수
        Key: itemKey,			// 필수
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
        // console.log(data);
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
    console.log('1 : '+fileInfo.path);
    console.log('이미지 업로드 성공 :', result);
    // 결과용 객체에 이미지 경로 저장
    uploadResult.imageUrl = result;
    
    /*
    // todo 썸네일 생성하고 올리기
    // thumbnailKey 정보가 없으면 썸네일 생성/업로드 안함
    if (uploadInfo.thumbnailKey) {
        try{
            // 썸네일 경로
            var thumbnailPath = fileInfo.Path + '_thumbnail';
            console.log('2 : '+thumbnailPath);
            let thumb = await createThumbnail(fileInfo.filePath, thumbnailPath);
            // 썸네일 업로드
            let result2 = await this.uploadFile(thumbnailPath, fileInfo.contentType, uploadInfo.thumbnailKey);
            
            // 파일 삭제 태스크를 위한 경로 저장
            pathForDelete.push(thumbnailPath);
            // 결과용 객체에 이미지 경로 저장
            uploadResult.thumbnailUrl = result2;
        }
        catch(err){
            console.log(err);
        }
     
    }*/

    //파일 삭제
    for(var i = 0 ; i < pathForDelete.length ; i++) {
        const path = pathForDelete[i];
        fs.unlinkSync(path);
    }
    return uploadResult;
}

module.exports = s3;
module.exports.getItemKey = getItemKey;