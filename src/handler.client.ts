import { ContextActionService, Players } from '@rbxts/services'
declare const script: LocalScript & { Parent: Model }
const input = script.Parent.WaitForChild('input') as RemoteEvent<(name: string, state: Enum.UserInputState, obj: InputObject) => void>
const handler = (name: string, state: Enum.UserInputState, obj: InputObject) => {
  input.FireServer(name, state, obj)
}
ContextActionService.BindAction('Kill', handler, false, Enum.KeyCode.E)
ContextActionService.BindAction('Banish', handler, false, Enum.KeyCode.Q)
ContextActionService.BindAction('UnbanishAll', handler, true, Enum.KeyCode.F)
ContextActionService.BindAction('Taunt', handler, true, Enum.KeyCode.R)
ContextActionService.BindAction('LightningStorm', handler, true, Enum.KeyCode.L)

const mouse = script.Parent.WaitForChild('mouse') as RemoteFunction<() => Vector3>

mouse.OnClientInvoke = () => Players.LocalPlayer.GetMouse().Hit.Position
