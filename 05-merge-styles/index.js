const fs = require('fs/promises');
const path = require('path');

async function makeBundle(){
    const bundle = {};
    const dest = path.join(__dirname, './project-dist', 'bundle.css');
    const styleFolder = path.join(__dirname, './styles');
    const styleFiles = (await fs.readdir(styleFolder, {withFileTypes:true})).filter(function(file){
        if(file.isFile() && file.name != 'bundle.css'){
            const fileLoc = path.join(styleFolder, file.name);
            const fileExt = path.extname(fileLoc);
            return fileExt === '.css' ? true : false;
        }
    })
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

makeBundle();