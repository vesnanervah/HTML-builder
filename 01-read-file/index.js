const path = require('path');
const fs = require('fs');

const {stdout} = process;
const pathToText = path.join(__dirname, 'text.txt');
stdout.write(pathToText+`\n`);
fs.readFile(
    pathToText,
    (error, data)=>{
        stdout.write(data);
    }
);

