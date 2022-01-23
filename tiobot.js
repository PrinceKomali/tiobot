const zlib = require('zlib');
const Discord = require("discord.js");
const fetch = require("node-fetch");
const {AbortController} = require("node-abort-controller");
const TimeoutInteger = 10000;
let LanguageSize = 50;
const TioString = (c, l, i="") => zlib.deflateRawSync(Buffer.from(`Vlang\0${1}\0${l}\0VTIO_OPTIONS\0${0}\0F.code.tio\0${c.length}\0${c}F.input.tio\0${i.length}\0${i}Vargs\0${0}\0R`, 'binary'), { level: 9 });
// ^ -- https://github.com/vierofernando/tio.js/ 

function LanguageSwitch(query) {
    let SwitchCases = {
        "javascript-node": ["js", "javascript", "node", "nodejs"],
        "python3": ["py", "python", "py3"],
        "python2": ["py2"],
        "osabie": ["abe"],
        "befunge": ["befunge93", "befunge-93"],
        "cpp-clang": ["cpp", "c++"],
        "c-gcc": ["c", "gcc"],
        "c-csc": ["c#", "cs"],
        "brainfuck": ["bf"],
        "coffeescript": ["coffee"],
        "erlang-escript": ["erl", "erlang"],
        "fortran-gfortran": ["fortran"],
        "perl5": ["pl", "perl"],
        "java-jdk": ["java"],
        "kotlin": ["kt"],
        "typescript": ["ts"],
        "rust": ["rs"],
        "ruby": ["rb"],
        "fish": ["><>"],
        "elixir": ["ex", "exs"],
        "clojure": ["clj"],
        "bash": ["sh"],
        "powershell": ["ps1", "ps", "pwsh"],
        "pl": ["pllang", "pl-lang"],
        "brain-flak": ["brainflak"],
        "golfscript": ["gs"]


    }
    let keys = Object.keys(SwitchCases);
    for(var i in keys) {
        if(SwitchCases[keys[i]].includes(query)) return keys[i];
    }
    return query;
}
const client = new Discord.Client({intents: Discord.Intents.ALL});
client.on("ready", () => {
    console.log("Tio Bot is on!");
    client.user.setActivity("//help", {"type": "LISTENING"});
});
client.on("message", message => {
    if(message.content.startsWith("//")) {
        
        message.content = message.content.replace("//", "").trim();
        if(message.content.startsWith("help")) {
            message.channel.send("",{
                embed: {
                    color: 0xdedede,
                    description: `**TioBot Help Menu** 
(This bot is a wrapper for <https://tio.run/>; if you aren't familiar with that go check it out!) \n\n
• First pick a language. You can find available ones with \`//languages\`. Also, lots of language abbreviations work, such as \`js, cpp, c, etc.\`

• To run code, use the following command:
> //run\\\`\\\`\\\`language
> code here
> \\\`\\\`\\\`
For example:
> //run\\\`\\\`\\\`js
> console.log("Hello, World!");
> \\\`\\\`\\\`
• You can specify \`stdin\` with \`-input="input here"\` before the code block
For example
> //run -input="Hi!" \\\`\\\`\\\`py
> print(input())
> \\\`\\\`\\\``
                }
            })
        }
        if(message.content.startsWith("languages")) {
            try {
            message.content = message.content.replace("languages", "").trim();
            fetch("https://tio.run/languages.json").then(_=>_.json())
            .then(Langs=>{
                Langs = Object.keys(Langs);
                let chunks = [];
                for(var i = 0, j = Langs.length; i < j; i += LanguageSize) {
                    chunks.push(Langs.slice(i, i+LanguageSize));
                }
                let Page = 0;
                if(message.content == "") {
                    Page = 0;
                }
                else if(!isNaN(+message.content)) {
                    if(+message.content > chunks.length || +message.content < 1) {
                        return message.channel.send(`\`Page number needs to be between 1 and ${chunks.length}\``);
                    }
                    Page = +message.content - 1;
                }
                else {
                    return message.channel.send("`Invalid Page Number`");
                }
                return message.channel.send(`\`Showing page ${Page + 1} out of ${chunks.length}\`\n\`\`\`\n${chunks[Page].join("    ")}\n\`\`\``);
            }).catch(e=>message.channel.send("`A fetch() error occurred...`"));
        
        } catch (e) {
            message.channel.send("`An error has occurred!` ```\n" + e.stack + "\n```");
        }
    }
    if(message.content.startsWith("run")) {
        message.content = message.content.replace("run", "").trim();
        let Input = "";
        let isInput = false;
        // let Flags = ""; 
        // let isFlag = false;
        let Popped = "";let pointer = 0;
        while(message.content.startsWith("-")) {
            let StringCheck = false;
            let current = "";
            let TempContent = message.content;
            
            
            while(pointer < TempContent.length && (!"-` ".includes(TempContent[pointer]) || StringCheck || pointer == 0)) {
                let char = TempContent[pointer];
                
                pointer++;
                if(char == "=") {
                    if(current == "-input") isInput = true;
                    // else if(current == "-flags") isFlag = true;
                    else return message.channel.send("`Unknown argument: " + current + "`")
                }
                else if(char == "\"" && TempContent[pointer - 1] !== "\\") {
                    StringCheck = !StringCheck;
                    if(!StringCheck) message.content = message.content.substring(1, message.content.length);
                } else {
                    current += char;
                    if(isInput) Input += char;
                    // if(isFlag) Flags += char;
                    if(char == "n" && TempContent[pointer - 1] == "\\") char = "\n";
                    if(char == "\"" && TempContent[pointer - 1] == "\\") char = "\n";
                }
                Popped += message.content[0];
                if(message.content[0] != "`") message.content = message.content.substring(1, message.content.length);
            }
            isInput = false;
            // isFlag = false;
            current = "";
            
            
        }
        message.content = message.content.trim();
        let Code = '';
        let Language = ""
        try {
            if(!message.content.includes("```")) return message.channel.send("`No codeblock found`");
            let SplitCode = message.content.split("\n");
            while(!SplitCode[0].trim().startsWith("```")) SplitCode.shift();
            Language = SplitCode[0].replace("```", "").trim();
            Language = LanguageSwitch(Language);
            SplitCode.shift();
            if(SplitCode.length == 0) return message.channel.send("`No codeblock found`");
            while(!SplitCode[SplitCode.length - 1].trim().endsWith("```")) SplitCode.pop();
            SplitCode[SplitCode.length - 1] = SplitCode[SplitCode.length - 1].substring(0, SplitCode[SplitCode.length - 1].length - 3);
            Code = SplitCode.join("\n");
        } catch(e) {
            return message.channel.send("`An error occured while parsing the message content; please check the command again`");
        }
        message.channel.send("Running... <a:spinny:822587419449622539>").then(_message => {
        let AC = new AbortController();
        let Timeout = setTimeout(()=>AC.abort(), TimeoutInteger);
        let ScriptToPost = "fb67788fd3d1ebf92e66b295525335af-run" //TioScript.match(/^var runURL = "\/cgi-bin\/static\/([^"]+)";$/m)[1];
        fetch(`https://tio.run/cgi-bin/static/${ScriptToPost}`, {//require("crypto").randomBytes(16).toString("hex")
            method: "POST",
            signal: AC.signal,
            body: TioString(unescape(encodeURIComponent(Code)), unescape(encodeURIComponent(Language)), unescape(encodeURIComponent(Input)))
            }).then(x=>x.arrayBuffer()).then(_resp=>{
                clearTimeout(Timeout);
                let Output = zlib.unzipSync(_resp).toString().trim();
                let extra = new RegExp(Output.substring(0,16).replace(/\+/g, "\\+"), "gm");
                Output = Output.replace(extra, "").split("\n");
                // console.log(Output)
                if(Output[0].includes("' could not be found on the server") && Output.length < 2) {
                    return _message.edit("`This language was not found on tio.run; use //languages {{page}} to see available ones.`");
                }
                let ExitCode = Output.pop().split(": ")[1];
                let CPUShare = Output.pop().split(": ")[1];
                let SysTime = Output.pop().split(": ")[1];
                let UserTime = Output.pop().split(": ")[1];
                let RealTime = Output.pop().split(": ")[1];
                let stdout = Output.join("\n");
                if(stdout.length > 1500) stdout = stdout.substring(0, 1500) + "\n\n...";
                _message.edit(stdout, {
                    code: "ansi",
                    embed: {
                        color: 0xdedede,
                        fields: [
                            {
                                name: "Real Time",
                                value: RealTime,
                                inline: true
                            },
                            {
                                name: "User Time",
                                value: UserTime,
                                inline: true
                            },
                            {
                                name: "Sys. Time",
                                value: SysTime,
                                inline: true
                            },
                            {
                                name: "CPU Share",
                                value: CPUShare,
                                inline: true
                            },
                            {
                                name: "Exit Code",
                                value: ExitCode,
                                inline: true
                            }
                            
                        ]
                    }
                })
            }).catch(e=>{
                
                if(e.toString().includes("AbortError:")) _message.edit(`\`The request took longer than ${TimeoutInteger} milliseconds\``);
                else {
                    _message.edit("`An internal error has occurred`");
                    console.log(e.stack);   
                }
            })
            })

    }
}


});

client.login(require("./tio.json").token);
