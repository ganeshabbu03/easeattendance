import { spawn } from "child_process";

const isVercel = process.env.VERCEL === "1";

if (isVercel) {
    console.log("Detected Vercel environment. Running build instead of dev server.");
    // Ensure NODE_ENV is production for the build
    process.env.NODE_ENV = "production";
    const build = spawn("npm", ["run", "build"], { stdio: "inherit", shell: true });
    build.on("exit", (code) => process.exit(code ?? 0));
} else {
    console.log("Starting local development server...");
    process.env.NODE_ENV = "development";
    const dev = spawn("npx", ["tsx", "server/index.ts"], { stdio: "inherit", shell: true });
    dev.on("exit", (code) => process.exit(code ?? 0));
}
