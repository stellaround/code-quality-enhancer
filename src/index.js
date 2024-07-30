#!/usr/bin/env node

import fs from "fs";
import fse from "fs-extra";
import path, { dirname } from "path";
import chalk from "chalk";

import { fileURLToPath } from "url";
import {
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
      "使用@antfu/eslint-config，可以格式化TypeScript, JSX, Vue, JSON, YAML, Toml, Markdown等类型文件。",
  },
  stylelint: {
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
      "在Git暂存的文件上运行linters，内置依赖eslint和stylelint处理文件。",
  },
};
const allPackageNames = getAllPackageNames(packageData);
const { hasInstalledPackage, choicesArr } = getDependencyInfo(
  qualityPackageSet,
  allPackageNames,
);

const main = async () => {
  if (!hasInstalledPackage) {
    console.log(
      chalk.hex("#409EFF")(
        "当前未安装任何代码规范依赖包，代码规范依赖更新中...",
      ),
    );
  } else {
    console.log(
      chalk.hex("#F56C6C")(
        `检测到当前已安装${hasInstalledPackage}，请在安装后删除原有配置文件！`,
      ),
    );
    console.log(chalk.hex("#409EFF")("代码规范依赖更新装中..."));
  }

  packageData.devDependencies = await updatePackageVersions(
    [
      "eslint",
      "@antfu/eslint-config",
      "eslint-plugin-format",
      "stylelint",
      "stylelint-config-standard-vue",
      "stylelint-order",
      "@commitlint/cli",
      "@commitlint/config-conventional",
      "lint-staged",
      "husky",
    ],
    packageData,
  );

  try {
    await fse.copy(path.join(__dirname, "resource"), projectPath);
    console.log("Files copied successfully!");
  } catch (err) {
    console.log(err);
    console.log(chalk.hex("#F56C6C")("拷贝配置文件失败 !"));
  }

  try {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageData, null, 2),
      "utf8",
    );
    console.log(chalk.hex("#55D187")("更新package.json成功，请安装依赖包"));
  } catch (e) {
    console.log(e);
    console.log(chalk.hex("#F56C6C")("更新package.json失败 !"));
    process.exit(1);
  }
};

main().then(() => {
  // 成功
});
