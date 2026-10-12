export type BackgroundOption = {
  id: string
  label: string
  thumbnailSrc: string
  fullSrc: string
}

const B = '/assets/backgrounds-webex/'

export const backgroundOptions: BackgroundOption[] = [
  { id: 'boardroomCollected', label: 'Boardroom', thumbnailSrc: `${B}boardroom-collected-thumbnail.png`, fullSrc: `${B}full/boardroom-collected.png` },
  { id: 'homeOfficeSerene', label: 'Serene Home Office', thumbnailSrc: `${B}home-office-serene-thumbnail.png`, fullSrc: `${B}full/home-office-serene.png` },
  { id: 'studioVibrant', label: 'Vibrant Studio', thumbnailSrc: `${B}studio-vibrant-thumbnail.png`, fullSrc: `${B}full/studio-vibrant.png` },
  { id: 'commonRoomRadiant', label: 'Radiant Common Room', thumbnailSrc: `${B}common-room-radiant-thumbnail.png`, fullSrc: `${B}full/common-room-radiant.png` },
  { id: 'commonRoomQuiet', label: 'Quiet Common Room', thumbnailSrc: `${B}common-room-quiet-thumbnail.png`, fullSrc: `${B}full/common-room-quiet.png` },
  { id: 'openSpaceLively', label: 'Lively Open Space', thumbnailSrc: `${B}open-space-lively-thumbnail.png`, fullSrc: `${B}full/open-space-lively.png` },
  { id: 'daylight', label: 'Daylight', thumbnailSrc: `${B}daylight-thumbnail.png`, fullSrc: `${B}full/daylight.png` },
  { id: 'homeOffice', label: 'Home Office', thumbnailSrc: `${B}home_office-thumbnail.jpg`, fullSrc: `${B}full/home_office.jpg` },
  { id: 'lookout', label: 'Lookout', thumbnailSrc: `${B}lookout-thumbnail.png`, fullSrc: `${B}full/lookout.png` },
]
