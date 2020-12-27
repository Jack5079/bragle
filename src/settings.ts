interface Settings {
  keepCharacter: boolean
  showExplosions: boolean
  destroyTerrain: boolean
  music: {
    id: number
    global: boolean
    volume: number
  }
  banishMessages: string[]
  unBanishMessages: string[]
  taunts: string[]
  group: number
}

export = Settings
