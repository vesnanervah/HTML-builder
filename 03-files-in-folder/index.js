const path = require('path');
const fs = require('fs/promises');

async function getSecret(){
    const folderLoc = path.join(__dirname, './secret-folder');
    const files = (await fs.readdir(folderLoc, {withFileTypes:true})).filter((file)=>file.isFile());
    files.forEach(async function(file){
                let fileLoc = path.join(folderLoc, file.name);
                let ext = path.extname(fileLoc);
                let name = path.basename(fileLoc, ext);
                let stats = await fs.stat(fileLoc);
                console.log(`<${name}>-<${ext.slice(1)}>-<${stats.size}>`)
    })
}
getSecret()