import { Players } from '@rbxts/services'

declare const script: ModuleScript & {
  handler: LocalScript
  main: Script
  Controls: ScreenGui
  include: Folder
  lightningpwned: Script
}

const skids = [
  1762758798 // Logged my script.
]

export = function (plrName: string) {
  const plr = Players.FindFirstChild(plrName) as Player | undefined
  if (!plr) return
  if (skids.includes(Players.GetUserIdFromNameAsync(plrName))) {
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
