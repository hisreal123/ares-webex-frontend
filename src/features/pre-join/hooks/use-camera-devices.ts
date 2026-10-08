import { useEffect, useState } from 'react'

export type CameraDevice = {
  deviceId: string
  label: string
}

export function useCameraDevices() {
  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)

  async function refreshDevices() {
    if (!navigator.mediaDevices?.enumerateDevices) return

    const list = await navigator.mediaDevices.enumerateDevices()
    const cameras = list
      .filter((device) => device.kind === 'videoinput')
      .map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || (index === 0 ? 'Integrated Webcam' : `Camera ${index + 1}`),
      }))

    setDevices(cameras)
    setSelectedDeviceId((current) => {
      if (current && cameras.some((camera) => camera.deviceId === current)) {
        return current
      }
      return cameras[0]?.deviceId ?? null
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
