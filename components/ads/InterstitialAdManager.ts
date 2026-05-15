export class InterstitialAdManager {
  static load() {
    // No-op on web
  }

  static async show(): Promise<boolean> {
    // Always return false on web
    return false;
  }

  static isReady(): boolean {
    return false;
  }
}
