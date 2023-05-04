const fs = require('fs/promises');
const path = require('path');

async function copyDir(){
    const baseFolder = path.join(__dirname, './files');
    const copyFolder = path.join(__dirname, './copy-files');
    fs.mkdir(copyFolder, {recursive:true});
    const baseFiles = await fs.readdir(baseFolder);
    const prevFiles = await fs.readdir(copyFolder);
    baseFiles.forEach((baseFile)=>{
        let fileLoc = path.join(baseFolder, baseFile);
        let fileDest = path.join(copyFolder, baseFile);
        if(! prevFiles.includes(baseFile)){
            fs.copyFile(fileLoc, fileDest);
        }
    })
    const afterFiles = await fs.readdir(copyFolder)
    afterFiles.forEach((afterFile)=>{
        if(! baseFiles.includes(afterFile)){
            fs.unlink(path.join(copyFolder, afterFile));
        }
    });
}
copyDir()