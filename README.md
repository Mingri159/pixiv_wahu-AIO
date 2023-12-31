# pixiv_wahu-AIO详情

**说明**：本项目修改自 [danzou1ge6/pixiv_wahu (github.com)](https://github.com/danzou1ge6/pixiv_wahu)

- 介绍：[PixivWahu ， Pixiv 收藏管理工具](https://www.bilibili.com/read/cv17549666)
- 获取 Pixiv **refresh_token**，参考：https://www.adunm.top/posts/dcedddd5/

## 开发相关

- 安装python，[Download Python | Python.org](https://www.python.org/downloads/)
- 安装 pip, pipenv：`python -m pip install pip==22.0.4 pipenv`
- 安装python模块，`pip install -r requirements.txt`
- 安装Node.js，[Node.js (nodejs.org)](https://nodejs.org/en)
- 安装前端依赖，` npm install`
- 分别双击【start backend.bat】【start yarn quasar dev.sh】启动后端和前端；
- 将`refresh_token`放在`dev_stuff`文件夹下，命名`refresh_token.txt`;

## 使用
- 下载release压缩包；
- 将`refresh_token`放在`user`文件夹下，命名`refresh_token.txt`;

## 更新内容
### `v0.1.0`
- feat: 导航栏的**tab标签**不重复；

- feat: 全屏、退出全屏；

- feat: 插画**预览组件**；【0.8-5倍】缩放；

- feat: 滚动条滚到底部时，**自动加载下一页**；

- feat: 各页面添加对应的**功能栏**，例：**收藏**页面添加 [按`作者`、`tag`筛选]、【R-18】开关；

- feat: 插画卡片底部添加 `收藏`、`分P`、`R-18`、`AI`、`序号`;

- feat: 其他省略；

- fix：修复从pixiv订阅收藏夹后（覆写模式：**intelligent**、**append**），本地与pixiv的顺序不一致的问题；

- 优化：左侧边栏；
  > - 插画数据库 -> 本地收藏夹；
  > - 插画储存库 -> 本地储存库；
  > - 【搜索】【收藏】【推荐】【关注的画师】置于一级；
  > - 其他省略；
  
- _此外，<del>**浏览历史**原项目没有提供后端支持</del>（**已移除**）；_

  ------

- feat：启动项目可自动获取**Access Token**；

- feat：在侧边栏，右键本地收藏夹打开菜单可直接更新订阅；

- fix：点击顶部红色提示条任意位置可触发【连接后端】；

- fix: 左侧边栏有时无法关闭的bug；
