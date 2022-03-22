const fs = require("fs");   

class configurations{
    static getConfigs(){
        try{
            const data = fs.readFileSync("./config/configs.json", "utf8");
            return JSON.parse(data);
        }catch(err){
            throw new Error("unable to retrieve configurations");
        }
    }

    static saveConfigs(newConfigs){
        try{
            fs.writeFileSync("./config/configs.json", JSON.stringify(newConfigs, null, 2));
        }catch(err){
            throw new Error("unable to update configuration file")
        }
    }
}

module.exports = configurations;