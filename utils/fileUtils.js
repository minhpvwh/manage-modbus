const fs = require("fs");
const configs = require("../configs");
const sharp = require("sharp");
const request = require('request');
const moment = require("moment");
const multer = require('multer');

async function mkdirs(path) {
    let dirs = path.split("/");
    let currentPath = dirs[0];
    for (let i = 1; i < dirs.length; i++) {
        if (!fs.existsSync(currentPath) && currentPath.trim()) {
            fs.mkdirSync(currentPath);
        }
        currentPath += "/" + dirs[i];
    }
    if (!fs.existsSync(currentPath) && currentPath.trim()) {
        fs.mkdirSync(currentPath);
    }
}

async function downloadImage(url, path) {
    const promise = new Promise((resolve, reject) => {
        request.head(url, (err, res, body) => {
            request(url)
                .pipe(fs.createWriteStream(path))
                .on('close', (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(path);
                    }
                })
        })
    }).catch(err => {
        throw err
    });
    return promise;
}


async function saveImage(image, makeThumbnail = true, prefix = "") {
    const date = new Date();
    let dir = `${configs.storeConfig.IMAGE_FOLDER}/${moment(date).format('YYYY/MM/DDDD')}`;
    let dirThumbnail = `${configs.storeConfig.IMAGE_FOLDER}/${moment(date).format('YYYY/MM/DDDD')}`;
    if (prefix.includes('users/')) {
        dir = `${configs.storeConfig.IMAGE_FOLDER}/${prefix}`;
    } else if (prefix.startsWith('members/')) {
        dir = `${configs.storeConfig.IMAGE_FOLDER}/${prefix}`;
        dirThumbnail = `${configs.storeConfig.IMAGE_FOLDER}/${prefix.replace('members/', 'memberThumbnails/')}`;
        await mkdirs(dirThumbnail);
    }
    if (prefix.startsWith('logs/')) {
        dir = `${configs.storeConfig.IMAGE_FOLDER}/${prefix}/${moment(date).format('YYYY/MM/DDDD')}`;
    }
    await mkdirs(dir);
    let fileName = `image-${date.getTime()}-${Math.floor(Math.random() * date.getTime())}`;
    return new Promise((resolve, reject) => {
        const imageTypeIndex = image.indexOf(";base64,");
        let imageExt = '.png';
        let base64Data = image;
        if (imageTypeIndex > 0) {
            const imageType = image.substring(0, imageTypeIndex);
            if (imageType.includes('jpeg')) {
                imageExt = '.jpg';
            }
            base64Data = image.substring(imageTypeIndex + 8);
        }
        // let base64Data = image.replace(/^data:image\/\.+;base64,/, "");
        // console.log(base64Data)
        const path = `${dir}/${fileName}${imageExt}`;
        fs.writeFile(path, base64Data, 'base64', async function (err) {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (!makeThumbnail) {
                return resolve({path});
            }
            try {
                const thumbnailPath = `${dirThumbnail}/${fileName}-thumbnail${imageExt}`;
                await resizeImage(path, thumbnailPath);
                return resolve({path, thumbnailPath});
            } catch (error) {
            }
            return resolve({path});
        });
    })
}

const resizeImageIdentify = async (url) => {
    let folder_name = url.replace(/^.*\/\/[^\/]+/, '').split("/");
    let filename = folder_name[folder_name.length - 1];
    delete folder_name[folder_name.length - 1]
    let filePath = 'public/api' + folder_name.join("/");
    await resizeImage(filePath, filename)
    let urlSplit = url.split("/");
    urlSplit[urlSplit.length - 1] = 'thumbnail-' + urlSplit[urlSplit.length - 1]
    return urlSplit.join("/");
};

async function resizeImage(filePath, thumbnailPath) {
    sharp(filePath)
        .resize(142, null)
        .toBuffer()
        .then((data) => {
            fs.writeFileSync(thumbnailPath, data);
        })
        .catch((error) => {
            console.log("statusRoute |  Error In Uploading Status Image" + error);
            throw error;
        });
};

// -> Multer Upload Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, configs.storeConfig.UPLOAD_FOLDER)
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + Date.now() + "-" + file.originalname)
    }
});

// function to encode file data to base64 encoded string
async function base64Encode(file) {
    // read binary data
    const bitmap = await fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return new Buffer.from(bitmap).toString('base64');
}

module.exports = {
    saveImage,
    downloadImage,
    mkdirs,
    resizeImageIdentify,
    storage,
    base64Encode,
};
