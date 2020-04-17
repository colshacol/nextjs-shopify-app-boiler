module.exports = (api) => {
  api.cache(false)

  return {
    presets: ["next/babel"],
  }
}
