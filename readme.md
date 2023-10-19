### 从零搭建一个前端脚手架命令行工具

#### 一）初始化项目

在对应的目录下创建项目名称 kz-staging-cli. 执行命令如下：

```
mkdir kz-staging-cli && cd kz-staging-cli
```

然后生成 package.json 文件，执行命令如下:

```
npm init -y
```

#### 二）创建入口

在项目的根目录文件夹下，建一个 bin 目录，然后再新建一个 main 文件(注意：是纯 main，没有.js 后缀)。main 代码如下：

```
#! /usr/bin/env node

console.log('我是入口文件...');
```

然后，我们在命令行运行 node ./bin/main 后就会执行这个 main 文件，并且打印出来了结果，如下：

```
tugenhua@192 kz-staging-cli % node ./bin/main
我是入口文件...
```

#! /usr/bin/env node 是 base 脚本需要在第一行执行脚本的解释语言。我们使用的语言是 node。

如果我们想执行 kz-staging-cli 命令就能执行代码的话，我们只需要在 package.json 中增加如下代码：

```
{
  "name": "kz-staging-cli",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {},
  "bin": {
    "kz-staging-cli": "bin/main"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
```

为了暂时测试下，因此我们执行 npm link 链接到全局命令。现在这个时候 我们就可以在命令中运行 kz-staging-cli 也一样可以运行代码了，如下所示:

```
tugenhua@192 kz-staging-cli % kz-staging-cli
我是入口文件...
```

#### 三）配置脚手架的选项(options)

#### 3.1）增加版本

我们需要用到一个插件 commander, commander 是用来实现脚手架命令配置的插件。更多的使用方式 我们自己可以看下 <a href="https://github.com/tj/commander.js/blob/master/Readme_zh-CN.md">commander 中文文档</a>

先安装下该插件：

```
npm install commander@9
```

因此我们为 main 中增加如下代码：

```
#! /usr/bin/env node

const program = require("commander");

// 获取当前的版本号
const version = require('../package.json').version;

program
  // 配置脚手架名称
  .name('kz-staging-cli')
  // 配置命令格式
  .usage(`<command> [option]`)
  // 配置版本号
  .version(version);

program.parse(process.argv);
```

然后我们进行运行 kz-staging-cli --help 看一下

<img src="https://raw.githubusercontent.com/kongzhi0707/kz-staging-cli/master/images/1.png" /> <br />

可以看到已经有 --version 的提示了。我们执行一下命令: kz-staging-cli --version 就会发现可以输出版本号了。

#### 3.2）增加提示

增加提示其实就是为了美化效果，我们需要引入插件 chalk.
chalk 是用来美化字体的插件，也就是改变字体，背景颜色等等。想了解更多，我们可以去 <a href="https://github.com/chalk/chalk">chalk 地址</a> 看看.

安装命令：

```
npm install chalk@4
```

现在，我们继续为 main 增加如下代码, 所有的代码变成如下：

```
#! /usr/bin/env node

const program = require("commander");
const chalk = require("chalk");

// 获取当前的版本号
const version = require('../package.json').version;

program
  // 配置脚手架名称
  .name('kz-staging-cli')
  // 配置命令格式
  .usage(`<command> [option]`)
  // 配置版本号
  .version(version);

// 给提示增加
program.on('--help', () => {
  console.log();
  console.log(`
    Run ${chalk.cyan('kz-staging-cli <command> --help')} fro detailed usage of giver command.
  `)
});

program.parse(process.argv);
```

继续运行 kz-staging-cli --help 看一下效果如下：

<img src="https://raw.githubusercontent.com/kongzhi0707/kz-staging-cli/master/images/2.png" /> <br />

如上，我们就配置了脚手架的选项(options)了。

#### 3.3）配置脚手架命令(command)

脚手架的核心是命令，比如 vue create yyy. 因此，我们也需要实现自己的脚手架命令。

我们的目标是使用这个脚手架，可以拉取 vue 或 react 的模版代码。

#### 添加命令模块

现在，我们需要有一个 create 模块来完成创建指令。因此我们新建一个文件夹 lib，并增加一个文件 create.js, 代码如下：

