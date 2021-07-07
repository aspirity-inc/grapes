// @ts-check
const { spawnSync } = require("child_process");
const esbuild = require("esbuild");
const glob = require("tiny-glob");

/**
 * @param {esbuild.BuildOptions} baseOptions
 * @param {esbuild.Format} format
 */
async function build(baseOptions, format) {
  console.log(`🔨 ${format}`);
  console.time(`✅ ${format} build time`);

  await esbuild.build({
    ...baseOptions,
    format,
    outdir: `./dist/${format}`,
  });

  console.timeEnd(`✅ ${format} build time`);
}

function buildDts() {
  console.log("🔨 .d.ts");
  console.time("✅ .d.ts build time");

  spawnSync("tsc", ["--emitDeclarationOnly"], {
    stdio: "inherit",
  });

  console.timeEnd("✅ .d.ts build time");
}

(async () => {
  const tsPaths = await glob("src/**/*.ts");
  /** @type {esbuild.BuildOptions} */
  const baseOptions = {
    entryPoints: tsPaths,
    platform: "node",
    sourcemap: true,
  };

  console.log(`${tsPaths.length} files to build`);

  await build(baseOptions, "esm");
  await build(baseOptions, "cjs");
  buildDts();
})();
