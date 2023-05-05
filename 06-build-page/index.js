const path = require('path');
const fs = require('fs/promises');


const projPath = path.join(__dirname, './project-dist');

async function build(){
    await fs.mkdir(projPath, {recursive:true});
    await copyAssets(path.join(__dirname, './assets'), path.join(projPath, './assets'));
    await buildCss();
    await buildHtml();
}
async function buildHtml(){
    const htmlSource = (await fs.readFile(path.join(__dirname, 'template.html'))).toString();
    const templates = await getTemplates();
    let htmlOut = []
    let htmlStart = 0;
    let htmlEnd;
    let templateStart;
    let templateEnd;
    let template;
    [...htmlSource].forEach(function(char, index, chars){
        if(char == '{' && chars[index+1] == '{'){
            htmlEnd = index;
            templateStart = index+2;
            htmlOut.push(chars.slice(htmlStart, htmlEnd).join(''));
        }
        if(char == '}' && chars[index+1] == '}'){
            htmlStart = index+2;
            templateEnd = index;
            template = chars.slice(templateStart, templateEnd).join('');
            htmlOut.push(templates[template]);

        }
        if(index == chars.length-1){
            htmlEnd = chars.length;
            htmlOut.push(chars.slice(htmlStart, htmlEnd).join(''));
            fs.writeFile(path.join(projPath, 'index.html'), htmlOut.join(''));
        }
    });
}
async function buildCss(){
    const bundle = {};
    const dest = path.join(__dirname, './project-dist', 'style.css');
    const styleFolder = path.join(__dirname, './styles');
    const styleFiles = (await fs.readdir(styleFolder, {withFileTypes:true})).filter(function(file){
        if(file.isFile()){
            const fileLoc = path.join(styleFolder, file.name);
            const fileExt = path.extname(fileLoc);
            return fileExt === '.css' ? true : false;
        }
    });
    styleFiles.forEach(async function(file, index){
        const chars = [...(await fs.readFile(path.join(styleFolder, file.name))).toString()]
        const rules = getRules(chars);
        for(let rule in rules){
            if(rule in bundle){
                let newRule = bundle[rule].slice(0, rule.indexOf('}'))+rules[rule].slice(1);
                bundle[rule] = newRule;
            }
            else{
                bundle[rule] = rules[rule];
            }
        }
        if(index === styleFiles.length-1){
            let arr = [];
            for(let value in bundle){
                let subStr = value + bundle[value];
                arr.push(subStr);
            }
            fs.writeFile(dest, arr.join(''));
        }
    });    
}
async function copyAssets(loc, dest){
    let files = await fs.readdir(loc, {withFileTypes:true});
    await fs.mkdir(dest, {recursive:true});
    let filesNames = await fs.readdir(loc);
    let oldFiles = await fs.readdir(dest);
    for(let oldFile of oldFiles){
        if(! filesNames.includes(oldFile)){
            fs.unlink(path.join(dest, oldFile));
        }
    }
    for(let file of files){
        if(file.isFile()){
            await fs.copyFile(path.join(loc, file.name), path.join(dest, file.name));
        }else{
            let newLoc = path.join(loc, `./${file.name}`);
            let newDest = path.join(dest, `./${file.name}`);
            await copyAssets(newLoc, newDest);
        }
    }
}
async function getTemplates(){
    const templatesNames = (await fs.readdir(path.join(__dirname, './components'),{withFileTypes:true})).filter(function(file){
        if(file.isFile()){
            const fileLoc = path.join(path.join(__dirname, './components'), file.name);
            const fileExt = path.extname(fileLoc);
            return fileExt === '.html' ? true : false;
        }
    });
    const templates = {};
    for(let name of templatesNames){
        let templPath = path.join(__dirname, './components', name.name);
        let templBody = (await fs.readFile(templPath)).toString();
        templates[path.basename(name.name, '.html')] = templBody;
    }
    return templates;
}
function getRules(chars){
    const innerRules = {};
    let selector;
    let rule;
    let selectorStart = 0;
    let selectorEnd;
    let ruleStart;
    let ruleEnd;
    let balance = 0
    for(let i = 0; i < chars.length; i++){
        if(chars[i] == '{' && balance == 0){
            selectorEnd = i;
            selector = chars.slice(selectorStart, selectorEnd).join('')
            ruleStart = selectorEnd;
            balance+=1;
            innerRules[selector] = null;
        }
        if(chars[i] == '{' && balance != 0 ){
            balance+=1;
        }
        if(chars[i] == '}' && balance > 1 ){
            balance-=1;
        }
        if(chars[i] == '}' && balance == 1 ){
            balance -= 1;
            ruleEnd = i+1;
            selectorStart = ruleEnd;
            rule = chars.slice(ruleStart, ruleEnd).join('');
            innerRules[selector] = rule;
        }
    }
    return innerRules;
}
build();
