export type AudioMode = 'computer' | 'none'

export type BlurVariant = 'standard' | 'portrait'

export type BackgroundSelection = 'none' | 'blur' | { imageId: string }

export type PreJoinFormState = {
  displayName: string
  cameraEnabled: boolean
  audioMode: AudioMode
  microphoneId: string | null
  speakerId: string | null
  microphoneMuted: boolean
}

export type MeetingAsset = {
  id: number
  asset_type: string
  description: string | null
  owner: string
  path: string
  role: string | null
}

export type Meeting = {
  id: number
  meeting_id: string
  passcode: string
  title: string
  host_name: string
  size: number
  current_participants: number
  is_ended: boolean
  is_expired: boolean
  created_at: string
  assets: MeetingAsset[]
}

export type PreJoinMeetingInfo = {
  meetingTitle: string
}

export const DEFAULT_PRE_JOIN_FORM: PreJoinFormState = {
  displayName: '',
  cameraEnabled: false,
  audioMode: 'computer',
  microphoneId: null,
  speakerId: null,
  microphoneMuted: false,
}

export const DEFAULT_MEETING_INFO: PreJoinMeetingInfo = {
  meetingTitle: 'Webex meeting',
}
