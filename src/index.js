#!/usr/bin/env node

import fs from "fs";
import fse from "fs-extra";
import path, { dirname } from "path";
import prompt from "prompts";
import chalk from "chalk";

import { fileURLToPath } from "url";
import {
  copyResourceFiles,
  getAllPackageNames,
  getDependencyInfo,
  readPackageJson,
  updatePackageVersions,
} from "./util.js";

// 定义全局变量
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectPath = process.cwd();
const packageJsonPath = path.join(projectPath, "package.json");
const packageData = readPackageJson(packageJsonPath);
const qualityPackageSet = {
  eslint: {
    hasInstalled: false,
    description:
      "JavaScript和JSX的静态检查工具，用于识别和报告模式中的问题，很多项目都会使用ESLint来保持代码风格的一致性。",
  },
  prettier: {
    hasInstalled: false,
    description:
      "代码格式化工具，支持多种语言，可以与ESLint配合使用，统一代码格式。",
  },
  styleLint: {
    hasInstalled: false,
    description:
      "专注于CSS和类CSS语言（如SCSS、Less等）的代码质量检查工具，类似于ESLint，但专门用于样式文件。",
  },
  commitlint: {
    hasInstalled: false,
    description:
      "检查Git提交信息是否遵守规定的格式，内置使用@commitlint/config-conventional约定提交信息格式。",
  },
  "lint-staged": {
    hasInstalled: false,
    description:
      "在Git暂存的文件上运行linters，内置依赖eslint和prettier处理文件。",
  },
};
const allPackageNames = getAllPackageNames(packageData);
const { hasInstalledPackage, choicesArr } = getDependencyInfo(
  qualityPackageSet,
  allPackageNames,
);

const main = async () => {
  const { choosePackages } = await prompt([
    {
      type: "multiselect",
      name: "choosePackages",
      message: `检测到当前已安装${hasInstalledPackage}，请选择以下您想安装的代码质量依赖：`,
      choices: choicesArr,
    },
  ]);

  if (choosePackages.length === 0) {
    console.log(chalk.hex("#409EFF")("未选择任何依赖，程序退出。"));
    process.exit(1);
  }

  for (const item of choosePackages) {
    switch (item) {
      case "commitlint":
        // 更新依赖版本
        packageData.devDependencies = await updatePackageVersions(
          ["husky", "@commitlint/cli", "@commitlint/config-conventional"],
          packageData,
        );

        // 确保.husky目录存在
        fse.ensureDirSync(path.join(process.cwd(), ".husky"));

        try {
          // 拷贝文件
          copyResourceFiles(
            path.join(__dirname, "resource", ".husky", "commit-msg"),
            path.join(projectPath, ".husky", "commit-msg"),
          );

          copyResourceFiles(
            path.join(__dirname, "resource", "commitlint.config.cjs"),
            path.join(projectPath, "commitlint.config.cjs"),
          );
        } catch (e) {
          console.log(e);
          console.log(chalk.hex("#F56C6C")("拷贝配置文件失败 !"));
          process.exit(1);
        }

        try {
          fs.writeFileSync(
            packageJsonPath,
            JSON.stringify(packageData, null, 2),
            "utf8",
          );
          console.log(
            chalk.hex("#55D187")("更新package.json成功，请安装依赖包"),
          );
        } catch (e) {
          console.log(e);
          console.log(chalk.hex("#F56C6C")("更新package.json失败 !"));
          process.exit(1);
        }
    }
  }
};

main().then(() => {
  // 成功
});