```
module.exports = function (projectName, options) {
  console.log('---projectName---', projectName);
  console.log('---options------', options);
}
```

如上 lib/create.js 代码，导出一个函数，该函数接收两个参数，然后将接收到的参数打印出来。

现在我们继续改造 main 文件，在 main 文件增加以下代码, 所有代码如下：

```
#! /usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
// 获取create模块
const createModel = require('../lib/create');

// 获取当前的版本号
const version = require('../package.json').version;

program
  // 配置脚手架名称
  .name('kz-staging-cli')
  // 配置命令格式
  .usage(`<command> [option]`)
  // 配置版本号
  .version(version);

// 给提示增加
program.on('--help', () => {
  console.log();
  console.log(`
    Run ${chalk.cyan('kz-staging-cli <command> --help')} fro detailed usage of giver command.
  `)
});

program
  .command('create <project-name>')
  .description('create a new project')
  .option('-f, --force', 'overwrite target directory if it exists')
  .action((projectName, options) => {
    // 引入create模块, 并传入参数
    createModel(projectName, options);
  });

program.parse(process.argv);
```

如上命令解释：

```
program.command 是定义一个命令，命令的格式是 kz-staging-cli create yyy
description 是这个命令的描述。
option 是命令后面可以带的参数以及参数的相关描述。
action 后面是一个回调函数，回调函数的第一个参数是上面的 yyy（项目名称），第二个参数就是 -- 后面的
```

现在我们运行命令: kz-staging-cli create test --force, 打印如下：

<img src="https://raw.githubusercontent.com/kongzhi0707/kz-staging-cli/master/images/3.png" /> <br />

#### 四）编写 create 模块

#### 创建 Create 类

create 模块将来可能会包含很多功能，比如校验目录是否存在，或 拉取远程代码模块等功能。因此我们需要创建一个类。代码如下：

```
class Create {
  constructor(projectName, options) {
    this.projectName = projectName;
    this.options = options;
  }
  // 创建
  async create() {
    //....
  }
}

module.exports = function (projectName, options) {
  const creator = new Create(projectName, options);
  await creator.create();
}
```

如上就是我们的 create 类的模版代码。现在我们需要 校验目录是否存在，因此我们需要在 上面的 async create 函数添加代码逻辑了。
我们的目标是想通过 kz-staging-cli create yyy 来创建一个 yyy 项目名，但是我们所在的目录本身可能已经存在 yyy 目录。因此我们需要做一个目录是否存在的校验。校验规则如下：

```
1）如果使用了 --force 参数，那么直接删除原先的项目名，然后直接创建新的项目名。
2）如果没有使用 --force 参数，那么询问用户，是否覆盖，选择覆盖则执行1的逻辑，不覆盖则终止创建。
```

在第二步的时候，询问用户需要和用户进行交互，因此我们需要使用 inquirer 插件，我们还需要使用 fs-extra 模块来判断目录是否存在。

安装 inquirer 插件 命令如下：

```
npm install inquirer@8 fs-extra
```

现在我们可以在 create.js 添加逻辑代码如下：

```
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const Inquirer = require('inquirer');
const cwd = process.cwd();

class Create {
  constructor(projectName, options) {
    this.projectName = projectName;
    this.options = options;
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
}

module.exports = function (projectName, options) {
  const creator = new Create(projectName, options);
  creator.create();
}
```

上面代码编写完成后，我们在项目目录外面新建一个空文件夹 test，然后我们再运行 kz-staging-cli create test 后，执行结果如下：

<img src="https://raw.githubusercontent.com/kongzhi0707/kz-staging-cli/master/images/4.png" /> <br />

可以看到命令行进行交互了。

#### 五）增加调取模版 API

接下来，我们需要从远程去获取需要拉取的模版列表，然后选择一个需要拉取的模版，拉取到本地。
需要拉取的模版列表的 API：

里面的 topics 包含了 template 就是可以拉取的模版。

因此我们需要 axios。下载 axios 命令如下:

```
npm install axios
```

在项目的根目录下新建 api 文件夹，然后在该文件夹下 新建 request.js.

api/request.js 代码如下：

