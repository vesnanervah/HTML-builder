const path = require('path');
const fs = require('fs');

const {stdin, stdout} = process;
const filePath = path.join(__dirname,'file.txt');
stdout.write('Hi there!\n');
fs.writeFile(
    filePath,
    '',
    (err) => {
        if (err) throw err;
    }
);
stdin.on('data', data=>{
    if(data == 'exit\n'||data == 'exit'||data.toString().trim() == 'exit'){
        process.exit();
    }
    fs.appendFile(filePath, data.toString(), err => {
        if (err) throw err;
        console.log('File was appended');
    })
} );

process.on('exit', ()=>stdout.write('Bye\n'));
process.on('SIGINT', ()=>{stdout.write('\n');process.exit()}
);