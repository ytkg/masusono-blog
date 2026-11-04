import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { requestJson } from "@/shared/lib/fetchJson"
import { getWebPushState, subscribeToWebPush, unsubscribeFromWebPush } from "./webPush"

vi.mock("@/shared/lib/fetchJson", () => ({ requestJson: vi.fn() }))

describe("Web Pushの購読状態", () => {
  let subscription
  let browserSubscription
  let serverSubscribed
  let saveError
  let pushManager

  beforeEach(() => {
    vi.stubEnv("DEV", false)
    serverSubscribed = false
    browserSubscription = null
    saveError = null
    subscription = {
      endpoint: "https://fcm.googleapis.com/fcm/send/example?token=a&b=c",
      toJSON: () => ({ endpoint: subscription.endpoint, keys: { p256dh: "key", auth: "auth" } }),
      unsubscribe: vi.fn(async () => {
        browserSubscription = null
        return true
      }),
    }
    pushManager = {
      getSubscription: vi.fn(async () => browserSubscription),
      subscribe: vi.fn(async () => {
        browserSubscription = subscription
        return subscription
      }),
    }
    vi.stubGlobal("navigator", { serviceWorker: { ready: Promise.resolve({ pushManager }) } })
    vi.stubGlobal("PushManager", function () {})
    vi.stubGlobal("Notification", { permission: "granted", requestPermission: vi.fn().mockResolvedValue("granted") })
    requestJson.mockReset()
    requestJson.mockImplementation(async (url, options) => {
      if (url.endsWith("vapid_key.json")) return { publicKey: "AQID" }
      if (options?.method === "POST") {
        if (saveError) throw saveError
        serverSubscribed = true
        return { id: "subscription-id" }
      }
      if (options?.method === "DELETE") {
        serverSubscribed = false
        return null
      }
      return { subscribed: serverSubscribed }
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it("ブラウザ側に購読がなければサーバー確認なしでOFFになる", async () => {
    expect(await getWebPushState()).toEqual({ supported: true, subscribed: false, permission: "granted" })
    expect(requestJson).not.toHaveBeenCalled()
  })

  it("ブラウザとサーバーの両方に登録されていればONになる", async () => {
    browserSubscription = subscription
    serverSubscribed = true

    expect((await getWebPushState()).subscribed).toBe(true)
    expect(requestJson).toHaveBeenCalledWith(
      `/api/app/web_push/subscription.json?${new URLSearchParams({ endpoint: subscription.endpoint })}`,
    )
  })

  it("サーバー保存失敗後に開き直してもOFFになり、残った購読で再登録できる", async () => {
    saveError = new Error("upstream unavailable")

    await expect(subscribeToWebPush()).rejects.toThrow("upstream unavailable")
    expect(browserSubscription).toBe(subscription)
    expect((await getWebPushState()).subscribed).toBe(false)

    saveError = null
    expect((await subscribeToWebPush()).subscribed).toBe(true)
    expect((await getWebPushState()).subscribed).toBe(true)
    expect(pushManager.subscribe).toHaveBeenCalledOnce()
  })

  it("ブラウザ側の解除が失敗してもサーバー削除後の再表示はOFFになる", async () => {
    browserSubscription = subscription
    serverSubscribed = true
    subscription.unsubscribe.mockRejectedValue(new Error("browser unsubscribe failed"))

    expect((await unsubscribeFromWebPush()).subscribed).toBe(false)
    expect(browserSubscription).toBe(subscription)
    expect((await getWebPushState()).subscribed).toBe(false)

    expect((await subscribeToWebPush()).subscribed).toBe(true)
    expect((await getWebPushState()).subscribed).toBe(true)
  })

  it("サーバー削除失敗時は購読を維持する", async () => {
    browserSubscription = subscription
    serverSubscribed = true
    requestJson.mockRejectedValueOnce(new Error("delete failed"))

    await expect(unsubscribeFromWebPush()).rejects.toThrow("delete failed")
    expect(subscription.unsubscribe).not.toHaveBeenCalled()
    expect((await getWebPushState()).subscribed).toBe(true)
  })

  it("確認APIの失敗を購読中や未購読として扱わない", async () => {
    browserSubscription = subscription
    requestJson.mockRejectedValueOnce(new Error("lookup failed"))

    await expect(getWebPushState()).rejects.toThrow("lookup failed")
  })
  it.each(["denied", "default"])("通知許可が%sなら鍵取得や購読を開始しない", async (permission) => {
    Notification.requestPermission.mockResolvedValue(permission)
    expect(await subscribeToWebPush()).toEqual({ supported: true, subscribed: false, permission })
    expect(requestJson).not.toHaveBeenCalled()
    expect(pushManager.subscribe).not.toHaveBeenCalled()
  })

  it("購読が既になければサーバー削除やブラウザ解除を呼ばない", async () => {
    expect(await unsubscribeFromWebPush()).toEqual({ supported: true, subscribed: false, permission: "granted" })
    expect(requestJson).not.toHaveBeenCalled()
    expect(subscription.unsubscribe).not.toHaveBeenCalled()
  })

  it("開発環境ではサービスワーカーの準備を待たず非対応を返す", async () => {
    vi.stubEnv("DEV", true)
    expect(await getWebPushState()).toEqual({ supported: false, subscribed: false, permission: "unsupported" })
    expect(pushManager.getSubscription).not.toHaveBeenCalled()
    expect(requestJson).not.toHaveBeenCalled()
  })

  it("PushManagerがないブラウザでは非対応を返す", async () => {
    vi.stubGlobal("PushManager", undefined)
    // The support contract checks property presence; remove it to emulate an unsupported browser.
    delete window.PushManager
    expect(await getWebPushState()).toEqual({ supported: false, subscribed: false, permission: "unsupported" })
    expect(requestJson).not.toHaveBeenCalled()
  })
})
