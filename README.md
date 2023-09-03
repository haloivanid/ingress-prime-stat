# Ingress Prime Stat

A lightweight conversion tool for Ingress Prime statistics, implemented in TypeScript.

## Table of Contents

- [Description](#description)
- [Installation](#installation)
- [Usage](#usage)

## Description

Ingress Prime Stat is a utility designed to assist Ingress Prime players in converting and analyzing game statistics. Whether you want to compare your agent's performance over time or share specific metrics with other players, this tool makes it easy to convert raw Ingress Prime statistics data into a more user-friendly format.

This project is inspired by [ingress-prime-stat-to-json](https://github.com/EisFrei/ingress-prime-stats-to-json)

## Installation

To use Ingress Prime Stat, install using package manager of your choice:


```bash
npm install ingress-prime-stat@latest --save
```

## Usage

Ingress Prime Stat is designed to be used in a JavaScript or TypeScript project:

```javascript
const { IngressPrimeStat } = require('ingress-prime-stat');

const stat = IngressPrimeStat.process('your ingress stat string');

console.log(stat.toString());
```

```typescript
import { IngressPrimeStat } from 'ingress-prime-stat';

const stat = IngressPrimeStat.process('your ingress stat string');

console.log(stat.toJSON());
```
