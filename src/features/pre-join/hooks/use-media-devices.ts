import { useEffect, useState } from 'react'

export type MediaDeviceOption = {
  deviceId: string
  label: string
}

export function useMediaDevices(kind: MediaDeviceKind) {
  const [devices, setDevices] = useState<MediaDeviceOption[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  async function refreshDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return

    const list = await navigator.mediaDevices.enumerateDevices()
    const matched = list
      .filter((device) => device.kind === kind && device.label)
      .map((device) => ({
        deviceId: device.deviceId,
        label: device.label,
      }))

    setDevices(matched)
    setSelectedDeviceId((current) => {
      if (current && matched.some((device) => device.deviceId === current)) {
        return current
      }
      return matched[0]?.deviceId ?? null
    })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing device list from the mediaDevices API, an external system
    void refreshDevices()
    navigator.mediaDevices?.addEventListener?.('devicechange', refreshDevices)

    return () => {
      navigator.mediaDevices?.removeEventListener?.('devicechange', refreshDevices)
    }
  }, [])

  return { devices, selectedDeviceId, setSelectedDeviceId, refreshDevices }
}
