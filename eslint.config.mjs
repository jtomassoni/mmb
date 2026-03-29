import next from "eslint-config-next";

const base = Array.isArray(next) ? next : next();

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [...base];

export default eslintConfig;
