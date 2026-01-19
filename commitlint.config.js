module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'refactor',
        'perf',
        'test',
        'docs',
        'chore',
        'style',
        'ci',
        'revert',
      ],
    ],
    'type-case': [2, 'always', 'lowerCase'],
    'subject-case': [2, 'always', 'lowerCase'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-empty': [2, 'never'],
    'header-max-length': [2, 'always', 72],
  },
};