import { Players, Workspace, ReplicatedStorage, Debris, Chat, ServerScriptService } from '@rbxts/services'

// //====================================================\\
//                    OPTIONS
// \\====================================================//
const settings = {
  music: {
    id: 130776739,
    global: false,
    volume: 1
  },
  keepCharacter: false,
  showExplosions: false,
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
  ]
}

const char = script.Parent as Model & {
  Head: Part
  HumanoidRootPart: Part
  Humanoid: Humanoid
}
const plr = Players.GetPlayerFromCharacter(char) as Player

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
  for (const instance of char.GetChildren()) {
    // if (instance.IsA('BasePart') && instance.Name !== 'HumanoidRootPart') {
    //   instance.Transparency = 1
    // }
    // if (char.Humanoid.RigType === Enum.HumanoidRigType.R6) {
    //   if (instance.Name.endsWith(' Leg')) instance.Destroy()
    // }
    if (instance.IsA('Accessory')) instance.Destroy()
  }
  const face = char.Head.FindFirstChild('face')
  if (face) face.Destroy()

  const mesh = char.Head.FindFirstChildWhichIsA('DataModelMesh')
  if (mesh) mesh.Destroy()
  
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

function endsWith (str: string, search: string, this_len = str.size()) {
  if (this_len === undefined || this_len > str.size()) {
    this_len = str.size()
  }
  return str.sub(this_len - search.size(), this_len) === search
}
// //====================================================\\
//                    KILL FUNCTION
// \\====================================================//
async function kill (part: BasePart, banish: boolean) {
  // Kill CR Scripts/Banishers/Lost Soul
  if (endsWith(part.Name, " tracker")) {
    const crstorage = ReplicatedStorage.FindFirstChild(part.Name.split(' ')[0])
    if (crstorage) {
      const rem = crstorage.FindFirstChild('StopRemote')
      if (rem && rem.IsA('RemoteEvent')) {
        rem.FireAllClients()
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

  if (banish) banished.push(maxparent.Name)
  maxparent.Destroy()
  // todo: animation like in lightning cannon
}

// //====================================================\\
//                    ACTIONS
// \\====================================================//
async function lightningStorm () {
  for (const ele of Workspace.GetDescendants()) {
    if (ele.Name === 'HumanoidRootPart' && ele.IsA('BasePart')) {
      if (ele.Parent !== plr.Character) {
        new LightningBolt(ele.Position.add(new Vector3(0, 1024, 0)), ele.Position, {
          decay: 1,
          fork_chance: 0
        }).Draw()
        const exp = new Instance('Explosion', Workspace)
        exp.Position = ele.Position
        exp.DestroyJointRadiusPercent = 100
        exp.ExplosionType = Enum.ExplosionType.NoCraters
        exp.Visible = settings.showExplosions
        exp.Hit.Connect(pt => kill(pt, false))
        wait(0.1)
      }
    }
  }
}

function smitePlayer (player: Player) {
  if (player === plr) return
  if (player.Character) {
    const root = player.Character.FindFirstChild('HumanoidRootPart') as Part | undefined
    if (root) {
      new LightningBolt(root.Position.add(new Vector3(0, 1024, 0)), root.Position, {
        decay: 1,
        fork_chance: 0
      }).Draw()
      const exp = new Instance('Explosion', Workspace)
      exp.Position = root.Position
      exp.DestroyJointRadiusPercent = 100
      exp.ExplosionType = Enum.ExplosionType.NoCraters
      exp.Visible = settings.showExplosions
      exp.Hit.Connect(pt => kill(pt, false))
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
  if (requestingPlayer !== plr) return smitePlayer(requestingPlayer)

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
        exp.ExplosionType = Enum.ExplosionType.NoCraters
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
  if (name === 'Taunt' && state === Enum.UserInputState.Begin) {
    say(settings.taunts[math.random(settings.taunts.size()) - 1])
  }
  if (name === 'LightningStorm' && state === Enum.UserInputState.Begin) {
    lightningStorm()
  }
  if (state === Enum.UserInputState.End) {
    mousedown = false
  }
}

inputRemote.OnServerEvent.Connect(handler as Callback)
