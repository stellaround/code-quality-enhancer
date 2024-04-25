#!/usr/bin/env node

import fs from "fs";
import { execa } from "execa";
import chalk from "chalk";

// 读取package.json文件并返回JSON对象
export const readPackageJson = (filePath) => {
  const packageJson = fs.readFileSync(filePath, "utf8");
  return JSON.parse(packageJson);
};

// 对对象的键进行字母排序
const sortObjectByKey = (unordered) => {
  const ordered = {};
  Object.keys(unordered)
    .sort()
    .forEach((key) => {
      ordered[key] = unordered[key];
    });
  return ordered;
};

// 获取所有依赖的最新版本并更新到packageData中
export const updatePackageVersions = async (packageNames, packageData) => {
  console.log(chalk.hex("#409EFF")("获取依赖包最新版本中 ..."));
  const versionPromises = packageNames.map((packageName) =>
    execa("npm", ["show", packageName, "version"]).then((result) => ({
      packageName,
      version: result.stdout,
    })),
  );

  try {
    const results = await Promise.all(versionPromises);
    results.forEach(({ packageName, version }) => {
      packageData.devDependencies[packageName] = `^${version}`;
    });
  } catch (e) {
    console.log(e);
    console.log(chalk.hex("#F56C6C")("获取依赖包最新版本失败 !"));
    process.exit(1);
  }

  return sortObjectByKey(packageData.devDependencies);
};

// 将资源文件拷贝到目标目录
export const copyResourceFiles = (source, target) => {
  fs.copyFileSync(source, target);
};

// 获取所有安装的依赖包名
export const getAllPackageNames = (packageData) => {
  const dependencies = Object.keys(packageData.dependencies || {});
  const devDependencies = Object.keys(packageData.devDependencies || {});
  return [...new Set([...dependencies, ...devDependencies])];
};

// 获取已安装和未安装依赖信息
export const getDependencyInfo = (qualityPackageSet, allPackageNames) => {
  Reflect.ownKeys(qualityPackageSet).forEach((key) => {
    qualityPackageSet[key].hasInstalled = allPackageNames.includes(key);
  });

  return {
    hasInstalledPackage: Object.keys(qualityPackageSet)
      .filter((key) => qualityPackageSet[key].hasInstalled === true)
      .join("、"),
    choicesArr: Object.keys(qualityPackageSet)
      .filter((key) => qualityPackageSet[key].hasInstalled === false)
      .map((item) => {
        return {
          title: item,
          description: qualityPackageSet[item].description,
          value: item,
        };
      }),
  };
};
