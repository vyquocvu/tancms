// app.config.ts
import { defineConfig } from "@tanstack/start/config";
var app_config_default = defineConfig({
  react: {
    babel: {
      plugins: []
    }
  }
});
export {
  app_config_default as default
};
