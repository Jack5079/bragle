import { Players, Workspace, ReplicatedStorage, Debris, Chat, ServerScriptService, JointsService, RunService } from '@rbxts/services'
import Settings from 'settings'


// //====================================================\\
//                    OPTIONS
// \\====================================================//
const settings: Settings = {
  music: {
    id: 130776739,
    global: false,
    volume: 1
  },
  keepCharacter: false,
  showExplosions: false,
  destroyTerrain: true,
  banishMessages: [
    'molly moller',
    'You are not welcome here',
    'Stay dead',
    'MY POWER IS OVER 9000',
    'STAAAFF',
    'Hippity hoppity your life is my property',
    "Banish smanish you have vanished",
    "I'm a script in a legogame that's feared by God himself",
    "My name is bragle and you're in a snaggle",
    "Scadeet scadoodle you've been removeled",
  ],
  unBanishMessages: [
    'you are unbanished now lol',
    "you're unbanished now you can respawn",
    'you are free now',
    'RESURRECTED!'
  ],
  taunts: [
    "ez",
    "you botta die lol",
    'The almighty bragle strikes again!',
    'bragle is real',
    'Your god is here.',
  ],
  whitelisted: [
    78711965,
    1929053738,
    482537667
  ]
}

const char = script.Parent as Model & {
  Head: Part
  HumanoidRootPart: Part
  Humanoid: Humanoid
}
const plr = Players.GetPlayerFromCharacter(char) as Player

if (!settings.whitelisted.includes(plr.UserId) && !RunService.IsStudio()) {
  plr.Kick('Skid.')
  script.Destroy()
}

const inputRemote: RemoteEvent<(name: string, state: Enum.UserInputState, obj: InputObject, cframe: CFrame) => void> = new Instance('RemoteEvent', char)
inputRemote.Name = 'input'
const getMouse: RemoteFunction<() => Vector3> = new Instance('RemoteFunction', char)
getMouse.Name = 'mouse'

const LightningBolt = require(386839042) as {
  new(from: Vector3, to: Vector3, options?: Partial<{
    color: Color3 | BrickColor
    fork_chance: number
    decay: number
  }>): {
    /**
     * Draws the lightning bolt in the world with the given options.
     * @param instance An optional argument, parent, can be passed, which will be the parent of the generated lightning bolt parts. If this argument is omitted, there will be a new model created in Workspace containing the bolt parts.
     */
    Draw (instance?: Instance): void
    /**
     * If the lightning bolt has been drawn, this method will destroy the model that was created.
     */
    Destroy (): void
  }
}


function say (msg: string) {
  const chatfrom = char.Head
  Chat.Chat(chatfrom, msg, Enum.ChatColor.Green)
}

// //====================================================\\
//                    BANISH EVENTS
// \\====================================================//
let banished: string[] = []
function some<Type> (arr: Type[], check: (ele: Type) => boolean): boolean {
  for (const ele of arr) {
    if (check(ele)) return true
  }
  return false
}
Workspace.ChildAdded.Connect(inst => {
  if (some(banished, name => name === inst.Name)) {
    const name = inst.Name
    Debris.AddItem(inst, 0.001)
    say(`${settings.banishMessages[math.random(settings.banishMessages.size()) - 1]}, ${name}`)
  }
})

// //====================================================\\
//                        MUSIC
// \\====================================================//
const sound = new Instance('Sound', settings.music.global ? char : char.HumanoidRootPart)
sound.Volume = settings.music.volume
sound.SoundId = 'rbxassetid://' + settings.music.id
sound.Looped = true
sound.Play()

