import fs from "fs-extra";
import path from "path";
import { ICtx, IUtil } from "~types";

export const getViteConfig: IUtil = (ctx) => {
  const useUno = ctx.installers.includes("UnoCSS");
  const shouldUseSSR = !ctx.installers.includes("tRPC");
  const getPlugins = () => {
    if (useUno && ctx.vercel) {
      return `[
          solid({ ssr: ${shouldUseSSR}, adapter: vercel({ edge: false }) }),
          UnoCSS(),
        ]`;
    } else if (useUno) {
      return `[solid({ ssr: ${shouldUseSSR} }), UnoCSS()]`;
    } else if (ctx.vercel) {
      return `[solid({ ssr: ${shouldUseSSR}, adapter: vercel({ edge: false }) })]`;
    } else {
      return `[solid({ ssr: ${shouldUseSSR} })]`;
    }
  };
  const plugins = getPlugins();
  return `import solid from "solid-start/vite";
import dotenv from "dotenv";${
    useUno ? `\nimport UnoCSS from "unocss/vite";` : ""
  }
import { defineConfig } from "vite";${
    ctx.vercel
      ? `\n// @ts-expect-error no typing
import vercel from "solid-start-vercel";`
      : ""
  }
  
export default defineConfig(() => {
  dotenv.config();
  return {
    plugins: ${plugins},
  };
});
  `;
};

export const modifyConfigIfNeeded = async (ctx: ICtx) => {
  if (
    ctx.vercel ||
    ctx.installers.includes("UnoCSS") ||
    ctx.installers.includes("tRPC")
  ) {
    await fs.writeFile(
      path.join(ctx.userDir, "vite.config.ts"),
      getViteConfig(ctx)
    );
  }
};
