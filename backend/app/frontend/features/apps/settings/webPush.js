import { requestJson } from "@/shared/lib/fetchJson"

function urlBase64ToUint8Array(value) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4)
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = window.atob(base64)
  return Uint8Array.from(raw, (character) => character.charCodeAt(0))
}

export function isWebPushSupported() {
  if (import.meta.env.DEV) return false

  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window
}

export async function getWebPushState() {
  if (!isWebPushSupported()) return { supported: false, subscribed: false, permission: "unsupported" }

  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return { supported: true, subscribed: false, permission: Notification.permission }

  const { subscribed } = await requestJson(
    `/api/app/web_push/subscription.json?${new URLSearchParams({ endpoint: subscription.endpoint })}`,
  )
  return { supported: true, subscribed, permission: Notification.permission }
}

export async function subscribeToWebPush() {
  const permission = await Notification.requestPermission()
  if (permission !== "granted") return { supported: true, subscribed: false, permission }

  const registration = await navigator.serviceWorker.ready
  const { publicKey } = await requestJson("/api/app/web_push/vapid_key.json")
  const subscription =
    (await registration.pushManager.getSubscription()) ||
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    }))

  await requestJson("/api/app/web_push/subscription.json", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  })

  return { supported: true, subscribed: true, permission: "granted" }
}

export async function unsubscribeFromWebPush() {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.getSubscription()
  if (!subscription) return { supported: true, subscribed: false, permission: Notification.permission }

  await requestJson("/api/app/web_push/subscription.json", {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ endpoint: subscription.endpoint }),
  })

  try {
    await subscription.unsubscribe()
  } catch (_error) {
    // サーバー側の配信対象からは削除済み。Safari側の解除失敗は再購読時に上書きできる。
  }

  return { supported: true, subscribed: false, permission: Notification.permission }
}