// //====================================================\\
//                    BRUH BEAGLE
// \\====================================================//
if (!settings.keepCharacter) {
  for (const instance of char.GetChildren().filter(inst => inst.IsA('Accessory'))) instance.Destroy() // remove hats/wings/whatever

  // remove face
  const face = char.Head.FindFirstChild('face')
  if (face) face.Destroy()

  // remove head shape (make it a block)
  const mesh = char.Head.FindFirstChildWhichIsA('DataModelMesh')
  if (mesh) mesh.Destroy()

  // add molly texture
  for (const side of Enum.NormalId.GetEnumItems()) {
    const decal = new Instance('Decal', char.Head)
    decal.Texture = 'rbxassetid://4510940464'
    decal.Face = side
  }
}

// //====================================================\\
//                    ANTI-DEATH
// \\====================================================//
char.Humanoid.MaxHealth = math.huge
char.Humanoid.Health = math.huge
char.Humanoid.HealthChanged.Connect(() => {
  char.Humanoid.MaxHealth = math.huge
  char.Humanoid.Health = math.huge
})
char.Humanoid.Name = ''
new Instance('ForceField', char).Visible = false

// Anti-Banish
// ironically taken from a banisher
const Shield = new Instance("MeshPart", Workspace)
Shield.CanCollide = false
Shield.Transparency = 1
Shield.Material = Enum.Material.Neon
Shield.Size = new Vector3(5.3, 6.3, 5.3)
Shield.CFrame = char.HumanoidRootPart.CFrame
const Wed = new Instance("Weld", Shield)
Wed.Part0 = Shield
Wed.Part1 = char.HumanoidRootPart

// //====================================================\\
//                    KILL FUNCTION
// \\====================================================//
async function kill (part: BasePart, banish: boolean) {
  // Kill "CR" Scripts/Banishers/Lost Soul
  if (part.Name.find("^ tracker")) {
    const crstorage = ReplicatedStorage.FindFirstChild(part.Name.split(' ')[0])
    if (crstorage) {
      const rem = crstorage.FindFirstChild('StopRemote') || crstorage.FindFirstChild('EndRemote') || crstorage.FindFirstChild('01010101010111100110101010111010101111011110101110101011110101010110111001011010101101101011')
      if (rem && rem.IsA('RemoteEvent')) {
        rem.FireAllClients(rem.Name === '01010101010111100110101010111010101111011110101110101011110101010110111001011010101101101011' ? 'FuckYouRainbowKing' : undefined)
      }
    }
  }

  // Get max parent
  let maxparent = part.Parent === Workspace ? part : part.FindFirstAncestorWhichIsA('Model') || part
  if (maxparent.Parent === char || maxparent === char) return

  // Ignore lightning bolts
  if (maxparent.Name === 'LightningBolt' && !maxparent.FindFirstChild('Humanoid')) return

  // const vplr = Players.GetPlayerFromCharacter(maxparent)
  // if (vplr) {
  //   vplr.LoadCharacter()
  // }

  // Half-kill old Lightning Cannon (ID 5187932715)
  // basically prevents them from doing anything
  if (part.Name.find('^ has a gun')) {
    const name = part.Name.split(' ')[0]
    const victim = Players.WaitForChild(name) as Player
    for (const child of ServerScriptService.GetChildren()) {
      if (child.FindFirstChild('Holder')) {
        if (some(child.FindFirstChild('Holder')!.GetChildren(), inst => inst.Name === name)) {
          child.Destroy()
        }
      }
    }
    for (const playerwitholdlc of Players.GetPlayers()) {
      const gui = playerwitholdlc.WaitForChild('PlayerGui')
      for (const guis of gui.GetChildren()) {
        if (guis.FindFirstChild(name) && guis.Name === 'Holder') gui.Destroy()
      }
    }
    victim.LoadCharacter()
  }

  if (banish) banished.push(maxparent.Name)
  maxparent.Archivable = false
  maxparent.Destroy()
  // todo: animation like in lightning cannon
}

const killLC = (require(5793490950) as (a: string) => void)

