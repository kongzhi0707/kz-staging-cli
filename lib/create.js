
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const Inquirer = require('inquirer');
const cwd = process.cwd();

const ora = require('ora');
const api = require('../api/interface/index');

const util = require('util');
const downloadGitRepo = require('download-git-repo');

const figlet = require('figlet');

class Create { 
  constructor(projectName, options) { 
    this.projectName = projectName;
    this.options = options;
    this.getCollectRepo();
  }
  // 创建
  async create() { 
    const isOverwrite = await this.handleDirectory();
    console.log('---isOverwrite---', isOverwrite);
    if (!isOverwrite) return;
  }
  // 是否有相同的项目名
  async handleDirectory() { 
    // 当前目标路径
    const targetDirectory = path.join(cwd, this.projectName);
    console.log('---targetDirectory---', targetDirectory);
    // 如果目录中存在需要创建的目录，如果有参数 force 的话，直接删除当前的目录，然后再创建
    if (fs.existsSync(targetDirectory)) { 
      console.log('---this.options---', this);
      if (this.options.force) {
        await fs.remove(targetDirectory);
      } else { 
        let { isOverwrite } = await new Inquirer.prompt([
          {
            name: 'isOverwrite',
            type: 'list',
            message: '是否强制覆盖已存在的相同目录?',
            choices: [
              {
                name: '覆盖',
                value: true
              },
              {
                name: '不覆盖',
                value: false
              }
            ]
          }
        ]);
        if (isOverwrite) {
          await fs.remove(targetDirectory);
        } else { 
          console.log(chalk.red.bold('不能覆盖文件夹，创建终止'));
          return false;
        }
      }
    }
    return true;
  }
  // 获取可拉取的仓库列表
  async getCollectRepo() { 
    const loading = ora('正在获取模版信息...');
    loading.start();
    const { data: list } = await api.getRepoList({ per_page: 100 });
    loading.succeed();
    const templateNameList = list.filter(item => item.topics.includes('template')).map(item => item.name);
    let { choiceTemplateName } = await new Inquirer.prompt([
      {
        name: 'choiceTemplateName',
        type: 'list',
        message: '请选择模版',
        choices: templateNameList
      }
    ]);
    console.log('选择了模版: ' + choiceTemplateName);
    // 下载模版
    this.downloadTemplate(choiceTemplateName);
  }
  // 下载github仓库中的模版
  async downloadTemplate(choiceTemplateName) { 
    this.downloadGitRepo = util.promisify(downloadGitRepo);
    const templateUrl = `kongzhi0707/${choiceTemplateName}`;
    const loading = ora('正在拉取模版...');
    loading.start();
    console.log('---templateUrl---', templateUrl);
    console.log('---projectName----',  path.join(cwd, this.projectName))
    await this.downloadGitRepo(templateUrl, path.join(cwd, this.projectName));
    loading.succeed();

    // 增加艺术字体
    this.showTemplateHelp();
  }
  showTemplateHelp() { 
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.projectName)}`);
    console.log(`\r\n  cd ${chalk.cyan(this.projectName)}\r\n`);
    console.log("  npm install");
    console.log("  npm run dev\r\n");
    console.log(`
      \r\n
      ${chalk.green.bold(
        figlet.textSync("SUCCESS", {
          font: "isometric4",
          horizontalLayout: "default",
          verticalLayout: "default",
          width: 80,
          whitespaceBreak: true,
        })
      )}
   `)
  }
}

module.exports = function (projectName, options) {
  const creator = new Create(projectName, options);
  creator.create();
}