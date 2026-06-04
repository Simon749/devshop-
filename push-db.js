const { execSync } = require("child_process");

// Force delete the toxic variable completely inside this process execution context
delete process.env.ESBUILD_BINARY_PATH;

try {
  console.log("🚀 Forcing database push with an isolated environment...");
  
  // Explicitly execute drizzle push pointing to your configuration
  execSync("pnpm exec drizzle-kit push --config=drizzle.config.js", { 
    stdio: "inherit" 
  });
  
  console.log("✅ Database push completed successfully!");
} catch (error) {
  console.error("❌ Execution failed.");
}