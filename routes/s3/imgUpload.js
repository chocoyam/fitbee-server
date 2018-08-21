var s3 = require('./imgUploadModule');

var upload = async function(photos, folderName){
    console.log('upload 실행');
    var fileName;
    var uploadInfo = {};
    var urls = [];
    var imageUrl;
    var thumbnailUrl;

    console.log('##### : '+photos);

    if(photos){
        for(var i =0; i<photos.length; i++){
            fileName =s3.getItemKey(photos[i].originalname);
            
            //uploadInfo.thumbnailKey = 'thumbnail/' + fileName;
            uploadInfo.itemKey = folderName + '/' + fileName;

            var result =  await s3.uploadImage(photos[i], uploadInfo);
            urls.push(result.imageUrl);
            console.log('확인 : '+urls);
        }
    }
    return urls;

}

module.exports.upload = upload;