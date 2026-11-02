import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Capacitor-Konfiguration: verpackt das gebaute React-Frontend (`dist/`) als iOS-App.
 * Die App-ID ist ein Platzhalter und muss vor einer Veröffentlichung festgelegt werden.
 */
const config: CapacitorConfig = {
  appId: 'de.nori.buchhaltung',
  appName: 'nori.',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    backgroundColor: '#FBFAF7',
  },
}

export default config
