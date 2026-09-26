/**
 * RevenueCat wiring.
 *
 * Product: a ONE-TIME, non-consumable unlock ("exitkit_pack_unlock") - you pay
 * once to export the polished PDF handover pack. No subscription: a move-out
 * is an episodic event and a subscription would be the wrong shape.
 *
 * Entitlement: "handover_pack".
 *
 * Hackathon demo: configured against the RevenueCat Test Store, so the
 * purchase flow is a genuine SDK purchase + entitlement grant (not a fake
 * modal) without real charges. Setup steps are in the README.
 */
import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';

export const ENTITLEMENT_ID = 'handover_pack';
export const PRODUCT_ID = 'exitkit_pack_unlock';
export const TEST_STORE_API_KEY = 'test_YourTestStoreApiKeyHere'; // replaced during setup, see README

export async function configurePurchases(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return; // web preview runs without the SDK
  await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
  await Purchases.configure({ apiKey: TEST_STORE_API_KEY });
}

export async function hasUnlock(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) return false;
  const { customerInfo } = await Purchases.getCustomerInfo();
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
}

export async function buyUnlock(): Promise<boolean> {
  const offerings = await Purchases.getOfferings();
  const pkg = offerings.current?.availablePackages.find((p) => p.product.identifier === PRODUCT_ID)
    ?? offerings.current?.availablePackages[0];
  if (!pkg) throw new Error('No ExitKit package found in the current RevenueCat offering');
  const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
}

export async function restoreUnlock(): Promise<boolean> {
  const { customerInfo } = await Purchases.restorePurchases();
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
}