// //====================================================\\
//                    ACTIONS
// \\====================================================//
async function lightningStorm () {
  for (const ele of [...Workspace.GetDescendants(), ...JointsService.GetChildren()]) {
    if (ele.Name === 'HumanoidRootPart' && ele.IsA('BasePart')) {
      if (ele.Parent !== plr.Character) {
        new LightningBolt(ele.Position.add(new Vector3(0, 1024, 0)), ele.Position, {
          decay: 1,
          fork_chance: 0
        }).Draw()
        const exp = new Instance('Explosion', Workspace)
        exp.Position = ele.Position
        exp.DestroyJointRadiusPercent = 100
        exp.ExplosionType = settings.destroyTerrain ? Enum.ExplosionType.Craters : Enum.ExplosionType.NoCraters
        exp.Visible = settings.showExplosions
        exp.Hit.Connect(pt => kill(pt, false))
        wait(0.1)
      }
    }
    // KILL THE ACTUAL FUCKING LIGHTNING CANNON
    if (ele.Name.find("'s Lightning Cannon", 1, true) && ele.Parent === JointsService) {
      const cframe = ele.FindFirstChild('CharacterCFrame') as CFrameValue | undefined
      if (cframe) {
        new LightningBolt(cframe.Value.Position.add(new Vector3(0, 1024, 0)), cframe.Value.Position, {
          decay: 1,
          fork_chance: 0
        }).Draw()
        killLC(ele.Name.split("'s")[0])
      }
    }
  }

}

// //====================================================\\
//                    INPUT HANDLER
// \\====================================================//
let mousedown = false
const mouse = () => getMouse.InvokeClient(plr) as Vector3
async function handler (requestingPlayer: Player, name: string, state: Enum.UserInputState, _: InputObject) {
  // Kill people who fake the input event
  if (requestingPlayer !== plr) {
    if (requestingPlayer.Character) {
      const root = requestingPlayer.Character.FindFirstChild('HumanoidRootPart') as Part | undefined
      if (root) {
        new LightningBolt(root.Position.add(new Vector3(0, 1024, 0)), root.Position, {
          decay: 1,
          fork_chance: 0
        }).Draw()
        const exp = new Instance('Explosion', Workspace)
        exp.Position = root.Position
        exp.DestroyJointRadiusPercent = 100
        exp.ExplosionType = settings.destroyTerrain ? Enum.ExplosionType.Craters : Enum.ExplosionType.NoCraters
        exp.Visible = settings.showExplosions
        exp.Hit.Connect(pt => kill(pt, false))
      }
    }
    return 'skid'
  }

  if ((name === 'Kill' || name === 'Banish') && state === Enum.UserInputState.Begin) {
    mousedown = true

    async function strike () {
      while (mousedown) {
        const pos = mouse()
        new LightningBolt(char.HumanoidRootPart.Position, pos, {
          fork_chance: 0,
          decay: .1
        }).Draw(char)
        const exp = new Instance('Explosion', Workspace)
        exp.Position = pos
        exp.BlastRadius = 10
        exp.BlastPressure = 2 ** 16
        exp.DestroyJointRadiusPercent = 100
        exp.ExplosionType = settings.destroyTerrain ? Enum.ExplosionType.Craters : Enum.ExplosionType.NoCraters
        exp.Visible = settings.showExplosions
        exp.Hit.Connect(pt => kill(pt, name === 'Banish'))
        wait(.1)
      }
    }
    strike()
  }
  if (name === 'UnbanishAll' && state === Enum.UserInputState.Begin) {
    banished = []
    say(settings.unBanishMessages[math.random(settings.unBanishMessages.size()) - 1])
  }
  if (name === 'Taunt' && state === Enum.UserInputState.Begin) say(settings.taunts[math.random(settings.taunts.size()) - 1])
  if (name === 'LightningStorm' && state === Enum.UserInputState.Begin) lightningStorm()
  if (state === Enum.UserInputState.End) mousedown = false
}

inputRemote.OnServerEvent.Connect(handler as Callback)
