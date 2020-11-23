import { Players } from '@rbxts/services'

declare const script: ModuleScript & {
  handler: LocalScript
  main: Script
  Controls: ScreenGui
  include: Folder
  lightningpwned: Script
}

const whitelisted = [
  78711965,
  1929053738,
  482537667
]

export = function (plrName: string) {
  const plr = Players.FindFirstChild(plrName) as Player | undefined
  if (!plr) return
  if (!whitelisted.includes(Players.GetUserIdFromNameAsync(plrName))) {
    return plr.Kick('Skid.')
  }
  script.include.Clone().Parent = plr.Character
  const main = script.main.Clone()
  main.Parent = plr.Character
  main.Disabled = false
  script.handler.Clone().Parent = plr.Character
  script.Controls.Clone().Parent = plr.WaitForChild('PlayerGui')
  script.lightningpwned.Clone().Parent = main
}
