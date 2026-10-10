import { Config } from "@remotion/cli/config";

Config.setEntryPoint("./src/index.ts");
// assets/ sert de dossier public : avatar/ et logos/ sont lisibles via staticFile() et getStaticFiles().
Config.setPublicDir("./assets");
Config.setCodec("h264");
Config.setAudioCodec("aac");
Config.setPixelFormat("yuv420p");
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setEnforceAudioTrack(true);