```
// api/request.js
const axios = require('axios');

class HttpRequest {
  constructor(baseUrl, options = {}) {
    this.baseUrl = baseUrl;
    this.commonOptions = options;
  }
  getInsideConfig() {
    const configs = {
      baseUrl: this.baseUrl,
      ...this.commonOptions
    };
    return configs;
  }
  request(options) {
    const instance = axios.create({});
    options = Object.assign(this.getInsideConfig(), options);
    return instance(options);
  }
}

module.exports = HttpRequest;
```

api/index.js 代码如下：

```
const HttpRequest = require('./request');
module.exports = new HttpRequest('');
```

api/interface/index.js 代码如下：

```
const axios = require('../api/index');

const getRepoList = params => {
  return axios.request({
    url: 'https://api.github.com/users/kongzhi0707/repos',
    params,
    method: 'get'
  })
}

module.exports = {
  getRepoList,
}
```

#### 六）获取模版列表

上面我们只是封装了 api，现在我们需要调用上面的 api 的 getRepoList 获取模版列表，让用户选择，需要获取那个模版。由于我们拉取远程数据需要时间。
因此，为了优化体验感，我们需要增加一个 loading 的效果，因此需要用到 ora 库。

ora 是命令行 loading 效果的库，了解更多 请查看 <a href="https://github.com/sindresorhus/ora">ora 文档</a>查看.

安装命令如下：

```
npm install ora@5
```

下面就是我们在 lib/create.js 增加的逻辑代码如下：

```
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const Inquirer = require('inquirer');
const cwd = process.cwd();

const ora = require('ora');
const api = require('../api/interface/index');

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
  }
}

module.exports = function (projectName, options) {
  const creator = new Create(projectName, options);
  creator.create();
}
```

现在，我们运行命令： kz-staging-cli create test

<img src="https://raw.githubusercontent.com/kongzhi0707/kz-staging-cli/master/images/5.png" /> <br />

#### 七）下载对应模版

接下来，我们就需要根据用户的选择模版来定向拉取对应的模版到本地来了，因此我们需要使用到 download-git-repo 这个插件来把 git 上面的模版拉取到本地来。

安装命令如下:

```
npm install download-git-repo
```

在 lib/create.js 中的代码变成如下：

```
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
const Inquirer = require('inquirer');
const cwd = process.cwd();

const ora = require('ora');
const api = require('../api/interface/index');

const util = require('util');
const downloadGitRepo = require('download-git-repo');

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
  }
}

module.exports = function (projectName, options) {
  const creator = new Create(projectName, options);
  creator.create();
}
```

现在，我们运行命令： kz-staging-cli create test 就可以把我们的代码拉取下来了。

<img src="https://raw.githubusercontent.com/kongzhi0707/kz-staging-cli/master/images/6.png" /> <br />

#### 八）模版提示

我们还需要增加一个优化功能，在拉取成功后，需要告诉用户怎么操作，并且增加一些艺术字体效果。增加艺术字体使用 figlet 插件。<a href="https://github.com/patorjk/figlet.js">查看 figlet 文档</a>

安装命令如下：

```
npm install figlet
```

然后我们的 create.js 增加如下代码：

```
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
```

我们现在再执行命令: ts-staging-cli create test 效果如下：

<img src="https://raw.githubusercontent.com/kongzhi0707/kz-staging-cli/master/images/7.png" /> <br />

#### 九）发布脚手架

package.json 文件如下：

```
{
  "name": "kz-staging-cli",
  "version": "1.0.0",
  "description": "前端脚手架命令行工具",
  "bin": {
    "kz-staging-cli": "bin/main"
  },
  "keywords": ["前端脚手架命令行工具", "脚手架", "kz-staging-cli"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.5.1",
    "chalk": "^4.1.2",
    "commander": "^9.5.0",
    "download-git-repo": "^3.0.2",
    "figlet": "^1.6.0",
    "fs-extra": "^11.1.1",
    "inquirer": "^8.2.6",
    "ora": "^5.4.1"
  }
}
```

```
1. 我们登录 npm , 执行命令 npm login.
2. 在本地增加一个.npmignore 文件，写上需要忽略的文件，比如.vscode 等.
3. 执行 npm publish 即可.
```
