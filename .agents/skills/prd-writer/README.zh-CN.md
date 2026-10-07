# prd-writer

> 一个 Claude Code 技能：把脑中模糊的产品想法，打磨成开发团队可以直接排期的 PRD，最终输出专业排版的 `.docx` 文件。

简体中文 · [English](./README.md)

`prd-writer` 是 [Claude Code](https://claude.com/claude-code) 的一个 skill。它带着 Claude 走完撰写 PRD 的完整流程：收集领域知识 → 三维度深挖需求 → 设计文档结构 → 逐章撰写 → 自我评审 → 生成 Word 文档。

它是刻意固执的。PRD 写砸的常见原因有两个：一是产品经理替用户臆造业务规则，二是"做什么"和"怎么做"搅在一起。这个技能就是用来按住这两件事。

## 为什么做这个 skill

大多数"帮我写个 PRD"的 prompt 能产出看起来很像样、但里面堆满臆造需求的文档。这个 skill 从三个具体的点上对抗这件事：

- **不替用户臆造业务规则。** 每个功能点必须通过"三维度检查"—— *数据来源*、*业务规则*、*异常处理* ——才能往下走。Claude 不知道的就去问用户，不编。
- **守住产品经理的边界。** 定义"做什么"和"为什么"，不写 URL 路径、表结构、CSS。Phase 3 里内置了一个判断原则："换一个开发团队来做，他们需要知道这个信息吗？"
- **最终交付是 Word。** 输出是带封面页、目录、三线表、页眉页脚的 `.docx` 文件，不是 Markdown 糊一堆给你。

## 主要特性

- **三种模式** —— *新建*（从零开始）、*补全*（完善已有草稿）、*调研*（只收集领域背景）。
- **递归三维度追问** —— 每个功能点必须把数据来源、业务规则、异常处理都问明白，才能进入撰写阶段。
- **Non-Goals 作为一等章节** —— 明确不做什么，每个非目标都写明原因，防止中途范围蔓延。
- **Given/When/Then 验收标准** —— 开发和测试可以直接搬到用例里。
- **领先指标 + 滞后指标** —— 领先指标（采纳率、完成率）一两周内看，滞后指标（留存、NPS）几个月判定成败，两者都给具体目标值。
- **待决事项带责任人** —— 每个未决问题都标明责任角色和是否阻塞开发启动。
- **领域知识沉淀** —— 收集到的业务背景自动写进项目的 `docs/prd-knowledge/<领域>/<模块>.md`，同领域的下一份 PRD 起点更高。
- **内置自评审** —— 生成 `.docx` 前先以资深产品经理视角做一轮评审（完整性、一致性、可落地性、边界清晰度）。

## 安装

把仓库克隆到 Claude Code 的 skill 目录：

```bash
git clone https://github.com/GarrusHuang/prd-writer.git ~/.claude/skills/prd-writer
```

完事。Claude Code 会自动发现 `~/.claude/skills/` 下的所有 skill。下次你在 Claude Code 里提到 PRD、需求文档、功能设计之类的词，这个 skill 就会被触发。

### 依赖

`prd-writer` 把 `.docx` 生成工作交给另外两个 skill 来做，请同时安装：

- **[`docx`](https://github.com/anthropics/skills)** —— Word 文档生成能力（生成 `.docx` 必需）。
- **[`docx-chinese-fix`](https://github.com/anthropics/skills)** —— 中文字符串处理规则（写中文 PRD 必需，防止中文引号导致 JavaScript 语法错误）。

没装这两个的话，Phase 5 输出 `.docx` 可能失败或文件坏掉。但 Phase 0–4 的需求深挖和内容起草仍然可用。

## 怎么用

像平时和 Claude Code 聊天一样就行。触发词包括：

- "帮我写个 XX 的 PRD"
- "帮我把这个需求整理成文档"
- "我有个半成品需求文档，帮我补全"
- "先调研一下 XX 领域的背景资料"

Claude 会自动判断模式，然后走下面的流程。

## 流程总览

```
Phase 0  领域背景收集
         ↓（可选；纯工具类产品跳过）
Phase 1  递归需求深挖
         └─ 每个功能点必须过三维度检查：
            数据来源 · 业务规则 · 异常处理
         ↓ 所有功能点都 ✅ 后才继续
Phase 2  PRD 结构设计
         └─ 用户确认目录大纲
         ↓
Phase 3  逐章撰写
         └─ 使用 references/chapter-templates.md
         ↓
Phase 4  自评审（问题分级 P0 / P1 / P2）
         ↓ P0 问题修复后
Phase 5  输出 .docx
         └─ 封面页 · 目录 · 三线表 · 页眉页脚
```

## 目录结构

```
prd-writer/
├── SKILL.md                       # Claude Code 加载的 skill 定义
├── references/
│   └── chapter-templates.md       # 各章节的详细撰写模板
├── README.md                      # 英文 README
├── README.zh-CN.md                # 本文件
└── LICENSE
```

## 贡献

欢迎提 Issue 和 PR。特别欢迎这些方向的贡献：

- 行业专属章节模板（金融、医疗、数据产品……）
- 现有 AI / To B / 数据 / 移动端之外的产品类型调整
- 章节模板的国际化版本

## 许可证

遵循 [MIT 许可证](./LICENSE) 发布。
