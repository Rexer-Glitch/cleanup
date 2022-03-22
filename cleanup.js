const Configurations = require("./config/configs");
const { readdir, rename } = require("fs/promises");
const path = require("path");
const { existsSync, mkdirSync } = require("fs");
const { homedir } = require("os");
const cron = require("node-cron");

class CleanUp {
  configs = {};
  constructor() {
    this.configs = Configurations.getConfigs();
  }

  cleanOnSchedule() {
    const time = this.cronTime();
    cron.schedule(time, this.clean);
  }

  clean() {
    `
      cleans all folders listed in the config file
    `;

    for (let directoryPath of this.configs.cleanUpDirectories) {
      if (!path.isAbsolute(directoryPath))
        directoryPath = path.join(homedir(), directoryPath);
      this.cleanDirectory(directoryPath);
    }
  }

  async cleanDirectory(dir) {
    `
        1) get list of all files
        2) go through all the files and get their extensions
        3) create destination url based on the extension and move the file
      `;
    try {
      const fileNameList = await this.#getFileNamesOfDirectory(dir);
      for (let name of fileNameList) {
        const ext = path.extname(name);
        const directoryPath = path.join(
          dir,
          this.#getDirectoryNameByExtension(ext)
        );
        const srcPath = path.join(dir, name);
        const destPath = path.join(directoryPath, name);

        //if Destination directory doesnt exist, create it
        this.#createDirectory(directoryPath);

        //move file;
        this.#moveFile(srcPath, destPath);
        console.log({ srcPath, destPath });
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  #getDirectoryNameByExtension(ext) {
    const fileTypes = Object.keys(this.configs.fileTypes);
    for (let fileType of fileTypes) {
      const extensions = this.configs.fileTypes[fileType];
      for (let i = 0; i < extensions.length; i++) {
        if (ext.replace(".", "") === extensions[i]) return fileType;
      }
    }

    return "other";
  }

  async #moveFile(src, dest) {
    try {
      const res = await rename(src, dest);
      return res === undefined;
    } catch (err) {
      throw new Error("unable to move file");
    }
  }

  #createDirectory(dir) {
    try {
      if (!existsSync(dir)) {
        mkdirSync(dir);
      }
    } catch (err) {
      throw new Error(err.message);
    }
  }

  async #getFileNamesOfDirectory(dir) {
    try {
      const files = await readdir(dir);
      return files.filter((file) => path.extname(file) !== "");
    } catch (err) {
      throw new Error(err.message + ": unable to retrieve directory file list");
    }
  }

  cronTime() {
    const { minutes, hours, dayOfWeek } = this.configs.autoCleanUpInterval;
    return `* ${minutes && minutes !== 0 ? minutes : "*"} ${
      hours && hours !== 0 ? hours : "*"
    } * * ${dayOfWeek && (dayOfWeek >= 0 || dayOfWeek <= 7) ? dayOfWeek : "*"}`;
  }
}

module.exports = CleanUp;
