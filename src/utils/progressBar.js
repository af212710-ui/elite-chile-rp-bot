function createProgressBar(current, max, size = 10) {
  const percentage = Math.min(Math.max(current / max, 0), 1);
  const filled = Math.round(size * percentage);
  const empty = size - filled;

  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  const percent = Math.round(percentage * 100);

  return `${bar} ${percent}%`;
}

module.exports = { createProgressBar };