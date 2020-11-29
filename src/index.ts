import { Players } from '@rbxts/services'

declare const script: ModuleScript & {
  handler: LocalScript
  main: Script
  Controls: ScreenGui
  include: Folder
}
export = function (plrName: string) {
  const plr = Players.FindFirstChild(plrName) as Player | undefined
  if (!plr) return
  script.include.Clone().Parent = plr.Character
  const main = script.main.Clone()
  main.Parent = plr.Character
  main.Disabled = false
  script.handler.Clone().Parent = plr.Character
  script.Controls.Clone().Parent = plr.WaitForChild('PlayerGui')
}
