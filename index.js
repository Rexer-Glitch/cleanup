const CleanUp = require("./cleanup");
const path = require("path");
const cleanUp = new CleanUp();
const cron = require("node-cron");
//cleanUp.clean();

cleanUp.cleanOnSchedule();