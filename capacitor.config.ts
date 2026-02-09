
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.lumigame.app',
    appName: 'Lumi Grid',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    }
};

export default config;
