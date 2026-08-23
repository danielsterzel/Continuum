import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.Continuum.app',
  appName: 'continuum',
  webDir: 'out',

  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: "Library/CapacitorDatabase"
    }
  }
};

export default config;
